import { useRef, useEffect, useCallback } from 'react'
import { House } from '@phosphor-icons/react'
import { useThreeScene } from '../../hooks/useThreeScene'
import useStore from '../../store/useStore'

export default function RoomScene() {
  const mountRef = useRef<HTMLDivElement>(null)
  const { currentRoom, placedFurniture, selectedFurnitureId, showGrid, snapToGrid,
          setSelectedFurniture, updateFurniture, pushSnapshot, viewMode } = useStore()

  const { buildRoom, updateFurniture3D, setView, setTimeOfDay, toggleWalkMode } = useThreeScene(
    mountRef,
    {
      onFurnitureSelect: useCallback((id) => setSelectedFurniture(id), []),
      onFurnitureMove: useCallback((id, pos) => {
        pushSnapshot()
        updateFurniture(id, { position: pos })
      }, []),
    },
    { snapToGrid }
  )

  // Expose walk mode and time-of-day via window for RoomDesigner integration
  useEffect(() => {
    (window as Window & { _fsToggleWalk?: (cb?: () => void) => void })._fsToggleWalk = toggleWalkMode;
    (window as Window & { _fsSetTime?: (h: number) => void })._fsSetTime = setTimeOfDay
    return () => {
      delete (window as Window & { _fsToggleWalk?: unknown })._fsToggleWalk
      delete (window as Window & { _fsSetTime?: unknown })._fsSetTime
    }
  }, [toggleWalkMode, setTimeOfDay])

  useEffect(() => {
    if (currentRoom) buildRoom(currentRoom, showGrid)
  }, [currentRoom, showGrid, buildRoom])

  useEffect(() => {
    updateFurniture3D(placedFurniture, selectedFurnitureId)
  }, [placedFurniture, selectedFurnitureId, updateFurniture3D])

  useEffect(() => {
    if (currentRoom) setView(viewMode, currentRoom.dimensions)
    else setView(viewMode)
  }, [viewMode, setView, currentRoom])

  return (
    <div ref={mountRef} className="w-full h-full relative overflow-hidden">
      {!currentRoom && (
        <div className="absolute inset-0 flex items-center justify-center bg-brand-grey/30">
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-brown/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <House size={32} weight="regular" className="text-brand-brown" />
            </div>
            <p className="text-brand-dark font-medium">No room loaded</p>
            <p className="text-brand-grey-dark text-sm">Create or select a room from the dashboard</p>
          </div>
        </div>
      )}
    </div>
  )
}
