import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import type { PlacedFurniture } from '../types'

// ── Procedural texture cache ────────────────────────────────────────────────
const texCache = new Map<string, THREE.CanvasTexture>()

function cachedTex(key: string, fn: () => THREE.CanvasTexture) {
  if (!texCache.has(key)) texCache.set(key, fn())
  return texCache.get(key)!
}

function woodTex(color: string): THREE.CanvasTexture {
  return cachedTex(`wood-${color}`, () => {
    const c = document.createElement('canvas')
    c.width = 256; c.height = 256
    const ctx = c.getContext('2d')!
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 256, 256)
    // Primary grain lines
    ctx.strokeStyle = 'rgba(0,0,0,0.07)'
    ctx.lineWidth = 1.2
    for (let i = 0; i < 22; i++) {
      const y = i * 12
      ctx.beginPath()
      ctx.moveTo(0, y + Math.sin(i * 0.9) * 3)
      ctx.bezierCurveTo(80, y + Math.sin(i * 1.4) * 5, 180, y + Math.cos(i * 1.1) * 4, 256, y + Math.sin(i * 0.8) * 3)
      ctx.stroke()
    }
    // Subtle lighter grain
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 0.7
    for (let i = 0; i < 10; i++) {
      const y = i * 27 + 6
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.bezierCurveTo(70, y - 3, 186, y + 2, 256, y)
      ctx.stroke()
    }
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    return tex
  })
}

function fabricTex(color: string): THREE.CanvasTexture {
  return cachedTex(`fabric-${color}`, () => {
    const c = document.createElement('canvas')
    c.width = 64; c.height = 64
    const ctx = c.getContext('2d')!
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 64, 64)
    for (let x = 0; x < 64; x += 3) {
      for (let y = 0; y < 64; y += 3) {
        const on = (Math.floor(x / 3) + Math.floor(y / 3)) % 2 === 0
        if (on) {
          ctx.fillStyle = 'rgba(0,0,0,0.055)'
          ctx.fillRect(x, y, 2, 3)
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.04)'
          ctx.fillRect(x, y, 3, 2)
        }
      }
    }
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(8, 8)
    return tex
  })
}

// ── Material factories ──────────────────────────────────────────────────────
type PMat = THREE.MeshPhysicalMaterial

function fabricMat(color: string, roughness = 0.9): PMat {
  const c = new THREE.Color(color)
  return new THREE.MeshPhysicalMaterial({
    color: c,
    roughness,
    metalness: 0,
    sheen: 0.55,
    sheenRoughness: 0.75,
    sheenColor: c.clone().multiplyScalar(0.7),
    map: fabricTex(color),
  })
}

function woodMat(color: string, roughness = 0.65): PMat {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness,
    metalness: 0,
    map: woodTex(color),
  })
}

function glossMat(color: string, clearcoat = 0.7): PMat {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: 0.2,
    metalness: 0.05,
    clearcoat,
    clearcoatRoughness: 0.12,
  })
}

function metalMat(color: string, roughness = 0.25): PMat {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness,
    metalness: 0.85,
  })
}

function plainMat(color: string, roughness = 0.7): PMat {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness,
    metalness: 0,
  })
}

// ── Main entry ──────────────────────────────────────────────────────────────
export function createFurnitureMesh(pf: PlacedFurniture): THREE.Group {
  const group = new THREE.Group()
  const data  = pf.furnitureData
  const w = data ? data.dimensions.width  / 100 : 1
  const d = data ? data.dimensions.depth  / 100 : 0.8
  const h = data ? data.dimensions.height / 100 : 0.8
  const color = pf.color || getDefaultColor(data?.category || '')

  switch (data?.category) {
    case 'sofa':    buildSofa(group, w, d, h, color); break
    case 'chair':   buildChair(group, w, d, h, color); break
    case 'table':
    case 'desk':    buildTable(group, w, d, h, color); break
    case 'bed':     buildBed(group, w, d, h, color); break
    case 'shelf':
    case 'storage':
    case 'wardrobe': buildShelf(group, w, d, h, color); break
    case 'tv-stand': buildTvStand(group, w, d, h, color); break
    case 'lighting': buildLamp(group, h, color); break
    case 'rug':      buildRug(group, w, d, color); break
    case 'plant':    buildPlant(group, h); break
    default:         buildBox(group, w, d, h, color); break
  }

  group.traverse(child => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow    = true
      child.receiveShadow = true
    }
  })

  const helperMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  const helper = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), helperMat)
  helper.position.y = h / 2
  helper.name = 'selectionHelper'
  group.add(helper)

  return group
}

