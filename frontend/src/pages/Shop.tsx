import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  House, ArrowLeft, MagnifyingGlass, Cube, Image, X, Funnel,
} from '@phosphor-icons/react'
import { furnitureApi } from '../services/api'
import FurnitureMiniPreview from '../components/furniture/FurnitureMiniPreview'
import type { FurnitureItem } from '../types'

// Color name → hex map
const colorHex: Record<string, string> = {
  'white': '#F5F5F5', 'cream': '#FFF8DC', 'beige': '#F5DEB3', 'ivory': '#FFFFF0',
  'light grey': '#CFCFCF', 'grey': '#9E9E9E', 'dark grey': '#5A5A5A', 'charcoal': '#36454F',
  'black': '#212121', 'navy': '#1A237E', 'blue': '#1565C0', 'teal': '#00796B',
  'sage green': '#7CB09F', 'green': '#388E3C', 'olive': '#6D6E3C',
  'brown': '#795548', 'dark brown': '#3E2723', 'walnut': '#7B4F2A', 'oak': '#C49A42',
  'terracotta': '#C1440E', 'cognac': '#6B2737', 'dusty rose': '#E8A4A4',
  'mustard': '#E6AC00', 'yellow': '#F9A825', 'orange': '#E65100',
  'velvet blue': '#283593', 'natural': '#C4A882', 'sand': '#D2B48C',
  'pink': '#E91E63', 'red': '#B71C1C', 'purple': '#6A1B9A',
  'gold': '#B8860B', 'silver': '#9E9E9E', 'copper': '#B87333', 'brass': '#B5A642',
  'clear': '#B0D4E8', 'smoked glass': '#7A8C98', 'marble': '#E8E0D5',
  'natural jute': '#C4A460', 'rust': '#9E3D1E', 'stone': '#9E9E8E',
  'dark walnut': '#5C3317', 'light oak': '#D4A76A', 'pine': '#D2935E',
}

function resolveColor(name: string): string {
  const key = name.toLowerCase().trim()
  return colorHex[key] ?? '#A0896A'
}

const CATEGORIES = [
  { id: '', label: 'All' },
  { id: 'sofa', label: 'Sofas' },
  { id: 'chair', label: 'Chairs' },
  { id: 'table', label: 'Tables' },
  { id: 'desk', label: 'Desks' },
  { id: 'bed', label: 'Beds' },
  { id: 'tv-stand', label: 'TV Stands' },
  { id: 'shelf', label: 'Shelves' },
  { id: 'wardrobe', label: 'Wardrobes' },
  { id: 'storage', label: 'Storage' },
  { id: 'lighting', label: 'Lighting' },
  { id: 'rug', label: 'Rugs' },
  { id: 'plant', label: 'Plants' },
  { id: 'decor', label: 'Décor' },
]

interface CardState {
  selectedColor: string
  show3D: boolean
}

