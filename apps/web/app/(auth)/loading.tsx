export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 animate-pulse">
        <div className="h-7 bg-gray-200 rounded w-40 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-56 mb-8" />
        <div className="space-y-4">
          <div>
            <div className="h-3 bg-gray-100 rounded w-16 mb-2" />
            <div className="h-10 bg-gray-100 rounded-lg" />
          </div>
          <div>
            <div className="h-3 bg-gray-100 rounded w-20 mb-2" />
            <div className="h-10 bg-gray-100 rounded-lg" />
          </div>
          <div className="h-10 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
