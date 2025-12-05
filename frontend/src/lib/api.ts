// API client for Infinity8 backend
import { supabase } from "./supabase";

// Handle API URL for both server-side and client-side rendering
const getApiBaseUrl = () => {
  // For server-side rendering in Docker, use the internal network URL
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_API_BASE_URL || "http://backend:8000";
  }
  // For client-side, use localhost or the public URL
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
};

const API_BASE_URL = getApiBaseUrl();

// Get current access token from Supabase
async function getAccessToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// Types
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: "user" | "admin";
  is_active: boolean;
  created_at: string;
}

export interface Space {
  id: number;
  name: string;
  type: string;
  description: string | null;
  capacity: number;
  price_per_hour: number;
  price_per_day: number | null;
  price_per_month: number | null;
  location: string;
  floor: string | null;
  amenities: string[];
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Booking {
  id: number;
  user_id: number;
  space_id: number;
  start_time: string;
  end_time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  total_price: number;
  notes: string | null;
  created_at: string;
  space?: Space;
  user?: User;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface SpaceAvailability {
  space_id: number;
  date: string;
  available_slots: TimeSlot[];
}

export interface DashboardStats {
  total_spaces: number;
  total_users: number;
  bookings_today: number;
  revenue_this_month: number;
  bookings_last_7_days: number;
}

// API Error
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// Helper function for API calls
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new ApiError(response.status, error.detail || "Request failed");
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Auth API - Now handled by Supabase, but we still need to get user from backend
export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>("/auth/me");
}

// Spaces API
export async function fetchSpaces(params?: {
  type?: string;
  location?: string;
  min_capacity?: number;
  max_price?: number;
}): Promise<Space[]> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.append("type", params.type);
  if (params?.location) searchParams.append("location", params.location);
  if (params?.min_capacity) searchParams.append("min_capacity", params.min_capacity.toString());
  if (params?.max_price) searchParams.append("max_price", params.max_price.toString());

  const query = searchParams.toString();
  return apiRequest<Space[]>(`/spaces${query ? `?${query}` : ""}`);
}

export async function getSpace(id: number): Promise<Space> {
  return apiRequest<Space>(`/spaces/${id}`);
}

export async function getSpaceAvailability(spaceId: number, date: string): Promise<SpaceAvailability> {
  return apiRequest<SpaceAvailability>(`/spaces/${spaceId}/availability?date=${date}`);
}

// Admin Spaces API
export async function createSpace(data: Omit<Space, "id" | "created_at" | "is_active">): Promise<Space> {
  return apiRequest<Space>("/spaces", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSpace(id: number, data: Partial<Space>): Promise<Space> {
  return apiRequest<Space>(`/spaces/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteSpace(id: number): Promise<void> {
  return apiRequest<void>(`/spaces/${id}`, { method: "DELETE" });
}

// Bookings API
export async function getMyBookings(params?: {
  status?: string;
  upcoming_only?: boolean;
}): Promise<Booking[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append("status", params.status);
  if (params?.upcoming_only) searchParams.append("upcoming_only", "true");

  const query = searchParams.toString();
  return apiRequest<Booking[]>(`/bookings/me${query ? `?${query}` : ""}`);
}

export async function createBooking(data: {
  space_id: number;
  start_time: string;
  end_time: string;
  notes?: string;
}): Promise<Booking> {
  return apiRequest<Booking>("/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function cancelBooking(id: number): Promise<void> {
  return apiRequest<void>(`/bookings/${id}`, { method: "DELETE" });
}

// Admin API
export async function getDashboardStats(): Promise<DashboardStats> {
  return apiRequest<DashboardStats>("/admin/stats");
}

export async function getAllBookings(params?: {
  status?: string;
  space_id?: number;
  user_id?: number;
  date_from?: string;
  date_to?: string;
}): Promise<Booking[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append("status", params.status);
  if (params?.space_id) searchParams.append("space_id", params.space_id.toString());
  if (params?.user_id) searchParams.append("user_id", params.user_id.toString());
  if (params?.date_from) searchParams.append("date_from", params.date_from);
  if (params?.date_to) searchParams.append("date_to", params.date_to);

  const query = searchParams.toString();
  return apiRequest<Booking[]>(`/admin/bookings${query ? `?${query}` : ""}`);
}

export async function getAllUsers(): Promise<User[]> {
  return apiRequest<User[]>("/admin/users");
}

// Chat API
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  response: string;
  conversation_history: ChatMessage[];
}

export async function chatWithAgent(
  message: string,
  conversationHistory?: ChatMessage[]
): Promise<ChatResponse> {
  return apiRequest<ChatResponse>("/agent/chat", {
    method: "POST",
    body: JSON.stringify({
      message,
      conversation_history: conversationHistory || [],
    }),
  });
}

export async function getAgentStatus(): Promise<{ status: string; message: string }> {
  return apiRequest<{ status: string; message: string }>("/agent/status");
}