// ── Furniture builders ──────────────────────────────────────────────────────

function buildSofa(g: THREE.Group, w: number, d: number, h: number, color: string) {
  const legH = 0.11, seatH = h * 0.42, backH = h * 0.52
  const legColor = '#4A3728'
  const leg = metalMat(legColor, 0.4)
  const legGeo = new THREE.CylinderGeometry(0.03, 0.03, legH, 10)
  for (const [lx, lz] of [[-w/2+0.12,-d/2+0.1],[w/2-0.12,-d/2+0.1],[-w/2+0.12,d/2-0.1],[w/2-0.12,d/2-0.1]] as [number,number][]) {
    const lm = new THREE.Mesh(legGeo, leg.clone()); lm.position.set(lx, legH/2, lz); g.add(lm)
  }

  // Seat with rounded edges
  const seat = new THREE.Mesh(new RoundedBoxGeometry(w, seatH, d, 4, 0.04), fabricMat(color, 0.85))
  seat.position.set(0, legH + seatH/2, 0); g.add(seat)

  // Backrest
  const back = new THREE.Mesh(new RoundedBoxGeometry(w, backH, d*0.28, 4, 0.04), fabricMat(color, 0.85))
  back.position.set(0, legH + seatH + backH/2, -(d/2 - d*0.14)); g.add(back)

  // Armrests
  const armGeo = new RoundedBoxGeometry(w*0.1, seatH*0.75, d, 4, 0.03)
  const armM = fabricMat(color, 0.85)
  const lArm = new THREE.Mesh(armGeo, armM.clone()); lArm.position.set(-w/2+w*0.05, legH+seatH+seatH*0.38/2, 0); g.add(lArm)
  const rArm = lArm.clone(); rArm.position.x = w/2-w*0.05; g.add(rArm)

  // Cushions (3)
  const cushColor = shiftColor(color, 18)
  const cushW = (w - w*0.22) / 3 - 0.02
  for (let i = 0; i < 3; i++) {
    const cx = -w/2 + w*0.11 + (cushW + 0.02) * i + cushW/2
    const cush = new THREE.Mesh(new RoundedBoxGeometry(cushW, seatH*0.3, d*0.62, 4, 0.035), fabricMat(cushColor, 0.88))
    cush.position.set(cx, legH + seatH + seatH*0.15, 0); g.add(cush)
  }

  // Back cushion panels (3)
  const bpW = cushW
  for (let i = 0; i < 3; i++) {
    const bx = -w/2 + w*0.11 + (bpW + 0.02) * i + bpW/2
    const bp = new THREE.Mesh(new RoundedBoxGeometry(bpW, backH*0.65, d*0.1, 4, 0.025), fabricMat(cushColor, 0.9))
    bp.position.set(bx, legH + seatH + backH*0.35, -(d/2 - d*0.14) + d*0.09); g.add(bp)
  }
}

function buildChair(g: THREE.Group, w: number, d: number, h: number, color: string) {
  const legH = 0.42, seatH = 0.1, backH = h - legH - seatH
  const leg = woodMat('#5C4033', 0.55)
  const legGeo = new THREE.CylinderGeometry(0.02, 0.02, legH, 10)
  for (const [lx, lz] of [[-w/2+0.06,-d/2+0.06],[w/2-0.06,-d/2+0.06],[-w/2+0.06,d/2-0.06],[w/2-0.06,d/2-0.06]] as [number,number][]) {
    const lm = new THREE.Mesh(legGeo, leg.clone()); lm.position.set(lx, legH/2, lz); g.add(lm)
  }
  // Cross-braces
  const braceGeo = new THREE.CylinderGeometry(0.01, 0.01, d - 0.1, 8)
  for (const [bx] of [[-w/2+0.06],[w/2-0.06]] as [number][]) {
    const b = new THREE.Mesh(braceGeo, leg.clone())
    b.rotation.x = Math.PI/2; b.position.set(bx, legH*0.45, 0); g.add(b)
  }

  const seat = new THREE.Mesh(new RoundedBoxGeometry(w, seatH, d, 4, 0.025), fabricMat(color, 0.88))
  seat.position.set(0, legH + seatH/2, 0); g.add(seat)
  const back = new THREE.Mesh(new RoundedBoxGeometry(w, backH, 0.07, 4, 0.02), fabricMat(color, 0.88))
  back.position.set(0, legH + seatH + backH/2, -d/2 + 0.035); g.add(back)
}

