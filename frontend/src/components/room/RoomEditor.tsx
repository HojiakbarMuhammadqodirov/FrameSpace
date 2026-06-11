import { useState } from 'react'
import { House, Sun } from '@phosphor-icons/react'
import useStore from '../../store/useStore'
import { roomsApi } from '../../services/api'
import type { Room, RoomWindow, RoomDoor } from '../../types'

const WALL_COLORS = ['#F5F0EB','#FFFFFF','#E8E0D5','#D4C4B0','#C8D8E8','#E8D0C8','#D8E8D0','#2C2C2C']
const FLOOR_COLORS = ['#C4A882','#8B7355','#D4C4B0','#6B5B45','#4A4A4A','#E8E0D0','#A0896A','#7B6B5A']
const FLOOR_TYPES = ['hardwood','carpet','tile','concrete','laminate']

export default function RoomEditor() {
  const { currentRoom, setCurrentRoom, upsertRoom } = useStore()
  const [saving, setSaving] = useState(false)
  const [section, setSection] = useState<'dims'|'style'|'windows'|'doors'|'light'>('dims')
  const [timeOfDay, setTimeHour] = useState(12)

  if (!currentRoom) return (
    <div className="p-4 text-center text-brand-grey-dark">
      <div className="w-10 h-10 bg-brand-brown/10 rounded-xl flex items-center justify-center mx-auto mb-2">
        <House size={20} weight="regular" className="text-brand-brown" />
      </div>
      <p className="text-sm">No room selected</p>
    </div>
  )

  const update = (patch: Partial<Room>) => setCurrentRoom({ ...currentRoom, ...patch })
  const updateStyle = (patch: Partial<Room['style']>) =>
    update({ style: { ...currentRoom.style, ...patch } })
  const updateDims = (patch: Partial<Room['dimensions']>) =>
    update({ dimensions: { ...currentRoom.dimensions, ...patch } })

  const save = async () => {
    setSaving(true)
    try {
      const res = await roomsApi.update(currentRoom._id, currentRoom)
      upsertRoom(res.data)
    } catch { /* ignore */ } finally { setSaving(false) }
  }

  const addWindow = () => {
    const win: RoomWindow = { wall: 'north', position: 0.5, width: 1.2, height: 1.2, sillHeight: 0.9, style: 'single' }
    update({ windows: [...(currentRoom.windows || []), win] })
  }

  const addDoor = () => {
    const door: RoomDoor = { wall: 'south', position: 0.5, width: 0.9, style: 'single' }
    update({ doors: [...(currentRoom.doors || []), door] })
  }

  const removeWindow = (i: number) =>
    update({ windows: currentRoom.windows.filter((_, j) => j !== i) })
  const removeDoor = (i: number) =>
    update({ doors: currentRoom.doors.filter((_, j) => j !== i) })

  const updateWindow = (i: number, patch: Partial<RoomWindow>) =>
    update({ windows: currentRoom.windows.map((w, j) => j === i ? { ...w, ...patch } : w) })
  const updateDoor = (i: number, patch: Partial<RoomDoor>) =>
    update({ doors: currentRoom.doors.map((d, j) => j === i ? { ...d, ...patch } : d) })

  const handleTimeChange = (h: number) => {
    setTimeHour(h)
    const fn = (window as Window & { _fsSetTime?: (h: number) => void })._fsSetTime
    fn?.(h)
  }

  const sections = [
    { id: 'dims',    label: 'Dims' },
    { id: 'style',   label: 'Style' },
    { id: 'windows', label: 'Windows' },
    { id: 'doors',   label: 'Doors' },
    { id: 'light',   label: 'Light' },
  ] as const

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1 p-3 border-b border-brand-grey flex-shrink-0">
        {sections.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ease-spring duration-150 ${
              section === s.id ? 'bg-brand-brown text-white' : 'text-brand-grey-dark hover:bg-brand-grey'
            }`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {section === 'dims' && (
          <>
            <div>
              <label className="label text-xs">Room name</label>
              <input className="input text-sm" value={currentRoom.name}
                onChange={e => update({ name: e.target.value })} />
            </div>
            {(['width', 'depth', 'height'] as const).map(dim => (
              <div key={dim}>
                <label className="label text-xs capitalize">{dim} (m)</label>
                <input type="number" className="input text-sm font-mono" step="0.1"
                  min={dim === 'height' ? 2 : 1} max={dim === 'height' ? 6 : 30}
                  value={currentRoom.dimensions[dim]}
                  onChange={e => updateDims({ [dim]: parseFloat(e.target.value) })} />
              </div>
            ))}
            <div>
              <label className="label text-xs">Room type</label>
              <select className="input text-sm" value={currentRoom.roomType}
                onChange={e => update({ roomType: e.target.value as Room['roomType'] })}>
                {['living','bedroom','dining','office','kitchen'].map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)} Room</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label text-xs">Style preference</label>
              <select className="input text-sm" value={currentRoom.stylePreference}
                onChange={e => update({ stylePreference: e.target.value as Room['stylePreference'] })}>
                {['minimalist','modern','cozy','luxury','industrial','scandinavian'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label text-xs">Budget</label>
              <select className="input text-sm" value={currentRoom.budget}
                onChange={e => update({ budget: e.target.value as Room['budget'] })}>
                <option value="budget">Budget</option>
                <option value="mid-range">Mid-range</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </>
        )}

        {section === 'style' && (
          <>
            <div>
              <label className="label text-xs">Wall color</label>
              <div className="flex flex-wrap gap-2">
                {WALL_COLORS.map(c => (
                  <button key={c} onClick={() => updateStyle({ wallColor: c })}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ease-spring duration-150 ${
                      currentRoom.style?.wallColor === c ? 'border-brand-brown scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ background: c }} />
                ))}
              </div>
              <input type="color" className="mt-2 w-full h-8 rounded-lg cursor-pointer border border-brand-grey"
                value={currentRoom.style?.wallColor || '#F5F0EB'}
                onChange={e => updateStyle({ wallColor: e.target.value })} />
            </div>
            <div>
              <label className="label text-xs">Floor color</label>
              <div className="flex flex-wrap gap-2">
                {FLOOR_COLORS.map(c => (
                  <button key={c} onClick={() => updateStyle({ floorColor: c })}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ease-spring duration-150 ${
                      currentRoom.style?.floorColor === c ? 'border-brand-brown scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ background: c }} />
                ))}
              </div>
              <input type="color" className="mt-2 w-full h-8 rounded-lg cursor-pointer border border-brand-grey"
                value={currentRoom.style?.floorColor || '#C4A882'}
                onChange={e => updateStyle({ floorColor: e.target.value })} />
            </div>
            <div>
              <label className="label text-xs">Floor type</label>
              <select className="input text-sm" value={currentRoom.style?.floorType || 'hardwood'}
                onChange={e => updateStyle({ floorType: e.target.value as Room['style']['floorType'] })}>
                {FLOOR_TYPES.map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label text-xs">Ceiling color</label>
              <input type="color" className="w-full h-8 rounded-lg cursor-pointer border border-brand-grey"
                value={currentRoom.style?.ceilingColor || '#FFFFFF'}
                onChange={e => updateStyle({ ceilingColor: e.target.value })} />
            </div>
          </>
        )}

        {section === 'windows' && (
          <>
            {currentRoom.windows?.map((win, i) => (
              <div key={i} className="card p-3 !rounded-xl border border-brand-grey">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-brand-dark">Window {i+1}</span>
                  <button onClick={() => removeWindow(i)} className="text-red-400 hover:text-red-600 text-xs transition-colors ease-spring duration-150">Remove</button>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="label text-xs">Wall</label>
                    <select className="input text-xs" value={win.wall}
                      onChange={e => updateWindow(i, { wall: e.target.value as RoomWindow['wall'] })}>
                      {['north','south','east','west'].map(w => (
                        <option key={w} value={w}>{w.charAt(0).toUpperCase()+w.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label text-xs">Width (m)</label>
                      <input type="number" className="input text-xs font-mono" step="0.1" min="0.5" max="3"
                        value={win.width} onChange={e => updateWindow(i, { width: +e.target.value })} />
                    </div>
                    <div>
                      <label className="label text-xs">Height (m)</label>
                      <input type="number" className="input text-xs font-mono" step="0.1" min="0.3" max="2.5"
                        value={win.height} onChange={e => updateWindow(i, { height: +e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="label text-xs">Position (0–1 along wall)</label>
                    <input type="range" className="w-full" min="0.1" max="0.9" step="0.05"
                      value={win.position} onChange={e => updateWindow(i, { position: +e.target.value })} />
                  </div>
                  <div>
                    <label className="label text-xs">Sill height (m)</label>
                    <input type="number" className="input text-xs font-mono" step="0.05" min="0.3" max="1.5"
                      value={win.sillHeight} onChange={e => updateWindow(i, { sillHeight: +e.target.value })} />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addWindow} className="btn-secondary text-xs w-full">+ Add window</button>
          </>
        )}

        {section === 'doors' && (
          <>
            {currentRoom.doors?.map((door, i) => (
              <div key={i} className="card p-3 !rounded-xl border border-brand-grey">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-brand-dark">Door {i+1}</span>
                  <button onClick={() => removeDoor(i)} className="text-red-400 hover:text-red-600 text-xs transition-colors ease-spring duration-150">Remove</button>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="label text-xs">Wall</label>
                    <select className="input text-xs" value={door.wall}
                      onChange={e => updateDoor(i, { wall: e.target.value as RoomDoor['wall'] })}>
                      {['north','south','east','west'].map(w => (
                        <option key={w} value={w}>{w.charAt(0).toUpperCase()+w.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs">Width (m)</label>
                    <input type="number" className="input text-xs font-mono" step="0.05" min="0.7" max="1.5"
                      value={door.width} onChange={e => updateDoor(i, { width: +e.target.value })} />
                  </div>
                  <div>
                    <label className="label text-xs">Position (0–1 along wall)</label>
                    <input type="range" className="w-full" min="0.1" max="0.9" step="0.05"
                      value={door.position} onChange={e => updateDoor(i, { position: +e.target.value })} />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addDoor} className="btn-secondary text-xs w-full">+ Add door</button>
          </>
        )}

        {section === 'light' && (
          <>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label text-xs flex items-center gap-1.5">
                  <Sun size={13} weight="regular" className="text-brand-brown" />
                  Time of day
                </label>
                <span className="text-xs font-mono text-brand-dark">
                  {String(timeOfDay).padStart(2, '0')}:00
                </span>
              </div>
              <input
                type="range" min={6} max={22} step={1}
                value={timeOfDay}
                onChange={e => handleTimeChange(+e.target.value)}
                className="w-full accent-[rgb(var(--brand-brown))]"
              />
              <div className="flex justify-between text-[10px] text-brand-grey-dark mt-1">
                <span>Dawn 6am</span>
                <span>Noon</span>
                <span>Dusk 10pm</span>
              </div>
            </div>
            <p className="text-[11px] text-brand-grey-dark leading-relaxed">
              Adjusts the sun angle and color temperature in real time. Dawn and dusk cast warm orange light; midday is bright white.
            </p>
          </>
        )}
      </div>

      <div className="p-3 border-t border-brand-grey flex-shrink-0">
        <button onClick={save} disabled={saving} className="btn-primary w-full text-sm">
          {saving ? 'Saving...' : 'Save room'}
        </button>
      </div>
    </div>
  )
}
