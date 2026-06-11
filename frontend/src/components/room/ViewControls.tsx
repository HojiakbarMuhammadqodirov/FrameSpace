import { useState } from 'react'
import { Footprints } from '@phosphor-icons/react'
import useStore from '../../store/useStore'
import type { ViewMode } from '../../types'

const VIEWS: { mode: ViewMode; label: string }[] = [
  { mode: 'default',    label: 'Default' },
  { mode: 'free',       label: 'Free' },
  { mode: 'front',      label: 'Front' },
  { mode: 'side-left',  label: 'Left' },
  { mode: 'side-right', label: 'Right' },
  { mode: 'top',        label: 'Top' },
]

export default function ViewControls() {
  const { viewMode, setViewMode, showGrid, toggleGrid, snapToGrid, toggleSnap } = useStore()
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
        {VIEWS.map(v => (
          <button
            key={v.mode}
            onClick={() => setViewMode(v.mode)}
            title={v.label}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ease-spring duration-150 active:scale-[0.98] ${
              viewMode === v.mode
                ? 'bg-brand-brown text-white'
                : 'text-brand-grey-dark hover:bg-brand-grey hover:text-brand-dark'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="flex bg-surface-raised/90 backdrop-blur-sm rounded-xl shadow-float border border-brand-grey/50 p-1 gap-1">
        <button
          onClick={toggleGrid}
          title="Toggle grid"
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ease-spring duration-150 active:scale-[0.98] ${
            showGrid ? 'bg-brand-brown/10 text-brand-brown' : 'text-brand-grey-dark hover:bg-brand-grey'
          }`}
        >
          Grid
        </button>
        <button
          onClick={toggleSnap}
          title="Snap to grid (hold Shift to bypass)"
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ease-spring duration-150 active:scale-[0.98] ${
            snapToGrid ? 'bg-brand-brown/10 text-brand-brown' : 'text-brand-grey-dark hover:bg-brand-grey'
          }`}
        >
          Snap
        </button>
        <button
          onClick={handleWalk}
          title="Walk-through mode (WASD to move, ESC to exit)"
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ease-spring duration-150 active:scale-[0.98] flex items-center gap-1.5 ${
            walkActive ? 'bg-brand-brown text-white' : 'text-brand-grey-dark hover:bg-brand-grey'
          }`}
        >
          <Footprints size={12} weight="regular" />
          Walk
        </button>
      </div>
    </div>
  )
}