function buildTable(g: THREE.Group, w: number, d: number, h: number, color: string) {
  const topH = 0.04, legH = h - topH
  const isDesk = color !== getDefaultColor('table') && w > 1.2
  const surf = isDesk ? glossMat(color, 0.6) : woodMat(color, 0.55)

  // Tabletop
  const top = new THREE.Mesh(new THREE.BoxGeometry(w, topH, d), surf)
  top.position.set(0, legH + topH/2, 0); g.add(top)

  // Edge trim
  const trimMat = woodMat(shiftColor(color, -15), 0.5)
  const trimGeo = new THREE.BoxGeometry(w + 0.01, topH * 0.5, 0.025)
  const trimF = new THREE.Mesh(trimGeo, trimMat.clone()); trimF.position.set(0, legH + topH*0.75, d/2 - 0.012); g.add(trimF)
  const trimB = new THREE.Mesh(trimGeo, trimMat.clone()); trimB.position.set(0, legH + topH*0.75, -d/2 + 0.012); g.add(trimB)

  // Legs
  const legMat = woodMat(shiftColor(color, -18), 0.6)
  const legGeo = new THREE.CylinderGeometry(0.03, 0.025, legH, 10)
  for (const [lx, lz] of [[-w/2+0.08,-d/2+0.08],[w/2-0.08,-d/2+0.08],[-w/2+0.08,d/2-0.08],[w/2-0.08,d/2-0.08]] as [number,number][]) {
    const lm = new THREE.Mesh(legGeo, legMat.clone()); lm.position.set(lx, legH/2, lz); g.add(lm)
  }
}

function buildBed(g: THREE.Group, w: number, d: number, h: number, color: string) {
  const frameH = 0.16, mattH = 0.22, headH = h - frameH - mattH
  const frameMat = woodMat('#8B7355', 0.6)
  const frame = new THREE.Mesh(new THREE.BoxGeometry(w, frameH, d), frameMat)
  frame.position.set(0, frameH/2, 0); g.add(frame)

  // Side rails
  const railGeo = new THREE.BoxGeometry(0.05, frameH * 0.8, d)
  for (const rx of [-w/2 + 0.025, w/2 - 0.025]) {
    const rail = new THREE.Mesh(railGeo, woodMat('#7B6345', 0.65))
    rail.position.set(rx, frameH * 0.9, 0); g.add(rail)
  }

  // Mattress
  const mattMat = fabricMat('#F5F5F5', 0.95)
  const matt = new THREE.Mesh(new RoundedBoxGeometry(w*0.95, mattH, d*0.9, 4, 0.04), mattMat)
  matt.position.set(0, frameH + mattH/2, 0); g.add(matt)

  // Headboard
  const headMat = fabricMat(color, 0.8)
  const head = new THREE.Mesh(new RoundedBoxGeometry(w, headH, 0.12, 4, 0.03), headMat)
  head.position.set(0, frameH + headH/2, -d/2 + 0.06); g.add(head)

  // Pillows
  const pillMat = fabricMat('#FAFAFA', 0.95)
  const pillGeo = new RoundedBoxGeometry(w/2*0.42, 0.11, d*0.22, 4, 0.025)
  for (const px of [-w/4, w/4]) {
    const p = new THREE.Mesh(pillGeo, pillMat.clone()); p.position.set(px, frameH+mattH+0.055, -d*0.28); g.add(p)
  }

  // Blanket
  const blank = new THREE.Mesh(new RoundedBoxGeometry(w*0.9, 0.07, d*0.56, 4, 0.02), fabricMat(color, 0.92))
  blank.position.set(0, frameH+mattH+0.035, d*0.16); g.add(blank)
}

