import { Suspense } from "react";
import { SpacesContent } from "./spaces-content";
import { PageLoader } from "@/components/LoadingSpinner";

export default function SpacesPage() {
  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-16">
      <Suspense fallback={<PageLoader />}>
        <SpacesContent />
      </Suspense>
    </main>
  );
}
