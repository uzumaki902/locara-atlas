export default function Loading() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen md:h-screen overflow-x-hidden md:overflow-hidden bg-background">
      {/* ─── LEFT SIDEBAR SKELETON ─── */}
      <aside className="w-full md:w-[340px] lg:w-[380px] md:min-w-[340px] lg:min-w-[380px] flex flex-col border-b md:border-b-0 md:border-r border-border bg-background flex-shrink-0 animate-pulse">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-border">
          <div className="h-5 bg-surface rounded-md w-3/4 mb-2"></div>
          <div className="h-4 bg-surface rounded-md w-1/4"></div>

          {/* Dataset Overview Cards Skeleton */}
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-surface border border-border rounded-lg p-3 flex flex-col">
                <div className="h-3 bg-border rounded w-1/2 mb-2"></div>
                <div className="h-5 bg-border rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Filter Skeleton */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-16 bg-surface rounded-md border border-border"></div>
            ))}
          </div>
        </div>

        {/* Search Skeleton */}
        <div className="px-4 pb-3">
          <div className="w-full h-9 bg-surface border border-border rounded-lg"></div>
        </div>

        {/* Video List Skeleton */}
        <div className="flex-1 px-3 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-full rounded-lg px-3 py-3 border border-border bg-surface/50">
              <div className="flex justify-between mb-2">
                <div className="h-4 bg-border rounded w-2/3"></div>
                <div className="h-3 bg-border rounded w-1/4"></div>
              </div>
              <div className="h-3 bg-border rounded w-1/2 mb-2"></div>
              <div className="flex gap-2">
                <div className="h-4 bg-border rounded w-16"></div>
                <div className="h-4 bg-border rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ─── MAIN CONTENT SKELETON ─── */}
      <main className="flex-1 flex flex-col min-w-0 md:overflow-hidden animate-pulse">
        {/* Top bar */}
        <header className="h-14 min-h-[56px] flex items-center justify-between px-5 border-b border-border bg-background">
          <div className="h-6 bg-surface rounded-md w-1/3"></div>
          <div className="h-4 bg-surface rounded-md w-24"></div>
        </header>

        {/* Player + Metadata */}
        <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">
          {/* Video Player Area Skeleton */}
          <div className="flex-1 flex flex-col min-w-0 p-4">
            <div className="w-full aspect-video lg:aspect-auto rounded-lg bg-surface border border-border flex-1"></div>
            <div className="flex items-center gap-3 mt-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-6 w-24 bg-surface border border-border rounded-md"></div>
              ))}
            </div>
          </div>

          {/* Metadata Panel Skeleton */}
          <aside className="w-full lg:w-[320px] lg:min-w-[320px] border-t lg:border-t-0 lg:border-l border-border bg-background flex-shrink-0">
            <div className="px-5 py-3.5 border-b border-border">
              <div className="h-5 bg-surface rounded-md w-1/2 mb-2"></div>
              <div className="h-4 bg-surface rounded-md w-3/4"></div>
            </div>
            <div className="px-4 py-4 space-y-4">
              {[1, 2, 3].map((section) => (
                <div key={section}>
                  <div className="h-4 bg-surface rounded-md w-1/3 mb-2"></div>
                  <div className="bg-surface border border-border rounded-lg p-3 space-y-3">
                    {[1, 2, 3].map((row) => (
                      <div key={row} className="flex justify-between">
                        <div className="h-3 bg-border rounded w-1/3"></div>
                        <div className="h-3 bg-border rounded w-1/4"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
