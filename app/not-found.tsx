import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="glass-panel rounded-xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-white mb-4">404 - Page Not Found</h2>
        <p className="text-white/70 mb-6">The page you're looking for doesn't exist.</p>
        <Link
          href="/"
          className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors inline-block"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}