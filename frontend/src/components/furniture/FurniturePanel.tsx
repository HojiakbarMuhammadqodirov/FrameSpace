import { useEffect, useState } from 'react'
import {
  Armchair, Table, Monitor, Bed, Books, Package, Lamp,
  Plant, PaintBrush, House, Plus, GridNine, Television,
} from '@phosphor-icons/react'
import useStore from '../../store/useStore'
import { furnitureApi } from '../../services/api'
import type { FurnitureItem } from '../../types'

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

function CategoryIcon({ category, size = 18 }: { category: string; size?: number }) {
  const w = 'regular' as const
  switch (category) {
    case 'sofa': case 'chair': return <Armchair size={size} weight={w} />
    case 'table':              return <Table size={size} weight={w} />
    case 'desk':               return <Monitor size={size} weight={w} />
    case 'bed':                return <Bed size={size} weight={w} />
    case 'tv-stand':           return <Television size={size} weight={w} />
    case 'shelf':              return <Books size={size} weight={w} />
    case 'wardrobe': case 'storage': return <Package size={size} weight={w} />
    case 'lighting':           return <Lamp size={size} weight={w} />
    case 'rug':                return <GridNine size={size} weight={w} />
    case 'plant':              return <Plant size={size} weight={w} />
    case 'decor':              return <PaintBrush size={size} weight={w} />
    default:                   return <House size={size} weight={w} />
  }
}

export default function FurniturePanel() {
  const { catalog, setCatalog, furnitureCategory, setFurnitureCategory, addFurniture, currentRoom } = useStore()
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await furnitureApi.getAll({ category: furnitureCategory || undefined, search: search || undefined })
        setCatalog(res.data.items)
      } catch { /* ignore */ } finally { setLoading(false) }
    }
    const t = setTimeout(load, 200)
    return () => clearTimeout(t)
  }, [furnitureCategory, search])

  const placeItem = (item: FurnitureItem) => {
    if (!currentRoom) return
    const { width, depth } = currentRoom.dimensions
    addFurniture({
      furnitureId: item._id,
      name: item.name,
      position: {
        x: (Math.random() - 0.5) * width * 0.6,
        y: 0,
        z: (Math.random() - 0.5) * depth * 0.6,
      },
      rotation: 0,
      scale: 1,
      color: item.colors[0] || '',
      material: item.materials[0] || '',
      furnitureData: item,
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-brand-grey space-y-2 flex-shrink-0">
        <input className="input text-sm" placeholder="Search furniture..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setFurnitureCategory(c.id)}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ease-spring duration-150 ${
                furnitureCategory === c.id
                  ? 'bg-brand-brown text-white'
                  : 'bg-brand-grey text-brand-grey-dark hover:bg-brand-brown/10 hover:text-brand-brown'
              }`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-2 p-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-brand-grey animate-pulse">
                <div className="w-14 h-14 bg-brand-grey rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-brand-grey rounded w-3/4" />
                  <div className="h-3 bg-brand-grey rounded w-1/2" />
                  <div className="h-3 bg-brand-grey rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : catalog.length === 0 ? (
          <div className="text-center py-8 text-brand-grey-dark text-sm">No items found</div>
        ) : (
          <div className="space-y-2">
            {catalog.map(item => (
              <FurnitureListItem key={item._id} item={item} onPlace={() => placeItem(item)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FurnitureListItem({ item, onPlace }: { item: FurnitureItem; onPlace: () => void }) {
  return (
    <div className="furniture-card flex items-center gap-3 p-3">
      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-brand-grey relative flex items-center justify-center text-brand-grey-dark">
        <CategoryIcon category={item.category} size={22} />
        {item.image && (
          <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-brand-dark truncate">{item.name}</p>
        <p className="text-xs text-brand-grey-dark capitalize">{item.category}</p>
        <p className="text-xs text-brand-brown font-semibold font-mono">${item.price.toLocaleString()}</p>
      </div>
      <button
        onClick={onPlace}
        className="flex-shrink-0 w-8 h-8 bg-brand-brown text-white rounded-lg flex items-center justify-center hover:bg-brand-brown-dark transition-colors ease-spring duration-150 active:scale-[0.98]"
      >
        <Plus size={14} weight="bold" />
      </button>
    </div>
  )
}
