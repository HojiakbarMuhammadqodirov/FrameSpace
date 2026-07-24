import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  House, Cube, Sparkle, PencilSimple, ShoppingCart,
  FloppyDisk, X, Question, ShareNetwork, type Icon,
} from '@phosphor-icons/react'
import Navbar from '../components/common/Navbar'
import RoomScene from '../components/room/RoomScene'
import ViewControls from '../components/room/ViewControls'
import RoomEditor from '../components/room/RoomEditor'
import FurniturePanel from '../components/furniture/FurniturePanel'
import FurnitureControls from '../components/furniture/FurnitureControls'
import RecommendationsPanel from '../components/furniture/RecommendationsPanel'
import CartPanel from '../components/furniture/CartPanel'
import useStore from '../store/useStore'
import { roomsApi, designsApi } from '../services/api'
import { useAppToast } from '../hooks/useToastContext'
import { useLang } from '../i18n/LanguageProvider'

type Tab = 'room' | 'furniture' | 'selected' | 'recommendations' | 'cart'

const TABS: { id: Tab; tkey: string; Icon: Icon }[] = [
  { id: 'room',            tkey: 'room',      Icon: House },
  { id: 'furniture',       tkey: 'furniture', Icon: Cube },
  { id: 'recommendations', tkey: 'ai',        Icon: Sparkle },
  { id: 'selected',        tkey: 'edit',      Icon: PencilSimple },
  { id: 'cart',            tkey: 'cart',      Icon: ShoppingCart },
]

