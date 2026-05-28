export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="h-7 bg-gray-200 rounded-lg w-48 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-72 mb-8" />

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl px-5 py-5">
            <div className="h-3 bg-gray-100 rounded w-24 mb-3" />
            <div className="h-9 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="h-10 bg-gray-50 border-b border-gray-100" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-48 mb-1.5" />
              <div className="h-3 bg-gray-100 rounded w-32" />
            </div>
            <div className="h-6 bg-gray-100 rounded-full w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