function buildShelf(g: THREE.Group, w: number, d: number, h: number, color: string) {
  const thick = 0.022, shelvesN = Math.max(2, Math.floor(h / 0.32))
  const wood = woodMat(color, 0.55)
  const backMat = woodMat(shiftColor(color, -12), 0.65)

  // Sides
  for (const sx of [-w/2+thick/2, w/2-thick/2]) {
    const side = new THREE.Mesh(new THREE.BoxGeometry(thick, h, d), wood.clone())
    side.position.set(sx, h/2, 0); g.add(side)
  }

  // Back panel (thin)
  const back = new THREE.Mesh(new THREE.BoxGeometry(w-thick*2, h, 0.012), backMat)
  back.position.set(0, h/2, -d/2+0.006); g.add(back)

  // Shelves
  const shelfGeo = new THREE.BoxGeometry(w-thick*2, thick, d)
  for (let i = 0; i <= shelvesN; i++) {
    const s = new THREE.Mesh(shelfGeo, wood.clone())
    s.position.set(0, i * (h/shelvesN), 0); g.add(s)
  }

  // Decorative items on shelves
  if (shelvesN >= 3) {
    const bookColors = ['#C0392B','#2980B9','#27AE60','#8E44AD','#E67E22']
    const topShelf = (shelvesN - 1) * (h / shelvesN) + thick
    let bx = -w/2 + thick + 0.05
    for (let i = 0; i < 5 && bx < w/2 - 0.06; i++) {
      const bw = 0.03 + Math.random() * 0.02
      const bh = 0.12 + Math.random() * 0.09
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(bw, bh, d * 0.75),
        plainMat(bookColors[i % bookColors.length], 0.8)
      )
      book.position.set(bx + bw/2, topShelf + bh/2, 0); g.add(book)
      bx += bw + 0.008
    }
  }
}

function buildLamp(g: THREE.Group, h: number, color: string) {
  // Base
  const baseMat = metalMat('#888888', 0.3)
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.07, 20), baseMat)
  base.position.set(0, 0.035, 0); g.add(base)

  // Pole (multiple segments for tapered look)
  const poleMat = metalMat('#9E9E9E', 0.22)
  const poleH = h * 0.72
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.024, poleH, 12), poleMat)
  pole.position.set(0, 0.07 + poleH/2, 0); g.add(pole)

  // Shade
  const shadeMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: 0.75,
    metalness: 0,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.92,
  })
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.28, h*0.28, 20, 1, true), shadeMat)
  shade.position.set(0, 0.07 + poleH + h*0.14, 0); g.add(shade)

  // Inner shade (lighter)
  const innerShade = new THREE.Mesh(new THREE.ConeGeometry(0.26, h*0.27, 20, 1, true),
    new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#FFF8E0'), roughness: 0.9, side: THREE.BackSide, transparent: true, opacity: 0.6 })
  )
  innerShade.position.copy(shade.position); g.add(innerShade)

  // Point light inside
  const glow = new THREE.PointLight(0xfff5cc, 1.2, 3.5, 1.8)
  glow.position.set(0, 0.07 + poleH + h*0.08, 0); g.add(glow)

  // Base ring
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.01, 8, 24), metalMat('#AAAAAA', 0.2))
  ring.rotation.x = Math.PI/2; ring.position.set(0, 0.072, 0); g.add(ring)
}

function buildRug(g: THREE.Group, w: number, d: number, color: string) {
  const rugMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: 0.92,
    metalness: 0,
    side: THREE.DoubleSide,
  })
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(w, d, 6, 6), rugMat)
  rug.rotation.x = -Math.PI/2; rug.position.y = 0.005; g.add(rug)

  const borderColor = shiftColor(color, -35)
  const border = new THREE.Mesh(new THREE.PlaneGeometry(w+0.06, d+0.06),
    new THREE.MeshPhysicalMaterial({ color: new THREE.Color(borderColor), roughness: 0.95, side: THREE.DoubleSide })
  )
  border.rotation.x = -Math.PI/2; border.position.y = 0.003; g.add(border)

  // Fringe lines on short edges
  const fringeMat = plainMat(borderColor, 0.9)
  const fringeGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.06, 4)
  for (let i = 0; i < 8; i++) {
    const fx = -w/2 + 0.04 + i * (w / 8)
    for (const fz of [-d/2 - 0.03, d/2 + 0.03]) {
      const fr = new THREE.Mesh(fringeGeo, fringeMat.clone())
      fr.position.set(fx, 0.005, fz); g.add(fr)
    }
  }
}

