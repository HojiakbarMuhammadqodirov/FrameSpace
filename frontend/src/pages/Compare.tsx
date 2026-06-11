import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { House, ArrowLeft, ShoppingCart } from '@phosphor-icons/react'
import { designsApi } from '../services/api'
import RoomMinimap from '../components/room/RoomMinimap'
import type { Design, Room } from '../types'

type FullDesign = Design & { roomId: Room | null }

function DesignPanel({ id, label }: { id: string; label: string }) {
  const [design, setDesign] = useState<FullDesign | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(false)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    designsApi.getById(id)
      .then(r => setDesign(r.data as FullDesign))
      .catch(() => setErr(true))
      .finally(() => setLoading(false))
  }, [id])

  const room = design?.roomId && typeof design.roomId === 'object' ? design.roomId : null

  if (loading) return (
    <div className="flex-1 card animate-pulse">
      <div className="w-full h-48 bg-brand-grey rounded-xl mb-4" />
      <div className="h-5 bg-brand-grey rounded w-2/3 mb-2" />
      <div className="h-4 bg-brand-grey rounded w-1/2" />
    </div>
  )

  if (err || !design) return (
    <div className="flex-1 card flex items-center justify-center text-center py-12">
      <div>
        <House size={32} weight="thin" className="text-brand-grey-dark mx-auto mb-2" />
        <p className="text-sm text-brand-grey-dark">{label} design not found</p>
        <p className="text-xs text-brand-grey-dark mt-1">Check the URL parameters</p>
      </div>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="p-1.5 rounded-[1.5rem] bg-brand-dark/5 border border-brand-grey">
        <div className="rounded-[calc(1.5rem-0.375rem)] overflow-hidden" style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15)' }}>
          {room
            ? <RoomMinimap room={room} furniture={design.furnitureLayout} svgW={400} svgH={240} />
            : <div className="h-60 bg-brand-grey-light flex items-center justify-center"><House size={40} weight="thin" className="text-brand-grey-dark opacity-40" /></div>
          }
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold text-brand-brown uppercase tracking-[0.12em] mb-1">{label}</p>
        <h2 className="text-xl font-bold text-brand-dark tracking-tight">{design.name}</h2>
        {room && <p className="text-sm text-brand-grey-dark mt-0.5">{room.name} · <span className="font-mono">{room.dimensions.width}×{room.dimensions.depth}m</span></p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <div className="text-2xl font-bold text-brand-dark font-mono tabular-nums mb-0.5">
            {design.furnitureLayout?.length || 0}
          </div>
          <div className="text-xs text-brand-grey-dark">Items</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-brand-brown font-mono tabular-nums mb-0.5">
            ${(design.totalCost || 0).toLocaleString()}
          </div>
          <div className="text-xs text-brand-grey-dark">Total cost</div>
        </div>
      </div>

      {design.furnitureLayout?.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart size={13} weight="regular" className="text-brand-brown" />
            <span className="text-xs font-semibold text-brand-dark">Furniture</span>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {design.furnitureLayout.map((item, i) => (
              <div key={i} className="text-xs flex justify-between text-brand-grey-dark">
                <span className="truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Compare() {
  const [params] = useSearchParams()
  const a = params.get('a') || ''
  const b = params.get('b') || ''

  return (
    <div className="min-h-[100dvh] bg-brand-grey-light">
      {/* Navbar */}
      <div className="sticky top-0 z-40 flex justify-center pt-4 px-4 pointer-events-none">
        <nav className="pointer-events-auto flex items-center gap-3 px-4 py-2 bg-surface-raised/80 backdrop-blur-2xl rounded-full border border-brand-grey shadow-float">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-brown rounded-md flex items-center justify-center">
              <House size={14} weight="fill" className="text-white" />
            </div>
            <span className="font-semibold text-brand-dark text-sm tracking-tight">FrameSpace</span>
          </Link>
          <div className="w-px h-4 bg-brand-grey" />
          <Link to="/dashboard" className="flex items-center gap-1.5 text-xs text-brand-grey-dark hover:text-brand-dark transition-colors ease-spring duration-150">
            <ArrowLeft size={12} weight="regular" />
            Dashboard
          </Link>
        </nav>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <p className="text-xs font-semibold text-brand-brown uppercase tracking-[0.15em] mb-2 text-center">Side by side</p>
        <h1 className="text-3xl font-bold text-brand-dark tracking-tight text-center mb-10">Compare designs</h1>

        {(!a && !b) ? (
          <div className="text-center py-16">
            <p className="text-brand-grey-dark mb-4">Add design IDs to the URL:</p>
            <code className="text-xs bg-brand-grey px-3 py-1.5 rounded-lg font-mono text-brand-dark">
              /compare?a=DESIGN_ID_1&b=DESIGN_ID_2
            </code>
            <p className="text-xs text-brand-grey-dark mt-4">You can find design IDs from your dashboard</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            <DesignPanel id={a} label="Design A" />
            {/* Divider */}
            <div className="hidden md:flex flex-col items-center justify-center gap-2">
              <div className="w-px flex-1 bg-brand-grey" />
              <span className="text-xs text-brand-grey-dark font-semibold px-2">VS</span>
              <div className="w-px flex-1 bg-brand-grey" />
            </div>
            <DesignPanel id={b} label="Design B" />
          </div>
        )}
      </div>
    </div>
  )
}
