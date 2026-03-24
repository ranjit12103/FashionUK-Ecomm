import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center px-6">
        <p className="text-[120px] md:text-[200px] font-black text-white/5 leading-none select-none">404</p>
        <div className="-mt-8 relative z-10">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white mb-4">Page Not Found</h1>
          <p className="text-gray-500 text-base mb-8 max-w-sm mx-auto">The page you're looking for doesn't exist or has been moved.</p>
          <Link to="/"
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 text-sm font-bold uppercase tracking-widest no-underline hover:bg-gray-100 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