function buildPlant(g: THREE.Group, h: number) {
  // Pot
  const potMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#C1440E'), roughness: 0.65, metalness: 0 })
  const potH = h * 0.22
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(h*0.13, h*0.09, potH, 16), potMat)
  pot.position.set(0, potH/2, 0); g.add(pot)

  // Soil
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(h*0.125, h*0.125, 0.025, 14),
    plainMat('#3E2723', 0.95))
  soil.position.set(0, potH - 0.012, 0); g.add(soil)

  // Trunk
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.025, h*0.42, 8),
    plainMat('#5D4037', 0.7))
  trunk.position.set(0, potH + h*0.21, 0); g.add(trunk)

  // Leaf clusters
  const leafMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#2E7D32'), roughness: 0.85, metalness: 0 })
  const leafPositions: [number, number, number, number][] = [
    [0, h*0.77, 0, 1.0],
    [h*0.13, h*0.68, 0.02, 0.78],
    [-h*0.13, h*0.72, 0.04, 0.82],
    [h*0.08, h*0.82, 0.06, 0.65],
    [-h*0.07, h*0.63, -0.02, 0.72],
  ]
  leafPositions.forEach(([lx, ly, lz, s]) => {
    const r = h * 0.19 * s
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), leafMat.clone())
    leaf.position.set(lx, ly, lz)
    leaf.scale.set(1, 1.25, 1)
    g.add(leaf)
  })
}

function buildTvStand(g: THREE.Group, w: number, d: number, h: number, color: string) {
  const legH = 0.07
  const legMat = metalMat('#B0B0B0', 0.18)
  const legGeo = new THREE.CylinderGeometry(0.014, 0.014, legH, 10)
  for (const [lx, lz] of [[-w/2+0.1,-d/2+0.06],[w/2-0.1,-d/2+0.06],[-w/2+0.1,d/2-0.06],[w/2-0.1,d/2-0.06]] as [number,number][]) {
    const lm = new THREE.Mesh(legGeo, legMat.clone()); lm.position.set(lx, legH/2, lz); g.add(lm)
  }

  const bodyH = h - legH
  // Main cabinet — glossy
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, bodyH, d), glossMat(color, 0.65))
  body.position.set(0, legH + bodyH/2, 0); g.add(body)

  // Top surface (darker gloss)
  const topMat = glossMat(shiftColor(color, 20), 0.8)
  const top = new THREE.Mesh(new THREE.BoxGeometry(w+0.012, 0.018, d+0.012), topMat)
  top.position.set(0, legH + bodyH + 0.009, 0); g.add(top)

  // Center divider
  const div = new THREE.Mesh(new THREE.BoxGeometry(0.016, bodyH*0.9, d*0.94), woodMat(shiftColor(color, -10), 0.5))
  div.position.set(0, legH + bodyH*0.45, 0); g.add(div)

  // Doors (two halves)
  const doorMat = glossMat(shiftColor(color, 8), 0.7)
  for (const dx of [-w/4, w/4]) {
    const door = new THREE.Mesh(new THREE.BoxGeometry(w/2 - 0.025, bodyH*0.86, 0.01), doorMat.clone())
    door.position.set(dx, legH + bodyH*0.43, d/2 - 0.005); g.add(door)

    // Handle
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.04, 10), metalMat('#C8B880', 0.12))
    handle.rotation.z = Math.PI/2; handle.position.set(dx, legH + bodyH*0.46, d/2 - 0.015); g.add(handle)
  }
}

function buildBox(g: THREE.Group, w: number, d: number, h: number, color: string) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), plainMat(color))
  mesh.position.set(0, h/2, 0); g.add(mesh)
}

// ── Utilities ───────────────────────────────────────────────────────────────
function getDefaultColor(cat: string): string {
  const map: Record<string, string> = {
    sofa: '#8B7355', chair: '#9C8B6E', table: '#A0896A', bed: '#7B6B5A',
    desk: '#8D7B6A', shelf: '#A08060', wardrobe: '#9A8870', storage: '#957A60',
    'tv-stand': '#6B5B4E', lighting: '#D4A574', rug: '#C4A882', plant: '#4CAF50', decor: '#B8926A',
  }
  return map[cat] || '#A0896A'
}

export function shiftColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount))
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount))
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

export function highlightMesh(group: THREE.Group, selected: boolean) {
  group.traverse(child => {
    const mesh = child as THREE.Mesh
    if (mesh.isMesh && mesh.name !== 'selectionHelper') {
      const mat = mesh.material as THREE.MeshPhysicalMaterial
      if (mat?.emissive) mat.emissive.set(selected ? 0x332200 : 0x000000)
    }
  })
}

export function disposeMesh(group: THREE.Group) {
  group.traverse(child => {
    const mesh = child as THREE.Mesh
    if (mesh.isMesh) {
      mesh.geometry?.dispose()
      const mat = mesh.material
      if (Array.isArray(mat)) mat.forEach(m => { (m as THREE.Material).dispose() })
      else (mat as THREE.Material)?.dispose()
    }
  })
}
