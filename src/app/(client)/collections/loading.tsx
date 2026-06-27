export default function CollectionsLoading() {
  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        {/* Header */}
        <div className="mb-8">
          <div className="h-8 bg-surface rounded-md w-1/4 mb-2"></div>
          <div className="h-4 bg-surface rounded-md w-1/3"></div>
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="aspect-video bg-border w-full"></div>
              <div className="p-5 space-y-4">
                <div className="h-5 bg-border rounded-md w-2/3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-border rounded-md w-full"></div>
                  <div className="h-3 bg-border rounded-md w-4/5"></div>
                </div>
                <div className="h-3 bg-border rounded-md w-1/4 mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
