export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4 border",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-2",
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`spinner ${sizeClasses[size]}`} />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

