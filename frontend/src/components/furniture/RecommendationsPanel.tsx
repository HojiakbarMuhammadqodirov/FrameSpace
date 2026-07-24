import { useState } from 'react'
import {
  Sparkle, Lightbulb, Armchair, Table, Monitor, Bed,
  Books, Package, Lamp, Plant, PaintBrush, House, GridNine, Plus,
} from '@phosphor-icons/react'
import useStore from '../../store/useStore'
import { furnitureApi } from '../../services/api'
import { useLang } from '../../i18n/LanguageProvider'
import type { FurnitureItem } from '../../types'

function CategoryIcon({ category, size = 18 }: { category: string; size?: number }) {
  const w = 'regular' as const
  switch (category) {
    case 'sofa': case 'chair': return <Armchair size={size} weight={w} />
    case 'table':              return <Table size={size} weight={w} />
    case 'desk':               return <Monitor size={size} weight={w} />
    case 'bed':                return <Bed size={size} weight={w} />
    case 'shelf':              return <Books size={size} weight={w} />
    case 'wardrobe': case 'storage': return <Package size={size} weight={w} />
    case 'lighting':           return <Lamp size={size} weight={w} />
    case 'rug':                return <GridNine size={size} weight={w} />
    case 'plant':              return <Plant size={size} weight={w} />
    case 'decor':              return <PaintBrush size={size} weight={w} />
    default:                   return <House size={size} weight={w} />
  }
}

export default function RecommendationsPanel() {
  const { currentRoom, recommendations, setRecommendations, addFurniture } = useStore()
  const { t } = useLang()
  const [loading, setLoading] = useState(false)

  const fetchRecs = async () => {
    if (!currentRoom) return
    setLoading(true)
    try {
      const res = await furnitureApi.recommend({
        room: currentRoom,
        preferences: { style: currentRoom.stylePreference, budgetRange: currentRoom.budget },
      })
      setRecommendations(res.data)
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  const place = (item: FurnitureItem) => {
    if (!currentRoom) return
    addFurniture({
      furnitureId: item._id,
      name: item.name,
      position: {
        x: (Math.random() - 0.5) * currentRoom.dimensions.width * 0.5,
        y: 0,
        z: (Math.random() - 0.5) * currentRoom.dimensions.depth * 0.5,
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
      <div className="p-3 border-b border-brand-grey flex-shrink-0">
        <p className="text-xs text-brand-grey-dark mb-2">
          {t('recommendations.intro')}
        </p>
        <button
          onClick={fetchRecs}
          disabled={loading || !currentRoom}
          className="btn-primary text-sm w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t('recommendations.generating')}
            </>
          ) : (
            <>
              <Sparkle size={15} weight="regular" />
              {t('recommendations.getRecs')}
            </>
          )}
        </button>
        {!currentRoom && <p className="text-xs text-red-400 mt-1 text-center">{t('recommendations.selectRoomFirst')}</p>}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-brand-brown/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Sparkle size={24} weight="regular" className="text-brand-brown" />
            </div>
            <p className="text-sm text-brand-grey-dark">
              {t('recommendations.emptyHint')}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recommendations.map((item, i) => (
              <div key={item._id} className="furniture-card p-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-brand-grey flex items-center justify-center flex-shrink-0 relative">
                    <CategoryIcon category={item.category} size={20} />
                    {i < 3 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-brown text-white text-[9px] font-bold rounded-full flex items-center justify-center font-mono">
                        {i + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-dark truncate">{item.name}</p>
                    <p className="text-xs text-brand-grey-dark capitalize">{item.category}</p>
                    <p className="text-sm font-bold text-brand-brown font-mono">${item.price.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => place(item)}
                    className="w-8 h-8 bg-brand-brown text-white rounded-lg flex items-center justify-center hover:bg-brand-brown-dark transition-colors ease-spring duration-150 active:scale-[0.98] flex-shrink-0"
                  >
                    <Plus size={14} weight="bold" />
                  </button>
                </div>
                {item.reason && (
                  <div className="flex items-start gap-1.5 text-xs text-brand-grey-dark mt-2 bg-brand-grey-light rounded-lg px-2 py-1.5">
                    <Lightbulb size={11} weight="regular" className="mt-0.5 flex-shrink-0 text-brand-brown" />
                    <span>{item.reason}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
