import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Plus, Trash, House, PaintBrush, Sparkle,
  FolderSimple, GridFour, X, ArrowRight, Ruler,
  Palette, Wallet, MagicWand, Globe, Columns,
} from '@phosphor-icons/react'
import Navbar from '../components/common/Navbar'
import RoomMinimap from '../components/room/RoomMinimap'
import useStore from '../store/useStore'
import { roomsApi, designsApi, templatesApi } from '../services/api'
import { useAppToast } from '../hooks/useToastContext'
import { useLang } from '../i18n/LanguageProvider'
import type { Room, Design } from '../types'

interface RoomTemplate {
  id: string
  name: string
  description: string
  roomType: string
  stylePreference: string
  budget: string
  dimensions: { width: number; depth: number; height: number }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, rooms, setRooms, designs, setDesigns, setCurrentRoom, clearPlacedFurniture, setPlacedFurniture } = useStore()
  const toast = useAppToast()
  const { t } = useLang()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'rooms' | 'designs'>('rooms')
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [newRoom, setNewRoom] = useState({ name: '', width: 5, depth: 4, height: 2.7, roomType: 'living', stylePreference: 'modern', budget: 'mid-range' })
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: 'room' | 'design'; name: string } | null>(null)
  const [showGenerate, setShowGenerate] = useState(false)
  const [generateText, setGenerateText] = useState('')
  const [generating, setGenerating] = useState(false)
  const [templates, setTemplates] = useState<RoomTemplate[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const [roomsRes, designsRes, tmplRes] = await Promise.all([
          roomsApi.getAll(), designsApi.getAll(), templatesApi.getAll(),
        ])
        setRooms(roomsRes.data)
        setDesigns(designsRes.data)
        setTemplates(tmplRes.data)
      } catch { toast(t('dashboard.couldNotLoad'), 'error') } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleCreateRoom = async () => {
    setCreating(true)
    try {
      const res = await roomsApi.create({
        name: newRoom.name,
        dimensions: { width: newRoom.width, depth: newRoom.depth, height: newRoom.height },
        roomType: newRoom.roomType,
        stylePreference: newRoom.stylePreference,
        budget: newRoom.budget,
      })
      setRooms([res.data, ...rooms])
      setCurrentRoom(res.data)
      clearPlacedFurniture()
      setShowCreateRoom(false)
      setWizardStep(1)
      navigate(`/designer/${res.data._id}`)
    } catch { toast(t('dashboard.couldNotCreate'), 'error') } finally {
      setCreating(false)
    }
  }

  const closeWizard = () => { setShowCreateRoom(false); setWizardStep(1); setNewRoom({ name: '', width: 5, depth: 4, height: 2.7, roomType: 'living', stylePreference: 'modern', budget: 'mid-range' }) }

  const applyTemplate = (tmpl: RoomTemplate) => {
    setNewRoom({ name: tmpl.name, width: tmpl.dimensions.width, depth: tmpl.dimensions.depth, height: tmpl.dimensions.height, roomType: tmpl.roomType, stylePreference: tmpl.stylePreference, budget: tmpl.budget })
    setWizardStep(3)
  }

  const handleGenerate = async () => {
    if (!generateText.trim()) return
    setGenerating(true)
    try {
      const res = await roomsApi.generate(generateText)
      const room = res.data.room
      setRooms([room, ...rooms])
      setCurrentRoom(room)
      clearPlacedFurniture()
      setShowGenerate(false)
      setGenerateText('')
      navigate(`/designer/${room._id}`)
    } catch { toast(t('dashboard.couldNotGenerate'), 'error') } finally { setGenerating(false) }
  }

  const handleOpenRoom = (room: Room) => {
    setCurrentRoom(room)
    clearPlacedFurniture()
    navigate(`/designer/${room._id}`)
  }

  const handleOpenDesign = async (design: Design) => {
    try {
      const res = await designsApi.getById(design._id)
      const full = res.data
      const roomId = typeof full.roomId === 'string' ? full.roomId : full.roomId._id
      const roomRes = await roomsApi.getById(roomId)
      setCurrentRoom(roomRes.data)
      setPlacedFurniture(full.furnitureLayout.map((pf: { furnitureId: { _id?: string } | string; name: string; position: { x: number; y: number; z: number }; rotation: number; scale: number; color: string; material: string; _id?: string }) => ({
        ...pf,
        furnitureId: typeof pf.furnitureId === 'object' ? pf.furnitureId._id : pf.furnitureId,
        furnitureData: typeof pf.furnitureId === 'object' ? pf.furnitureId : undefined,
      })))
      navigate(`/designer/${roomId}`)
    } catch { toast(t('dashboard.couldNotLoadDesign'), 'error') }
  }

  const confirmDelete = (id: string, type: 'room' | 'design', name: string) => {
    setDeleteConfirm({ id, type, name })
  }

  const executeDelete = async () => {
    if (!deleteConfirm) return
    const { id, type } = deleteConfirm
    setDeleting(id)
    setDeleteConfirm(null)
    try {
      if (type === 'room') {
        await roomsApi.delete(id)
        setRooms(rooms.filter(r => r._id !== id))
      } else {
        await designsApi.delete(id)
        setDesigns(designs.filter(d => d._id !== id))
      }
    } catch { toast(t('dashboard.deleteFailed'), 'error') } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-brand-grey-light">
      <Navbar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">

          {/* ── Editorial header ── */}
          <div className="mb-8">
            {/* Eyebrow: date + actions */}
            <div className="flex items-center justify-between pb-4 border-b border-brand-grey">
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-grey-dark">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
              <div className="flex items-center gap-2">
                <Link to="/gallery" className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1.5">
                  <Globe size={14} weight="regular" /> {t('dashboard.gallery')}
                </Link>
                <button onClick={() => setShowGenerate(true)} className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1.5">
                  <MagicWand size={14} weight="regular" /> {t('dashboard.generate')}
                </button>
                <button onClick={() => setShowCreateRoom(true)} className="btn-primary text-sm py-1.5 flex items-center gap-1.5 active:scale-[0.98]">
                  <Plus size={15} weight="bold" /> {t('dashboard.newRoom')}
                </button>
              </div>
            </div>

            {/* Headline + inline stats */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pt-6">
              <h1 className="text-[2rem] sm:text-[2.5rem] md:text-[3.25rem] font-bold text-brand-dark tracking-tighter leading-[0.92]">
                {t('dashboard.welcomeBack')}{' '}
                <span className="text-brand-brown">{user?.name?.split(' ')[0]}</span>
              </h1>

              {/* Data strip — editorial right column */}
              <div className="flex items-center gap-5 pb-0.5 shrink-0">
                <div>
                  <div className="text-[1.75rem] font-bold text-brand-dark font-mono tabular-nums leading-none">{rooms.length}</div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-brand-grey-dark font-semibold mt-0.5">{t('dashboard.rooms')}</div>
                </div>
                <div className="w-px h-9 bg-brand-grey" />
                <div>
                  <div className="text-[1.75rem] font-bold text-brand-dark font-mono tabular-nums leading-none">{designs.length}</div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-brand-grey-dark font-semibold mt-0.5">{t('dashboard.designs')}</div>
                </div>
                <div className="w-px h-9 bg-brand-grey" />
                <div>
                  <div className="text-base font-bold text-brand-dark leading-none">{t(`dashboard.styles.${user?.preferences?.style || 'modern'}`)}</div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-brand-grey-dark font-semibold mt-0.5">{t('dashboard.style')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(['rooms', 'designs'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ease-spring duration-150 flex items-center gap-1.5 ${
                  activeTab === tab ? 'bg-brand-brown text-white' : 'bg-surface-raised text-brand-grey-dark hover:bg-brand-grey'
                }`}>
                {tab === 'rooms' ? <House size={14} weight="regular" /> : <GridFour size={14} weight="regular" />}
                {t(`dashboard.${tab}`)} ({tab === 'rooms' ? rooms.length : designs.length})
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            /* Skeleton loaders */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="card animate-pulse">
                  <div className="w-full h-36 bg-brand-grey rounded-xl mb-4" />
                  <div className="h-4 bg-brand-grey rounded w-3/4 mb-2" />
                  <div className="h-3 bg-brand-grey rounded w-1/2 mb-1" />
                  <div className="h-3 bg-brand-grey rounded w-2/3 mb-4" />
                  <div className="flex gap-2">
                    <div className="h-8 bg-brand-grey rounded-xl flex-1" />
                    <div className="h-8 w-10 bg-brand-grey rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === 'rooms' ? (
            rooms.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-brand-brown/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <House size={32} weight="regular" className="text-brand-brown" />
                </div>
                <h3 className="text-lg font-semibold text-brand-dark mb-2">{t('dashboard.noRoomsTitle')}</h3>
                <p className="text-brand-grey-dark mb-6">{t('dashboard.noRoomsDesc')}</p>
                <button onClick={() => setShowCreateRoom(true)} className="btn-primary">{t('dashboard.createRoom')}</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map(room => (
                  <div key={room._id} className="card hover:shadow-card-hover transition-shadow ease-spring duration-200 group">
                    <div className="rounded-xl mb-4 overflow-hidden relative bg-brand-grey-light">
                      <RoomMinimap room={room} svgW={280} svgH={140} />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-xl" />
                    </div>
                    <h3 className="font-semibold text-brand-dark mb-1 truncate">{room.name}</h3>
                    <p className="text-xs text-brand-grey-dark mb-1">
                      {t(`dashboard.roomTypes.${room.roomType}`)} · {t(`dashboard.styles.${room.stylePreference}`)}
                    </p>
                    <p className="text-xs text-brand-grey-dark font-mono mb-4">
                      {room.dimensions.width}m × {room.dimensions.depth}m × {room.dimensions.height}m
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenRoom(room)} className="btn-primary text-xs py-1.5 flex-1">
                        {t('dashboard.openDesigner')}
                      </button>
                      <button
                        onClick={() => confirmDelete(room._id, 'room', room.name)}
                        disabled={deleting === room._id}
                        className="btn-secondary text-xs py-1.5 px-3 text-red-500 border-red-200 hover:bg-red-50 flex items-center justify-center"
                      >
                        {deleting === room._id
                          ? <span className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                          : <Trash size={14} weight="regular" />
                        }
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            designs.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-brand-brown/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FolderSimple size={32} weight="regular" className="text-brand-brown" />
                </div>
                <h3 className="text-lg font-semibold text-brand-dark mb-2">{t('dashboard.noDesignsTitle')}</h3>
                <p className="text-brand-grey-dark">{t('dashboard.noDesignsDesc')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {designs.map(design => {
                  const room = typeof design.roomId === 'object' ? design.roomId : null
                  return (
                    <div key={design._id} className="card hover:shadow-card-hover transition-shadow ease-spring duration-200 group">
                      <div className="rounded-xl mb-4 overflow-hidden relative bg-brand-grey-light">
                        {room
                          ? <RoomMinimap room={room} furniture={design.furnitureLayout} svgW={280} svgH={140} />
                          : (
                            <div className="h-[140px] flex items-center justify-center opacity-40">
                              <PaintBrush size={40} weight="thin" className="text-brand-grey-dark" />
                            </div>
                          )
                        }
                        {design.isShared && (
                          <span className="absolute top-2 right-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            {t('dashboard.shared')}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-brand-dark mb-1 truncate">{design.name}</h3>
                      {room && <p className="text-xs text-brand-grey-dark mb-1">{room.name}</p>}
                      <p className="text-xs text-brand-grey-dark mb-1">
                        {design.furnitureLayout?.length || 0} {t('dashboard.itemsCount')}
                        {design.totalCost > 0 && <span className="font-mono"> · ${design.totalCost.toLocaleString()}</span>}
                      </p>
                      <p className="text-xs text-brand-grey-dark font-mono mb-4">
                        {new Date(design.updatedAt).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => handleOpenDesign(design)} className="btn-primary text-xs py-1.5 flex-1">
                          {t('dashboard.loadDesign')}
                        </button>
                        <Link
                          to={`/compare?a=${design._id}`}
                          title={t('dashboard.compareTitle')}
                          className="btn-secondary text-xs py-1.5 px-3 flex items-center justify-center"
                        >
                          <Columns size={13} weight="regular" />
                        </Link>
                        <button
                          onClick={() => confirmDelete(design._id, 'design', design.name)}
                          disabled={deleting === design._id}
                          className="btn-secondary text-xs py-1.5 px-3 text-red-500 border-red-200 hover:bg-red-50 flex items-center justify-center"
                        >
                          {deleting === design._id
                            ? <span className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                            : <Trash size={14} weight="regular" />
                          }
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          )}
        </div>
      </div>

      {/* Create Room Wizard */}
      {showCreateRoom && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeWizard}>
          <div className="bg-surface-raised rounded-[1.75rem] shadow-2xl w-full max-w-md animate-slide-up overflow-hidden"
            onClick={e => e.stopPropagation()}>

            {/* Wizard header */}
            <div className="relative px-6 pt-6 pb-0 overflow-hidden">
              {/* Large faded step numeral — editorial background element */}
              <span className="absolute -top-3 -right-1 text-[7rem] font-black text-brand-brown/[0.06] leading-none select-none pointer-events-none tabular-nums">
                {String(wizardStep).padStart(2, '0')}
              </span>

              <div className="flex items-start justify-between mb-5 relative">
                <div>
                  {/* Step dots */}
                  <div className="flex items-center gap-1.5 mb-3">
                    {[1, 2, 3].map(s => (
                      <div key={s} className={`rounded-full transition-all ease-spring duration-300 ${
                        s === wizardStep ? 'w-5 h-1.5 bg-brand-brown' : s < wizardStep ? 'w-1.5 h-1.5 bg-brand-brown/50' : 'w-1.5 h-1.5 bg-brand-grey'
                      }`} />
                    ))}
                    <span className="text-[10px] font-semibold text-brand-grey-dark uppercase tracking-[0.12em] ml-1">
                      {wizardStep} {t('dashboard.of')} 3
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-brand-dark tracking-tighter leading-tight">
                    {wizardStep === 1 ? t('dashboard.nameYourRoom') : wizardStep === 2 ? t('dashboard.setDimensions') : t('dashboard.styleBudget')}
                  </h2>
                  <p className="text-sm text-brand-grey-dark mt-0.5">
                    {wizardStep === 1 ? t('dashboard.step1Sub') : wizardStep === 2 ? t('dashboard.step2Sub') : t('dashboard.step3Sub')}
                  </p>
                </div>
                <button onClick={closeWizard} className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-grey-dark hover:bg-brand-grey transition-colors ease-spring duration-150 mt-0.5 shrink-0">
                  <X size={16} weight="regular" />
                </button>
              </div>

              {/* Thin rule */}
              <div className="border-t border-brand-grey mb-5" />
            </div>

            {/* Step content */}
            <div className="px-6 pb-6">
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="label">{t('dashboard.roomName')}</label>
                    <input className="input" placeholder={t('dashboard.roomNamePlaceholder')} autoFocus
                      value={newRoom.name} onChange={e => setNewRoom(r => ({ ...r, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">{t('dashboard.roomType')}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['living', 'bedroom', 'dining', 'office', 'kitchen', 'bathroom'].map(rt => (
                        <button key={rt} type="button"
                          onClick={() => setNewRoom(r => ({ ...r, roomType: rt }))}
                          className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ease-spring duration-150 border ${
                            newRoom.roomType === rt
                              ? 'bg-brand-brown text-white border-brand-brown'
                              : 'bg-surface-raised text-brand-dark border-brand-grey hover:border-brand-brown/50'
                          }`}>
                          {t(`dashboard.roomTypes.${rt}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick templates */}
                  {templates.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-brand-grey-dark uppercase tracking-[0.1em] mb-2">{t('dashboard.orTemplate')}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {templates.slice(0, 4).map(tmpl => (
                          <button key={tmpl.id} type="button" onClick={() => applyTemplate(tmpl)}
                            className="text-left p-3 rounded-xl border border-brand-grey bg-surface-raised hover:border-brand-brown/50 transition-all ease-spring duration-150">
                            <div className="text-xs font-semibold text-brand-dark mb-0.5">{tmpl.name}</div>
                            <div className="text-[10px] text-brand-grey-dark">{t(`dashboard.styles.${tmpl.stylePreference}`)} · {t(`dashboard.roomTypes.${tmpl.roomType}`)}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button onClick={closeWizard} className="btn-secondary flex-1">{t('common.cancel')}</button>
                    <button
                      disabled={!newRoom.name.trim()}
                      onClick={() => setWizardStep(2)}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      {t('common.next')} <ArrowRight size={14} weight="bold" />
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Ruler size={16} weight="regular" className="text-brand-brown" />
                    <span className="text-sm text-brand-grey-dark">{t('dashboard.dimsInMeters')}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {(['width', 'depth', 'height'] as const).map(dim => (
                      <div key={dim}>
                        <label className="label">{t(`dashboard.${dim}`)}</label>
                        <input type="number" className="input font-mono" step="0.1"
                          min={dim === 'height' ? 2 : 1} max={dim === 'height' ? 6 : 30}
                          value={newRoom[dim]}
                          onChange={e => setNewRoom(r => ({ ...r, [dim]: parseFloat(e.target.value) || 0 }))} />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-brand-grey-dark font-mono">
                    {t('dashboard.floorArea')} <span className="text-brand-dark font-semibold">{(newRoom.width * newRoom.depth).toFixed(1)} m²</span>
                  </p>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setWizardStep(1)} className="btn-secondary flex-1">{t('common.back')}</button>
                    <button onClick={() => setWizardStep(3)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                      {t('common.next')} <ArrowRight size={14} weight="bold" />
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Palette size={16} weight="regular" className="text-brand-brown" />
                      <label className="label mb-0">{t('dashboard.stylePreference')}</label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {['minimalist', 'modern', 'cozy', 'luxury', 'industrial', 'scandinavian'].map(s => (
                        <button key={s} type="button"
                          onClick={() => setNewRoom(r => ({ ...r, stylePreference: s }))}
                          className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ease-spring duration-150 border ${
                            newRoom.stylePreference === s
                              ? 'bg-brand-brown text-white border-brand-brown'
                              : 'bg-surface-raised text-brand-dark border-brand-grey hover:border-brand-brown/50'
                          }`}>
                          {t(`dashboard.styles.${s}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Wallet size={16} weight="regular" className="text-brand-brown" />
                      <label className="label mb-0">{t('dashboard.budgetPerItem')}</label>
                    </div>
                    <div className="flex flex-col gap-2">
                      {(['budget', 'mid-range', 'premium'] as const).map(value => (
                        <button key={value} type="button"
                          onClick={() => setNewRoom(r => ({ ...r, budget: value }))}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ease-spring duration-150 border text-left ${
                            newRoom.budget === value
                              ? 'bg-brand-brown/10 border-brand-brown text-brand-dark'
                              : 'bg-surface-raised border-brand-grey hover:border-brand-brown/50 text-brand-dark'
                          }`}>
                          <span>{t(`dashboard.budgets.${value}`)}</span>
                          <span className="text-xs text-brand-grey-dark font-mono">{t(`dashboard.budgetSub.${value}`)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setWizardStep(2)} className="btn-secondary flex-1">{t('common.back')}</button>
                    <button
                      onClick={handleCreateRoom}
                      disabled={creating}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      {creating ? (
                        <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('dashboard.creating')}</>
                      ) : (
                        <>{t('dashboard.createOpen')}</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Text-to-room generate modal */}
      {showGenerate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowGenerate(false)}>
          <div className="bg-surface-raised rounded-[1.75rem] shadow-2xl w-full max-w-md animate-slide-up overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] font-semibold text-brand-brown uppercase tracking-[0.12em] mb-0.5">AI</p>
                  <h2 className="text-xl font-bold text-brand-dark tracking-tight">{t('dashboard.generateFromText')}</h2>
                </div>
                <button onClick={() => setShowGenerate(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-grey-dark hover:bg-brand-grey transition-colors ease-spring duration-150">
                  <X size={16} weight="regular" />
                </button>
              </div>
              <p className="text-sm text-brand-grey-dark mb-4">{t('dashboard.generateDesc')}</p>
              <textarea
                className="input resize-none mb-1"
                rows={4}
                placeholder={t('dashboard.generatePlaceholder')}
                value={generateText}
                onChange={e => setGenerateText(e.target.value)}
                autoFocus
              />
              <p className="text-[11px] text-brand-grey-dark mb-4">{t('dashboard.generateHint')}</p>
              <div className="flex gap-3">
                <button onClick={() => setShowGenerate(false)} className="btn-secondary flex-1">{t('common.cancel')}</button>
                <button
                  onClick={handleGenerate}
                  disabled={generating || !generateText.trim()}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('dashboard.generating')}</>
                  ) : (
                    <><MagicWand size={14} weight="regular" /> {t('dashboard.generateRoom')}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inline delete confirmation dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setDeleteConfirm(null)}>
          <div className="bg-surface-raised rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up"
            onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-brand-dark mb-2">
              {t('dashboard.deleteTitle', { type: deleteConfirm.type === 'room' ? t('dashboard.roomWord') : t('dashboard.designWord') })}
            </h3>
            <p className="text-sm text-brand-grey-dark mb-6">
              {t('dashboard.deleteDesc', { name: deleteConfirm.name })}
              {deleteConfirm.type === 'room' && t('dashboard.deleteRoomExtra')}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">{t('common.cancel')}</button>
              <button onClick={executeDelete} className="flex-1 bg-red-500 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-red-600 active:scale-[0.98] transition-all ease-spring duration-200">
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
