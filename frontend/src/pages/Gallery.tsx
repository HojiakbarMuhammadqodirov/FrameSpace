import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { House, ArrowSquareOut } from '@phosphor-icons/react'
import { designsApi } from '../services/api'
import RoomMinimap from '../components/room/RoomMinimap'
import type { Room } from '../types'

interface GalleryDesign {
  _id: string
  name: string
  totalCost: number
  updatedAt: string
  shareToken: string
  furnitureLayout: { name: string }[]
  roomId: Room | null
}

export default function Gallery() {
  const [designs, setDesigns] = useState<GalleryDesign[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await designsApi.getGallery(p)
      setDesigns(res.data.designs)
      setPages(res.data.pages)
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page) }, [page, load])

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
          <span className="text-xs text-brand-grey-dark">Public gallery</span>
        </nav>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <p className="text-xs font-semibold text-brand-brown uppercase tracking-[0.15em] mb-3 text-center">Community</p>
        <h1 className="text-3xl font-bold text-brand-dark tracking-tight text-center mb-10">Design gallery</h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="w-full h-36 bg-brand-grey rounded-xl mb-3" />
                <div className="h-4 bg-brand-grey rounded w-3/4 mb-2" />
                <div className="h-3 bg-brand-grey rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : designs.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-brand-brown/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <House size={32} weight="regular" className="text-brand-brown" />
            </div>
            <h3 className="text-lg font-semibold text-brand-dark mb-2">No public designs yet</h3>
            <p className="text-brand-grey-dark mb-6">Be the first to share your room design with the world.</p>
            <Link to="/" className="btn-primary inline-flex">Get started</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {designs.map(d => (
                <div key={d._id} className="card hover:shadow-card-hover transition-shadow ease-spring duration-200 group">
                  <div className="rounded-xl mb-3 overflow-hidden bg-brand-grey-light">
                    {d.roomId
                      ? <RoomMinimap room={d.roomId} furniture={d.furnitureLayout as Parameters<typeof RoomMinimap>[0]['furniture']} svgW={280} svgH={140} />
                      : <div className="h-[140px] flex items-center justify-center"><House size={32} weight="thin" className="text-brand-grey-dark opacity-40" /></div>
                    }
                  </div>
                  <h3 className="font-semibold text-brand-dark mb-1 truncate">{d.name}</h3>
                  {d.roomId && <p className="text-xs text-brand-grey-dark mb-1">{d.roomId.name}</p>}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-brand-grey-dark">{d.furnitureLayout?.length || 0} items</span>
                      {d.totalCost > 0 && (
                        <span className="text-xs font-mono text-brand-grey-dark"> · ${d.totalCost.toLocaleString()}</span>
                      )}
                    </div>
                    <Link
                      to={`/shared/${d.shareToken}`}
                      className="text-brand-brown hover:text-brand-brown-dark transition-colors ease-spring duration-150 flex items-center gap-1 text-xs font-medium"
                    >
                      View <ArrowSquareOut size={12} weight="regular" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="btn-secondary text-sm py-2 px-4 disabled:opacity-40"
                >Previous</button>
                <span className="text-sm text-brand-grey-dark font-mono">{page} / {pages}</span>
                <button
                  onClick={() => setPage(p => Math.min(pages, p + 1))}
                  disabled={page >= pages}
                  className="btn-secondary text-sm py-2 px-4 disabled:opacity-40"
                >Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
