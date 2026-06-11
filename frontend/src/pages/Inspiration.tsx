import { Link } from 'react-router-dom'
import { House, ArrowLeft, Images, ArrowRight } from '@phosphor-icons/react'

const ROOMS = [
  { label: 'Living Room', style: 'Modern · Minimalist', bg: '#E8D5C0' },
  { label: 'Bedroom',     style: 'Scandinavian · Cozy',  bg: '#D0CECE' },
  { label: 'Home Office', style: 'Industrial · Clean',   bg: '#C8D0D4' },
  { label: 'Dining Room', style: 'Warm · Traditional',   bg: '#D4C8B8' },
  { label: 'Studio Flat', style: 'Compact · Smart',      bg: '#CCCaC0' },
  { label: 'Kids Room',   style: 'Playful · Bright',     bg: '#D0D8C8' },
]

export default function Inspiration() {
  return (
    <div className="min-h-[100dvh] bg-brand-grey-light flex flex-col">
      <header className="flex justify-center pt-6 px-6">
        <div className="flex items-center gap-4 px-5 py-3 bg-surface-raised/90 backdrop-blur-2xl rounded-full border border-brand-grey shadow-float">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-brown rounded-md flex items-center justify-center">
              <House size={13} weight="fill" className="text-white" />
            </div>
            <span className="font-semibold text-brand-dark text-sm tracking-tight">FrameSpace</span>
          </Link>
          <div className="w-px h-4 bg-brand-grey" />
          <Link to="/" className="flex items-center gap-1.5 text-xs text-brand-grey-dark hover:text-brand-dark transition-colors">
            <ArrowLeft size={12} weight="bold" /> Back home
          </Link>
        </div>
      </header>

      <main className="flex-1 px-8 md:px-16 py-12 max-w-5xl mx-auto w-full">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Images size={18} weight="regular" className="text-brand-brown" />
            <span className="text-xs font-semibold text-brand-brown uppercase tracking-[0.15em]">Gallery</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-dark tracking-tighter">Get inspired</h1>
          <p className="text-brand-grey-dark mt-2">Real rooms designed by FrameSpace users around the world.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {ROOMS.map(r => (
            <div key={r.label} className="group rounded-2xl border border-brand-grey overflow-hidden bg-surface-raised cursor-pointer hover:border-brand-brown hover:shadow-card-hover transition-all ease-spring duration-200">
              <div className="h-40 transition-transform duration-300 group-hover:scale-[1.03] origin-center"
                style={{ background: `linear-gradient(145deg, ${r.bg}, ${r.bg}88)` }} />
              <div className="p-4">
                <p className="font-medium text-sm text-brand-dark">{r.label}</p>
                <p className="text-xs text-brand-grey-dark mt-0.5">{r.style}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/gallery" className="btn-secondary text-sm px-6 py-2.5 inline-flex items-center gap-2">
            View full gallery <ArrowRight size={14} weight="bold" />
          </Link>
        </div>
      </main>
    </div>
  )
}
