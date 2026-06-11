interface Props {
  size?: 'sm' | 'md' | 'lg'
  fullscreen?: boolean
}

export default function LoadingSpinner({ size = 'md', fullscreen }: Props) {
  const sz = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size]

  const spinner = (
    <div className={`${sz} border-2 border-brand-brown/20 border-t-brand-brown rounded-full animate-spin`} />
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-brand-brown/20 border-t-brand-brown rounded-full animate-spin" />
          <p className="text-sm text-brand-grey-dark font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return spinner
}