export default function RoomDesigner() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { currentRoom, setCurrentRoom, placedFurniture, totalCost, selectedFurnitureId, designs, catalog, undo, redo, historyIndex, history } = useStore()
  const toast = useAppToast()
  const { t } = useLang()
  const [activeTab, setActiveTab] = useState<Tab>('room')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [saving, setSaving] = useState(false)
  const [designName, setDesignName] = useState('')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    if (roomId && (!currentRoom || currentRoom._id !== roomId)) {
      roomsApi.getById(roomId).then(res => setCurrentRoom(res.data)).catch(() => navigate('/dashboard'))
    }
  }, [roomId])

  useEffect(() => {
    if (!localStorage.getItem('fs-drag-hint')) {
      const timer = setTimeout(() => {
        toast(t('designer.dragHint'), 'info', 6000)
        localStorage.setItem('fs-drag-hint', '1')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (selectedFurnitureId) setActiveTab('selected')
  }, [selectedFurnitureId])

  const handleKeyboard = useCallback((e: KeyboardEvent) => {
    const meta = e.ctrlKey || e.metaKey
    if (meta && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
    if (meta && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
    if (e.key === '?' && !meta) setShowShortcuts(s => !s)
    if (e.key === 'Escape') setShowShortcuts(false)
  }, [undo, redo])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  }, [handleKeyboard])

  const saveDesign = async () => {
    if (!currentRoom || !designName.trim()) return
    setSaving(true)
    try {
      const existingDesign = designs.find(d => {
        const rid = typeof d.roomId === 'string' ? d.roomId : (d.roomId as { _id: string })._id
        return rid === currentRoom._id
      })
      const payload = {
        name: designName,
        roomId: currentRoom._id,
        furnitureLayout: placedFurniture.map(pf => ({
          furnitureId: pf.furnitureId,
          name: pf.name,
          position: pf.position,
          rotation: pf.rotation,
          scale: pf.scale,
          color: pf.color,
          material: pf.material,
        })),
        totalCost: totalCost(),
      }
      if (existingDesign) {
        await designsApi.update(existingDesign._id, payload)
      } else {
        await designsApi.create(payload)
      }
      toast(t('designer.designSaved'), 'success')
      setShowSaveModal(false)
    } catch { toast(t('designer.saveFailed'), 'error') } finally { setSaving(false) }
  }

  const handleShare = async () => {
    const existingDesign = designs.find(d => {
      const rid = typeof d.roomId === 'string' ? d.roomId : (d.roomId as { _id: string })._id
      return currentRoom && rid === currentRoom._id
    })
    if (!existingDesign) { toast(t('designer.saveFirst'), 'info'); return }
    setSharing(true)
    try {
      const res = await designsApi.share(existingDesign._id)
      const url = `${window.location.origin}/shared/${res.data.shareToken}`
      setShareUrl(url)
      await navigator.clipboard.writeText(url).catch(() => {})
      toast(t('designer.shareCopied'), 'success')
    } catch { toast(t('designer.shareFailed'), 'error') } finally { setSharing(false) }
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-brand-grey-light overflow-hidden">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`flex-shrink-0 bg-surface-raised border-r border-brand-grey flex flex-col transition-all ease-spring duration-300 ${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}`}>
          {/* Tab nav */}
          <div className="flex border-b border-brand-grey flex-shrink-0">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                title={t(`designer.tabs.${tab.tkey}`)}
                className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ease-spring duration-150 border-b-2 ${
                  activeTab === tab.id
                    ? 'border-brand-brown text-brand-brown bg-brand-brown/5'
                    : 'border-transparent text-brand-grey-dark hover:text-brand-dark hover:bg-brand-grey'
                }`}>
                <tab.Icon size={16} weight="regular" />
                <span className="text-[10px] leading-tight">{t(`designer.tabs.${tab.tkey}`)}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === 'room'            && <RoomEditor />}
            {activeTab === 'furniture'       && <FurniturePanel />}
            {activeTab === 'recommendations' && <RecommendationsPanel />}
            {activeTab === 'selected'        && <FurnitureControls />}
            {activeTab === 'cart'            && <CartPanel />}
          </div>
        </div>

        {/* 3D Viewport */}
        <div className="flex-1 relative overflow-hidden">
          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="absolute top-3 left-3 z-20 w-8 h-8 bg-surface-raised/90 backdrop-blur-sm rounded-lg shadow-float border border-brand-grey/50 flex items-center justify-center hover:bg-surface-raised transition-colors ease-spring duration-150 active:scale-[0.98]"
          >
            <svg className="w-4 h-4 text-brand-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={sidebarOpen ? 'M11 19l-7-7 7-7M21 12H4' : 'M13 5l7 7-7 7M3 12h18'} />
            </svg>
          </button>

          {/* Unified command bar */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
            {/* Undo/redo */}
            <div className="flex bg-surface-raised/90 backdrop-blur-sm rounded-lg shadow-float border border-brand-grey/50 p-0.5">
              <button
                onClick={undo} disabled={historyIndex < 0}
                title="Undo (Ctrl+Z)"
                className="px-2.5 py-1.5 rounded-md text-xs font-mono text-brand-grey-dark hover:bg-brand-grey hover:text-brand-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all ease-spring duration-150 active:scale-[0.96]"
              >↩</button>
              <button
                onClick={redo} disabled={historyIndex >= history.length - 1}
                title="Redo (Ctrl+Y)"
                className="px-2.5 py-1.5 rounded-md text-xs font-mono text-brand-grey-dark hover:bg-brand-grey hover:text-brand-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all ease-spring duration-150 active:scale-[0.96]"
              >↪</button>
            </div>

            <div className="p-1 rounded-[1.25rem] bg-surface-raised/80 backdrop-blur-sm border border-brand-grey shadow-float flex items-center gap-2 px-3 py-1.5">
              {currentRoom && (
                <span className="text-xs font-medium text-brand-dark hidden sm:block">
                  {currentRoom.name}
                  <span className="text-brand-grey-dark font-mono"> · {currentRoom.dimensions.width}×{currentRoom.dimensions.depth}m</span>
                </span>
              )}
              {placedFurniture.length > 0 && (
                <span className="text-xs font-bold text-brand-brown font-mono tabular-nums bg-brand-brown/10 px-2 py-0.5 rounded-lg">
                  ${totalCost().toLocaleString()}
                </span>
              )}
              <button
                onClick={() => { setDesignName(currentRoom ? currentRoom.name + ' Design' : 'My Design'); setShowSaveModal(true) }}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                disabled={!currentRoom}
              >
                <FloppyDisk size={13} weight="regular" />
                {t('designer.save')}
              </button>
              <button
                onClick={handleShare}
                disabled={sharing || !currentRoom}
                title={t('designer.shareDesign')}
                className="btn-secondary text-xs py-1.5 px-2.5 flex items-center gap-1 disabled:opacity-40"
              >
                <ShareNetwork size={13} weight="regular" />
              </button>
              <button
                onClick={() => setShowShortcuts(s => !s)}
                title={t('designer.shortcuts') + ' (?)'}
                className="w-6 h-6 flex items-center justify-center rounded-lg text-brand-grey-dark hover:text-brand-dark hover:bg-brand-grey transition-colors ease-spring duration-150"
              >
                <Question size={13} weight="regular" />
              </button>
            </div>
          </div>

          {/* Dimension overlay — shown when furniture is selected */}
          {selectedFurnitureId && (() => {
            const pf = placedFurniture.find(f => (f._id || f.furnitureId) === selectedFurnitureId)
            const dims = pf?.furnitureData?.dimensions || catalog.find(c => c._id === pf?.furnitureId)?.dimensions
            if (!pf || !dims) return null
            return (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div className="bg-surface-raised/90 backdrop-blur-sm border border-brand-grey shadow-float rounded-xl px-4 py-2 flex items-center gap-3 text-xs font-mono text-brand-dark">
                  <span className="text-brand-grey-dark font-sans font-medium mr-1">{pf.name}</span>
                  <span>{dims.width}cm <span className="text-brand-grey-dark">W</span></span>
                  <span className="text-brand-grey/50">·</span>
                  <span>{dims.depth}cm <span className="text-brand-grey-dark">D</span></span>
                  <span className="text-brand-grey/50">·</span>
                  <span>{dims.height}cm <span className="text-brand-grey-dark">H</span></span>
                </div>
              </div>
            )
          })()}

          <RoomScene />
          <ViewControls />
        </div>
      </div>

      {/* Keyboard shortcuts panel */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowShortcuts(false)}>
          <div className="bg-surface-raised rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] font-semibold text-brand-brown uppercase tracking-[0.12em] mb-0.5">{t('designer.designWord')}</p>
                <h3 className="text-lg font-bold text-brand-dark tracking-tight">{t('designer.shortcuts')}</h3>
              </div>
              <button onClick={() => setShowShortcuts(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-grey-dark hover:bg-brand-grey transition-colors ease-spring duration-150">
                <X size={16} weight="regular" />
              </button>
            </div>
            <div className="space-y-1">
              {[
                ['Ctrl + Z', t('designer.keys.undo')],
                ['Ctrl + Y', t('designer.keys.redo')],
                ['Shift + drag', t('designer.keys.freeDrag')],
                ['W A S D', t('designer.keys.walk')],
                ['ESC', t('designer.keys.exit')],
                ['?', t('designer.keys.toggle')],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-brand-grey-dark">{label}</span>
                  <kbd className="text-xs font-mono bg-brand-grey text-brand-dark px-2 py-0.5 rounded-lg">{key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save design modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowSaveModal(false)}>
          <div className="bg-surface-raised rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-semibold text-brand-brown uppercase tracking-[0.12em] mb-0.5">{t('designer.designLabel')}</p>
                <h3 className="text-lg font-bold text-brand-dark tracking-tight">{t('designer.saveDesign')}</h3>
              </div>
              <button
                onClick={() => setShowSaveModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-grey-dark hover:bg-brand-grey transition-colors ease-spring duration-150"
              >
                <X size={16} weight="regular" />
              </button>
            </div>
            <label className="label">{t('designer.designName')}</label>
            <input className="input mb-4" value={designName} onChange={e => setDesignName(e.target.value)}
              placeholder={t('designer.designNamePlaceholder')} />
            <div className="text-sm text-brand-grey-dark mb-4 font-mono">
              {placedFurniture.length} {t('panels.itemsCount')} · ${totalCost().toLocaleString()}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowSaveModal(false)} className="btn-secondary flex-1">{t('common.cancel')}</button>
              <button onClick={saveDesign} disabled={saving || !designName.trim()} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('designer.saving')}
                  </>
                ) : (
                  <>
                    <FloppyDisk size={14} weight="regular" />
                    {t('designer.saveDesign')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
