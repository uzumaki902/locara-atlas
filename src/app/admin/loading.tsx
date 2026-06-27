export default function AdminLoading() {
  return (
    <div className="max-w-5xl w-full animate-pulse space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="h-8 bg-surface rounded-md w-1/4 mb-2"></div>
        <div className="h-4 bg-surface rounded-md w-1/3"></div>
      </div>

      {/* Stats/Action Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-lg p-5 h-24"></div>
        ))}
      </div>

      {/* Table Area (Generic) */}
      <div className="bg-surface border border-border rounded-lg h-96 w-full mt-8"></div>
    </div>
  );
}
