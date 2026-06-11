import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { House, ShoppingCart, ArrowLeft } from '@phosphor-icons/react'
import { designsApi } from '../services/api'
import RoomMinimap from '../components/room/RoomMinimap'
import type { Room } from '../types'

interface SharedData {
  name: string
  totalCost: number
  updatedAt: string
  furnitureLayout: { name: string; furnitureId: { name?: string; price?: number } | string }[]
  roomId: Room | null
}

export default function SharedDesign() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<SharedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!token) return
    designsApi.getShared(token)
      .then(res => setData(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return (
    <div className="min-h-[100dvh] bg-brand-grey-light flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-brown/30 border-t-brand-brown rounded-full animate-spin" />
    </div>
  )

  if (notFound) return (
    <div className="min-h-[100dvh] bg-brand-grey-light flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 bg-brand-brown/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <House size={32} weight="regular" className="text-brand-brown" />
      </div>
      <h2 className="text-xl font-bold text-brand-dark mb-2">Design not found</h2>
      <p className="text-brand-grey-dark mb-6">This shared link is expired or no longer public.</p>
      <Link to="/" className="btn-primary inline-flex items-center gap-2">
        <ArrowLeft size={14} weight="regular" />
        Back to home
      </Link>
    </div>
  )

  if (!data) return null

  const room = data.roomId
  const items = data.furnitureLayout || []

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
          <span className="text-xs text-brand-grey-dark">Shared design</span>
        </nav>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-brand-brown uppercase tracking-[0.15em] mb-2">Shared design</p>
          <h1 className="text-3xl font-bold text-brand-dark tracking-tight mb-2">{data.name}</h1>
          {room && (
            <p className="text-brand-grey-dark">
              {room.name} · <span className="font-mono">{room.dimensions.width}×{room.dimensions.depth}m</span>
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Minimap preview */}
          <div className="md:col-span-2 p-1.5 rounded-[1.5rem] bg-brand-dark/5 border border-brand-grey">
            <div className="rounded-[calc(1.5rem-0.375rem)] overflow-hidden" style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15)' }}>
              {room
                ? <RoomMinimap room={room} furniture={items as Parameters<typeof RoomMinimap>[0]['furniture']} svgW={560} svgH={320} />
                : <div className="h-[320px] bg-brand-grey-light flex items-center justify-center"><House size={40} weight="thin" className="text-brand-grey-dark" /></div>
              }
            </div>
          </div>

          {/* Stats + furniture list */}
          <div className="flex flex-col gap-4">
            <div className="card">
              <div className="text-xs text-brand-grey-dark mb-1">Total cost</div>
              <div className="text-3xl font-bold text-brand-dark font-mono tabular-nums">${(data.totalCost || 0).toLocaleString()}</div>
            </div>
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart size={14} weight="regular" className="text-brand-brown" />
                <span className="text-xs font-semibold text-brand-dark">{items.length} items</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {items.map((item, i) => (
                  <div key={i} className="text-xs text-brand-grey-dark flex justify-between">
                    <span className="truncate">{item.name}</span>
                    {typeof item.furnitureId === 'object' && item.furnitureId?.price && (
                      <span className="font-mono ml-2 flex-shrink-0">${item.furnitureId.price}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Link to="/" className="btn-primary text-sm text-center flex items-center justify-center gap-2">
              Try FrameSpace free
              <ArrowLeft size={13} weight="bold" className="rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
