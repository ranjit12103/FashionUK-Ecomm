export default function Loader({ size = 'md', color = 'black', fullScreen = false }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-[3px]',
  }
  const colors = {
    black: 'border-gray-200 border-t-black',
    white: 'border-white/20 border-t-white',
  }
  const spinner = (
    <div className={`rounded-full animate-spin ${sizes[size]} ${colors[color]}`} />
  )
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">Loading...</p>
        </div>
      </div>
    )
  }
  return spinner
}
