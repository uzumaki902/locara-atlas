export default function RequestsLoading() {
  return (
    <main className="flex-1 max-w-4xl w-full mx-auto p-8 overflow-y-auto animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-8 bg-surface rounded-md w-1/3 mb-2"></div>
        <div className="h-4 bg-surface rounded-md w-1/2"></div>
      </div>

      {/* Form Area */}
      <div className="mb-16 bg-surface border border-border rounded-lg p-6 h-96 w-full"></div>

      {/* Table Header */}
      <div className="mb-6">
        <div className="h-6 bg-surface rounded-md w-1/4"></div>
      </div>

      {/* Table Area */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden w-full h-64"></div>
    </main>
  );
}
