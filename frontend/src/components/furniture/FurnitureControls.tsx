import { CursorClick, Trash, ArrowSquareOut } from '@phosphor-icons/react'
import useStore from '../../store/useStore'
import { useLang } from '../../i18n/LanguageProvider'

const COLORS = ['#8B7355','#D4A574','#9C8B6E','#4A4A4A','#FFFFFF','#F5F5DC','#708090','#8FBC8F','#CD853F','#B0C4DE','#DEB887','#2C3E50']
const MATERIALS = ['fabric','leather','velvet','wood','metal','glass','plastic','rattan','marble']

export default function FurnitureControls() {
  const { selectedFurnitureId, placedFurniture, catalog, updateFurniture, removeFurniture } = useStore()
  const { t } = useLang()

  const selected = placedFurniture.find(f => (f._id || f.furnitureId) === selectedFurnitureId)
  const itemData = selected?.furnitureData || catalog.find(c => c._id === selected?.furnitureId)

  if (!selected) return (
    <div className="p-4 text-center text-brand-grey-dark">
      <div className="w-12 h-12 bg-brand-grey rounded-xl flex items-center justify-center mx-auto mb-3">
        <CursorClick size={24} weight="regular" className="text-brand-grey-dark" />
      </div>
      <p className="text-sm font-medium text-brand-dark">{t('furnitureControls.selectFurniture')}</p>
      <p className="text-xs mt-1">{t('furnitureControls.clickToSelect')}</p>
    </div>
  )

  const update = (patch: Partial<typeof selected>) =>
    updateFurniture(selectedFurnitureId!, patch)

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-brand-grey flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-brand-dark text-sm truncate">{selected.name}</p>
            {itemData && <p className="text-xs text-brand-grey-dark capitalize">{itemData.category}</p>}
          </div>
          <button
            onClick={() => removeFurniture(selectedFurnitureId!)}
            className="w-8 h-8 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors ease-spring duration-150 flex items-center justify-center active:scale-[0.98]"
          >
            <Trash size={15} weight="regular" />
          </button>
        </div>
        {itemData && (
          <div className="mt-2 p-2 bg-brand-grey-light rounded-lg">
            <p className="text-xs text-brand-grey-dark font-mono">
              {itemData.dimensions.width}×{itemData.dimensions.depth}×{itemData.dimensions.height} cm
            </p>
            <p className="text-sm font-semibold text-brand-brown font-mono">${itemData.price.toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Position */}
        <div>
          <label className="label text-xs">{t('furnitureControls.position')}</label>
          <div className="grid grid-cols-3 gap-2">
            {(['x', 'y', 'z'] as const).map(axis => (
              <div key={axis}>
                <label className="text-xs text-brand-grey-dark mb-1 block font-mono">{axis.toUpperCase()}</label>
                <input type="number" step="0.05" className="input text-xs font-mono"
                  value={selected.position[axis].toFixed(2)}
                  onChange={e => update({ position: { ...selected.position, [axis]: +e.target.value } })} />
              </div>
            ))}
          </div>
          {itemData?.category === 'lighting' && (
            <p className="text-[10px] text-brand-grey-dark mt-1">{t('furnitureControls.lampHint')}</p>
          )}
        </div>

        {/* Rotation */}
        <div>
          <label className="label text-xs">
            {t('furnitureControls.rotation')} <span className="font-mono">{selected.rotation}°</span>
          </label>
          <input type="range" className="w-full accent-brand-brown" min="0" max="360" step="5"
            value={selected.rotation}
            onChange={e => update({ rotation: +e.target.value })} />
          <div className="flex gap-1 mt-1">
            {[0, 45, 90, 180, 270].map(r => (
              <button key={r} onClick={() => update({ rotation: r })}
                className={`flex-1 py-1 rounded text-xs font-medium font-mono transition-all ease-spring duration-150 ${
                  selected.rotation === r ? 'bg-brand-brown text-white' : 'bg-brand-grey text-brand-grey-dark hover:bg-brand-brown/10'
                }`}>{r}°</button>
            ))}
          </div>
        </div>

        {/* Scale */}
        <div>
          <label className="label text-xs">
            {t('furnitureControls.scale')} <span className="font-mono">{(selected.scale || 1).toFixed(2)}×</span>
          </label>
          <input type="range" className="w-full accent-brand-brown" min="0.5" max="2" step="0.05"
            value={selected.scale || 1}
            onChange={e => update({ scale: +e.target.value })} />
        </div>

        {/* Color */}
        <div>
          <label className="label text-xs">{t('furnitureControls.color')}</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {COLORS.map(c => (
              <button key={c} onClick={() => update({ color: c })}
                className={`w-7 h-7 rounded-lg border-2 transition-all ease-spring duration-150 active:scale-[0.98] ${
                  selected.color === c ? 'border-brand-brown scale-110' : 'border-transparent hover:scale-105'
                }`}
                style={{ background: c, boxShadow: c === '#FFFFFF' ? 'inset 0 0 0 1px #ddd' : 'none' }} />
            ))}
          </div>
          <input type="color" className="w-full h-8 rounded-lg cursor-pointer border border-brand-grey"
            value={selected.color || '#8B7355'}
            onChange={e => update({ color: e.target.value })} />
        </div>

        {/* Material */}
        <div>
          <label className="label text-xs">{t('furnitureControls.material')}</label>
          <div className="flex flex-wrap gap-1">
            {MATERIALS.map(m => (
              <button key={m} onClick={() => update({ material: m })}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ease-spring duration-150 ${
                  selected.material === m ? 'bg-brand-brown text-white' : 'bg-brand-grey text-brand-grey-dark hover:bg-brand-brown/10 hover:text-brand-brown'
                }`}>{t(`furnitureControls.materials.${m}`)}</button>
            ))}
          </div>
        </div>

        {/* Shop link */}
        {itemData?.sourceUrl && (
          <a href={itemData.sourceUrl} target="_blank" rel="noopener noreferrer"
            className="btn-secondary text-xs w-full flex items-center justify-center gap-2">
            <ArrowSquareOut size={13} weight="regular" />
            {t('furnitureControls.buyFrom')} {itemData.source}
          </a>
        )}
      </div>
    </div>
  )
}
