export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeConfig = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-3",
  };

  const config = sizeConfig[size];

  return (
    <div className="flex items-center justify-center">
      <div className={`${config} border-slate-200 border-t-blue-600 rounded-full animate-spin`} />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-emerald-50" />
          <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-xl">∞</span>
          </div>
        </div>
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  );
}
