export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="glass-panel rounded-xl p-8">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-white">Loading surveillance data...</span>
        </div>
      </div>
    </div>
  )
}