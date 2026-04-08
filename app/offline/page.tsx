export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-white">
      <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center mb-6">
        <img src="/icons/icon-72x72.png" alt="Jorbex" className="w-16 h-16 rounded-xl" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re offline</h1>
      <p className="text-gray-500 max-w-xs mb-8">
        Check your internet connection and try again. Previously visited pages may still be available.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
