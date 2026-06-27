export default function DashboardLoading() {
  return (
    <main className="flex-1 p-8 overflow-y-auto w-full bg-background">
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        {/* Header */}
        <div>
          <div className="h-8 bg-surface rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-surface rounded w-1/6"></div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5">
              <div className="h-4 bg-border rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-border rounded w-1/4"></div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6 h-64"></div>
            <div className="bg-surface border border-border rounded-xl p-6 h-96"></div>
          </div>
          
          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6 h-48"></div>
            <div className="bg-surface border border-border rounded-xl p-6 h-48"></div>
            <div className="bg-surface border border-border rounded-xl p-6 h-48"></div>
          </div>
        </div>
      </div>
    </main>
  );
}
