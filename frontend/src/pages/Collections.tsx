import { Link } from 'react-router-dom'
import { House, ArrowLeft, Swatches } from '@phosphor-icons/react'

const COLLECTIONS = [
  { name: 'Scandinavian Calm',   desc: 'Clean lines, neutral tones, and natural materials.', color: '#E8D5B0' },
  { name: 'Industrial Loft',     desc: 'Raw textures, steel accents, and warm Edison lighting.', color: '#C4B8A8' },
  { name: 'Coastal Retreat',     desc: 'Breezy fabrics, light wood, and ocean-inspired hues.', color: '#B8D4D4' },
  { name: 'Modern Minimalist',   desc: 'Less is more — functional beauty in every piece.', color: '#D8D4CE' },
]

export default function Collections() {
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

      <main className="flex-1 px-8 md:px-16 py-12 max-w-4xl mx-auto w-full">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Swatches size={18} weight="regular" className="text-brand-brown" />
            <span className="text-xs font-semibold text-brand-brown uppercase tracking-[0.15em]">Curated styles</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-dark tracking-tighter">Collections</h1>
          <p className="text-brand-grey-dark mt-2">Pre-styled room themes designed by our in-house team.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {COLLECTIONS.map(c => (
            <div key={c.name} className="group p-1.5 rounded-[1.25rem] bg-brand-dark/[0.03] border border-brand-grey cursor-pointer">
              <div className="rounded-[calc(1.25rem-0.375rem)] overflow-hidden">
                <div className="h-32 w-full transition-transform duration-300 group-hover:scale-[1.02]"
                  style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}88)` }} />
                <div className="bg-surface-raised p-5">
                  <h3 className="font-semibold text-brand-dark text-sm tracking-tight mb-1">{c.name}</h3>
                  <p className="text-xs text-brand-grey-dark leading-relaxed">{c.desc}</p>
                  <p className="text-[10px] text-brand-brown mt-3 font-medium">Coming soon</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
