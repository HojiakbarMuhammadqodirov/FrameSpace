import { useState } from 'react'
import { Footprints } from '@phosphor-icons/react'
import useStore from '../../store/useStore'
import { useLang } from '../../i18n/LanguageProvider'
import type { ViewMode } from '../../types'

const VIEW_MODES: ViewMode[] = ['default', 'free', 'front', 'side-left', 'side-right', 'top']

export default function ViewControls() {
  const { viewMode, setViewMode, showGrid, toggleGrid, snapToGrid, toggleSnap } = useStore()
  const { t } = useLang()
  const [walkActive, setWalkActive] = useState(false)

  const handleWalk = () => {
    const toggle = (window as Window & { _fsToggleWalk?: (cb?: () => void) => void })._fsToggleWalk
    if (!toggle) return
    if (!walkActive) {
      setWalkActive(true)
      toggle(() => setWalkActive(false))
    } else {
      toggle()
    }
  }

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 flex-wrap justify-center px-4">
      <div className="flex bg-surface-raised/90 backdrop-blur-sm rounded-xl shadow-float border border-brand-grey/50 p-1 gap-1">
        {VIEW_MODES.map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            title={t(`viewControls.views.${mode}`)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ease-spring duration-150 active:scale-[0.98] ${
              viewMode === mode
                ? 'bg-brand-brown text-white'
                : 'text-brand-grey-dark hover:bg-brand-grey hover:text-brand-dark'
            }`}
          >
            {t(`viewControls.views.${mode}`)}
          </button>
        ))}
      </div>

      <div className="flex bg-surface-raised/90 backdrop-blur-sm rounded-xl shadow-float border border-brand-grey/50 p-1 gap-1">
        <button
          onClick={toggleGrid}
          title={t('viewControls.gridTitle')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ease-spring duration-150 active:scale-[0.98] ${
            showGrid ? 'bg-brand-brown/10 text-brand-brown' : 'text-brand-grey-dark hover:bg-brand-grey'
          }`}
        >
          {t('viewControls.grid')}
        </button>
        <button
          onClick={toggleSnap}
          title={t('viewControls.snapTitle')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ease-spring duration-150 active:scale-[0.98] ${
            snapToGrid ? 'bg-brand-brown/10 text-brand-brown' : 'text-brand-grey-dark hover:bg-brand-grey'
          }`}
        >
          {t('viewControls.snap')}
        </button>
        <button
          onClick={handleWalk}
          title={t('viewControls.walkTitle')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ease-spring duration-150 active:scale-[0.98] flex items-center gap-1.5 ${
            walkActive ? 'bg-brand-brown text-white' : 'text-brand-grey-dark hover:bg-brand-grey'
          }`}
        >
          <Footprints size={12} weight="regular" />
          {t('viewControls.walk')}
        </button>
      </div>
    </div>
  )
}
