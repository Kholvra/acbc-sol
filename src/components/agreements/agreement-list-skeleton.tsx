'use client';

export function AgreementListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-24 bg-gray-200 rounded-full animate-pulse" />
              </div>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="text-right space-y-2">
              <div className="h-7 w-32 bg-gray-200 rounded animate-pulse ml-auto" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse ml-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
