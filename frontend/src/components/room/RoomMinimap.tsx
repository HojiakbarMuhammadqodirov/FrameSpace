import type { Room, PlacedFurniture } from '../../types'

interface Props {
  room: Room
  furniture?: PlacedFurniture[]
  svgW?: number
  svgH?: number
}

const WALL = 9

function catColor(cat: string): string {
  const m: Record<string, string> = {
    sofa: '#B8896A', chair: '#C49A7A', table: '#8B7355', bed: '#9A8070',
    desk: '#8D7B6A', shelf: '#A08060', wardrobe: '#7A6B55', storage: '#957A60',
    lighting: '#D4A574', rug: '#C4A882', plant: '#5A8F5A', decor: '#B0956A',
  }
  return m[cat] || '#A0896A'
}

export default function RoomMinimap({ room, furniture = [], svgW = 280, svgH = 160 }: Props) {
  const rW = room.dimensions.width
  const rD = room.dimensions.depth

  const innerW = svgW - WALL * 2 - 8
  const innerH = svgH - WALL * 2 - 8
  const scale = Math.min(innerW / rW, innerH / rD)
  const pxW = rW * scale
  const pxH = rD * scale
  const ox = (svgW - pxW) / 2
  const oy = (svgH - pxH) / 2

  const floorColor = room.style?.floorColor || '#C4A882'
  const wallColor  = room.style?.wallColor  || '#E8E0D5'

  // 3D world coord → SVG pixel (center of room is world 0,0)
  const sx = (x: number) => ox + (x + rW / 2) * scale
  const sz = (z: number) => oy + (z + rD / 2) * scale

  return (
    <svg
      width={svgW} height={svgH}
      viewBox={`0 0 ${svgW} ${svgH}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {/* Floor */}
      <rect x={ox} y={oy} width={pxW} height={pxH} fill={floorColor} />

      {/* Subtle floor grid */}
      {Array.from({ length: Math.ceil(rW) + 1 }, (_, i) => (
        <line key={`gx${i}`}
          x1={ox + i * scale} y1={oy}
          x2={ox + i * scale} y2={oy + pxH}
          stroke="rgba(0,0,0,0.07)" strokeWidth="0.6" />
      ))}
      {Array.from({ length: Math.ceil(rD) + 1 }, (_, i) => (
        <line key={`gz${i}`}
          x1={ox} y1={oy + i * scale}
          x2={ox + pxW} y2={oy + i * scale}
          stroke="rgba(0,0,0,0.07)" strokeWidth="0.6" />
      ))}

      {/* Rug footprints first (drawn below furniture) */}
      {furniture.filter(f => f.furnitureData?.category === 'rug').map((pf, i) => {
        const fw = (pf.furnitureData!.dimensions.width  / 100) * scale
        const fd = (pf.furnitureData!.dimensions.depth  / 100) * scale
        const cx = sx(pf.position.x)
        const cz = sz(pf.position.z)
        return (
          <g key={`rug${i}`} transform={`rotate(${pf.rotation || 0}, ${cx}, ${cz})`}>
            <rect x={cx - fw / 2} y={cz - fd / 2} width={fw} height={fd}
              fill={pf.color || '#C4A882'} opacity="0.55"
              stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" rx="1" />
          </g>
        )
      })}

      {/* North wall */}
      <rect x={ox - WALL} y={oy - WALL} width={pxW + WALL * 2} height={WALL} fill={wallColor} />
      {/* South wall */}
      <rect x={ox - WALL} y={oy + pxH} width={pxW + WALL * 2} height={WALL} fill={wallColor} />
      {/* West wall */}
      <rect x={ox - WALL} y={oy} width={WALL} height={pxH} fill={wallColor} />
      {/* East wall */}
      <rect x={ox + pxW} y={oy} width={WALL} height={pxH} fill={wallColor} />

      {/* Wall corner caps */}
      <rect x={ox - WALL} y={oy - WALL} width={WALL} height={WALL} fill={wallColor} />
      <rect x={ox + pxW} y={oy - WALL} width={WALL} height={WALL} fill={wallColor} />
      <rect x={ox - WALL} y={oy + pxH} width={WALL} height={WALL} fill={wallColor} />
      <rect x={ox + pxW} y={oy + pxH} width={WALL} height={WALL} fill={wallColor} />

      {/* Windows — cut out of walls as glass-blue openings */}
      {room.windows?.map((win, i) => {
        const wPx = win.width * scale
        const [x, y, w, h] =
          win.wall === 'north' ? [ox + win.position * pxW - wPx / 2, oy - WALL, wPx, WALL]
          : win.wall === 'south' ? [ox + win.position * pxW - wPx / 2, oy + pxH, wPx, WALL]
          : win.wall === 'west'  ? [ox - WALL, oy + win.position * pxH - wPx / 2, WALL, wPx]
          : /* east */             [ox + pxW,  oy + win.position * pxH - wPx / 2, WALL, wPx]
        return (
          <g key={`win${i}`}>
            <rect x={x} y={y} width={w} height={h} fill="rgba(147,210,235,0.85)" />
            <rect x={x} y={y} width={w} height={h} fill="none"
              stroke="rgba(80,160,200,0.7)" strokeWidth="0.8" />
          </g>
        )
      })}

      {/* Doors — opening gap + swing arc */}
      {room.doors?.map((door, i) => {
        const dPx = door.width * scale
        const isNS = door.wall === 'north' || door.wall === 'south'
        const [x, y, w, h] =
          door.wall === 'north' ? [ox + door.position * pxW - dPx / 2, oy - WALL, dPx, WALL]
          : door.wall === 'south' ? [ox + door.position * pxW - dPx / 2, oy + pxH, dPx, WALL]
          : door.wall === 'west'  ? [ox - WALL, oy + door.position * pxH - dPx / 2, WALL, dPx]
          : /* east */              [ox + pxW,  oy + door.position * pxH - dPx / 2, WALL, dPx]

        // Door swing arc (quarter circle into the room)
        let arcX = x, arcY = y, arcR = dPx
        let sweepPath = ''
        if (door.wall === 'north') {
          arcX = x; arcY = oy
          sweepPath = `M ${arcX} ${arcY} L ${arcX} ${arcY + arcR} A ${arcR} ${arcR} 0 0 1 ${arcX + arcR} ${arcY} Z`
        } else if (door.wall === 'south') {
          arcX = x; arcY = oy + pxH
          sweepPath = `M ${arcX} ${arcY} L ${arcX} ${arcY - arcR} A ${arcR} ${arcR} 0 0 0 ${arcX + arcR} ${arcY} Z`
        } else if (door.wall === 'west') {
          arcX = ox; arcY = y
          sweepPath = `M ${arcX} ${arcY} L ${arcX + arcR} ${arcY} A ${arcR} ${arcR} 0 0 1 ${arcX} ${arcY + arcR} Z`
        } else {
          arcX = ox + pxW; arcY = y
          sweepPath = `M ${arcX} ${arcY} L ${arcX - arcR} ${arcY} A ${arcR} ${arcR} 0 0 0 ${arcX} ${arcY + arcR} Z`
        }

        return (
          <g key={`door${i}`}>
            <rect x={x} y={y} width={w} height={h} fill={floorColor} />
            <path d={sweepPath} fill="rgba(180,150,100,0.15)" stroke="rgba(140,110,70,0.5)" strokeWidth="0.6" />
          </g>
        )
      })}

      {/* Non-rug furniture footprints */}
      {furniture.filter(f => f.furnitureData?.category !== 'rug').map((pf, i) => {
        const fw = (pf.furnitureData?.dimensions.width  || 80) / 100 * scale
        const fd = (pf.furnitureData?.dimensions.depth  || 80) / 100 * scale
        const cx = sx(pf.position.x)
        const cz = sz(pf.position.z)
        const col = pf.color || catColor(pf.furnitureData?.category || '')
        const isLight = pf.furnitureData?.category === 'lighting'
        return (
          <g key={`f${i}`} transform={`rotate(${pf.rotation || 0}, ${cx}, ${cz})`}>
            {isLight ? (
              <circle cx={cx} cy={cz} r={Math.max(fw, fd) / 2}
                fill={col} opacity="0.75"
                stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
            ) : (
              <rect x={cx - fw / 2} y={cz - fd / 2} width={fw} height={fd}
                fill={col} opacity="0.85"
                stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" rx="1.5" />
            )}
          </g>
        )
      })}

      {/* Room border */}
      <rect x={ox} y={oy} width={pxW} height={pxH}
        fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />

      {/* Dimension label */}
      <text x={svgW / 2} y={svgH - 3} textAnchor="middle"
        fontSize="8" fill="rgba(0,0,0,0.35)" fontFamily="'Geist Mono', ui-monospace, monospace">
        {rW}m × {rD}m
      </text>
    </svg>
  )
}