export default function Shop() {
  const [items, setItems] = useState<FurnitureItem[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [cardState, setCardState] = useState<Record<string, CardState>>({})
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      setLoading(true)
      try {
        const res = await furnitureApi.getAll({
          category: category || undefined,
          search: search || undefined,
          limit: 100,
        })
        setItems(res.data.items)
      } catch { /* ignore */ } finally { setLoading(false) }
    }
    const t = setTimeout(load, 250)
    return () => { clearTimeout(t); controller.abort() }
  }, [category, search])

  function getCard(id: string, item: FurnitureItem): CardState {
    return cardState[id] ?? { selectedColor: item.colors[0] || '#A0896A', show3D: false }
  }

  function setCard(id: string, patch: Partial<CardState>) {
    setCardState(s => ({ ...s, [id]: { ...getCard(id, items.find(i => i._id === id)!), ...patch } }))
  }

  return (
    <div className="min-h-[100dvh] bg-brand-grey-light flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 flex justify-between items-center px-6 md:px-10 py-4 bg-surface-raised/90 backdrop-blur-2xl border-b border-brand-grey">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-brown rounded-lg flex items-center justify-center">
            <House size={15} weight="fill" className="text-white" />
          </div>
          <span className="font-bold text-brand-dark text-base tracking-tight">FrameSpace</span>
        </Link>
        <Link to="/" className="flex items-center gap-1.5 text-xs text-brand-grey-dark hover:text-brand-dark transition-colors">
          <ArrowLeft size={12} weight="bold" /> Back home
        </Link>
      </header>

      <main className="flex-1 px-6 md:px-10 py-8 max-w-7xl mx-auto w-full">
        {/* Title + search */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-dark tracking-tighter mb-1">Shop All Furniture</h1>
          <p className="text-brand-grey-dark text-sm mb-5">{loading ? '–' : items.length} pieces available</p>

          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <MagnifyingGlass size={15} weight="regular" className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-grey-dark" />
              <input
                className="input pl-9 text-sm"
                placeholder="Search furniture..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ease-spring duration-150 ${
                showFilters ? 'bg-brand-brown text-white border-brand-brown' : 'bg-surface-raised border-brand-grey text-brand-dark hover:border-brand-brown'
              }`}
            >
              <Funnel size={14} weight={showFilters ? 'fill' : 'regular'} />
              Filters
            </button>
          </div>
        </div>

        {/* Category pills */}
        {showFilters && (
          <div className="mb-6 flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ease-spring duration-150 ${
                  category === c.id
                    ? 'bg-brand-brown text-white'
                    : 'bg-brand-grey text-brand-grey-dark hover:bg-brand-brown/10 hover:text-brand-brown'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-brand-grey animate-pulse overflow-hidden bg-surface-raised">
                <div className="h-48 bg-brand-grey" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-brand-grey rounded w-3/4" />
                  <div className="h-3 bg-brand-grey rounded w-1/2" />
                  <div className="h-8 bg-brand-grey rounded mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-brand-grey-dark">
            <MagnifyingGlass size={36} weight="regular" className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No furniture found. Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map(item => {
              const cs = getCard(item._id, item)
              const selectedHex = resolveColor(cs.selectedColor)
              return (
                <FurnitureCard
                  key={item._id}
                  item={item}
                  cardState={cs}
                  selectedHex={selectedHex}
                  onColorSelect={c => setCard(item._id, { selectedColor: c, show3D: cs.show3D })}
                  onToggle3D={() => setCard(item._id, { show3D: !cs.show3D })}
                />
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

// ── Furniture Card ──────────────────────────────────────────────────────────
interface CardProps {
  item: FurnitureItem
  cardState: CardState
  selectedHex: string
  onColorSelect: (c: string) => void
  onToggle3D: () => void
}

function FurnitureCard({ item, cardState, selectedHex, onColorSelect, onToggle3D }: CardProps) {
  const { selectedColor, show3D } = cardState
  const imgUrl = item.image
    ? `https://images.unsplash.com/photo-${item.image}?w=480&h=360&fit=crop&crop=center&auto=format&q=75`
    : null

  return (
    <div className="group rounded-2xl border border-brand-grey bg-surface-raised overflow-hidden hover:border-brand-brown hover:shadow-card-hover transition-all ease-spring duration-200 flex flex-col">
      {/* Image / 3D preview */}
      <div className="relative overflow-hidden bg-brand-grey" style={{ height: '200px' }}>
        {show3D ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <FurnitureMiniPreview item={item} color={selectedHex} size={200} />
          </div>
        ) : imgUrl ? (
          <>
            <img
              src={imgUrl}
              alt={item.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform ease-spring duration-500"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FurnitureMiniPreview item={item} color={selectedHex} size={200} />
          </div>
        )}

        {/* 3D / Photo toggle */}
        <button
          onClick={onToggle3D}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-surface-raised/90 backdrop-blur flex items-center justify-center text-brand-grey-dark hover:text-brand-dark transition-colors shadow-sm"
          title={show3D ? 'Show photo' : 'View in 3D'}
        >
          {show3D ? <Image size={13} weight="regular" /> : <Cube size={13} weight="regular" />}
        </button>

        {/* Category badge */}
        <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-raised/90 backdrop-blur text-brand-grey-dark capitalize">
          {item.category}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-brand-dark leading-tight truncate">{item.name}</p>
            {item.description && (
              <p className="text-[11px] text-brand-grey-dark mt-0.5 leading-relaxed line-clamp-2">{item.description}</p>
            )}
          </div>
          <span className="text-sm font-bold text-brand-brown font-mono flex-shrink-0">
            ${item.price.toLocaleString()}
          </span>
        </div>

        {/* Color swatches */}
        {item.colors.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] text-brand-grey-dark mb-1.5 font-medium">
              Color: <span className="text-brand-dark capitalize">{selectedColor}</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {item.colors.slice(0, 8).map(c => {
                const hex = resolveColor(c)
                const isSelected = c === selectedColor
                return (
                  <button
                    key={c}
                    title={c}
                    onClick={() => onColorSelect(c)}
                    className={`w-5 h-5 rounded-full border-2 transition-all ease-spring duration-150 ${
                      isSelected ? 'border-brand-brown scale-125' : 'border-transparent hover:border-brand-grey-dark'
                    }`}
                    style={{ background: hex }}
                  />
                )
              })}
              {item.colors.length > 8 && (
                <span className="text-[10px] text-brand-grey-dark self-center">+{item.colors.length - 8}</span>
              )}
            </div>
          </div>
        )}

        {/* Materials */}
        {item.materials.length > 0 && (
          <p className="text-[11px] text-brand-grey-dark mb-3 capitalize">
            {item.materials.slice(0, 3).join(' · ')}
          </p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm"
              style={{ background: i < Math.round(item.rating) ? '#C8955A' : '#E4E0DB' }}
            />
          ))}
          <span className="text-[10px] text-brand-grey-dark ml-1">{item.rating.toFixed(1)}</span>
        </div>

        {/* CTA */}
        <div className="mt-auto">
          <Link
            to="/dashboard"
            className="btn-primary w-full text-xs py-2.5 text-center block"
          >
            Add to room designer
          </Link>
        </div>
      </div>
    </div>
  )
}
