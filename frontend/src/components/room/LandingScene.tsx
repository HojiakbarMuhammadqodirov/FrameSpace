import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createFurnitureMesh, disposeMesh } from '../../hooks/furnitureBuilder'
import type { PlacedFurniture, FurnitureItem } from '../../types'

// ── helpers ────────────────────────────────────────────────────────────────
function makeItem(
  category: string, w: number, d: number, h: number,
  color: string, x: number, z: number, rot = 0
): PlacedFurniture {
  const data: FurnitureItem = {
    _id: `demo-${category}`, name: category, category,
    price: 0, priceRange: 'mid-range', image: '',
    dimensions: { width: w, depth: d, height: h },
    colors: [color], materials: ['fabric'],
    styleTags: [], roomTypes: [], source: '', sourceUrl: '',
    description: '', rating: 4,
  }
  return {
    furnitureId: `demo-${category}`, name: category,
    position: { x, y: 0, z }, rotation: rot, scale: 1,
    color, material: 'fabric', furnitureData: data,
  }
}

function addBox(
  scene: THREE.Scene,
  w: number, h: number, d: number,
  color: string | number,
  x: number, y: number, z: number,
  ry = 0
) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial({ color })
  )
  mesh.position.set(x, y, z)
  mesh.rotation.y = ry
  mesh.receiveShadow = true
  scene.add(mesh)
  return mesh
}

// ── main component ──────────────────────────────────────────────────────────
export default function LandingScene() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const W = mount.clientWidth  || 800
    const H = mount.clientHeight || 450

    // ── Scene ──
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xede9e4)
    scene.fog = new THREE.FogExp2(0xede9e4, 0.028)

    // ── Camera ──
    const camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 80)

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    mount.appendChild(renderer.domElement)

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0xfff8f0, 0.65))

    const sun = new THREE.DirectionalLight(0xfffde7, 1.4)
    sun.position.set(7, 11, 5)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.near = 0.5
    sun.shadow.camera.far   = 40
    sun.shadow.camera.left  = -10
    sun.shadow.camera.right =  10
    sun.shadow.camera.top   =  10
    sun.shadow.camera.bottom = -10
    sun.shadow.bias = -0.001
    scene.add(sun)

    const fill = new THREE.DirectionalLight(0xc8d8ff, 0.35)
    fill.position.set(-6, 4, -3)
    scene.add(fill)

    scene.add(new THREE.HemisphereLight(0xfff4e0, 0x5a4030, 0.3))

    // ── Room — 5 × 3 × 2.7 m ──
    const RW = 5, RD = 3, RH = 2.7
    const hw = RW / 2, hd = RD / 2

    // Floor with wood-plank canvas
    const fc = document.createElement('canvas')
    fc.width = 512; fc.height = 512
    const ctx = fc.getContext('2d')!
    ctx.fillStyle = '#C4A882'
    ctx.fillRect(0, 0, 512, 512)
    ctx.strokeStyle = 'rgba(0,0,0,0.07)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 512; i += 64) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke()
    }
    const floorTex = new THREE.CanvasTexture(fc)
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping
    floorTex.repeat.set(RW, RD)

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(RW, RD),
      new THREE.MeshLambertMaterial({ map: floorTex })
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    // Walls (north, west, east — south stays open for camera view)
    const wc = '#F5F0EB'
    const wallMat = new THREE.MeshLambertMaterial({ color: wc, side: THREE.DoubleSide })

    const northWall = new THREE.Mesh(new THREE.PlaneGeometry(RW, RH), wallMat.clone())
    northWall.position.set(0, RH / 2, -hd); northWall.receiveShadow = true; scene.add(northWall)

    const westWall = new THREE.Mesh(new THREE.PlaneGeometry(RD, RH), wallMat.clone())
    westWall.position.set(-hw, RH / 2, 0); westWall.rotation.y = Math.PI / 2; westWall.receiveShadow = true; scene.add(westWall)

    const eastWall = new THREE.Mesh(new THREE.PlaneGeometry(RD, RH), wallMat.clone())
    eastWall.position.set(hw, RH / 2, 0); eastWall.rotation.y = -Math.PI / 2; eastWall.receiveShadow = true; scene.add(eastWall)

    // South wall — only the parts beside the door so room looks right from behind
    const doorW = 0.95, doorH = 2.15, doorX = -1.0
    const leftW = hw + doorX - doorW / 2         // width of wall to the left of door
    const rightW = RW - leftW - doorW             // width of wall to the right of door

    const southMat = wallMat.clone()
    if (leftW > 0) {
      const lw = new THREE.Mesh(new THREE.PlaneGeometry(leftW, RH), southMat.clone())
      lw.position.set(-hw + leftW / 2, RH / 2, hd); lw.rotation.y = Math.PI; lw.receiveShadow = true; scene.add(lw)
    }
    if (rightW > 0) {
      const rw = new THREE.Mesh(new THREE.PlaneGeometry(rightW, RH), southMat.clone())
      rw.position.set(doorX + doorW / 2 + rightW / 2, RH / 2, hd); rw.rotation.y = Math.PI; rw.receiveShadow = true; scene.add(rw)
    }
    // Above door lintel
    const lintelH = RH - doorH
    const lintel = new THREE.Mesh(new THREE.PlaneGeometry(doorW, lintelH), southMat.clone())
    lintel.position.set(doorX, doorH + lintelH / 2, hd); lintel.rotation.y = Math.PI; lintel.receiveShadow = true; scene.add(lintel)

    // Ceiling (semi-transparent so top-angle camera can see inside)
    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(RW, RD),
      new THREE.MeshLambertMaterial({ color: '#FAFAFA', transparent: true, opacity: 0.55, side: THREE.DoubleSide })
    )
    ceil.rotation.x = Math.PI / 2; ceil.position.y = RH; scene.add(ceil)

    // Baseboards
    const bMat = new THREE.MeshLambertMaterial({ color: '#D4C4B0' })
    const bs = 0.055
    const bn = new THREE.Mesh(new THREE.BoxGeometry(RW, bs, 0.03), bMat)
    bn.position.set(0, bs / 2, -hd + 0.015); scene.add(bn)
    const bw = new THREE.Mesh(new THREE.BoxGeometry(0.03, bs, RD), bMat.clone())
    bw.position.set(-hw + 0.015, bs / 2, 0); scene.add(bw)
    const be = new THREE.Mesh(new THREE.BoxGeometry(0.03, bs, RD), bMat.clone())
    be.position.set(hw - 0.015, bs / 2, 0); scene.add(be)

    // ── Window on north wall ──
    const winW = 1.3, winH = 1.2, winSill = 0.85, winX = 0.9
    // Frame
    const winFrame = new THREE.Mesh(
      new THREE.BoxGeometry(winW + 0.1, winH + 0.1, 0.06),
      new THREE.MeshLambertMaterial({ color: '#FFFFFF' })
    )
    winFrame.position.set(winX, winSill + winH / 2, -hd); scene.add(winFrame)

    // Glass pane
    const winGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(winW, winH),
      new THREE.MeshLambertMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.38, side: THREE.DoubleSide })
    )
    winGlass.position.set(winX, winSill + winH / 2, -hd + 0.015); scene.add(winGlass)

    // Window cross bar
    addBox(scene, winW, 0.04, 0.03, '#EEEEEE', winX, winSill + winH / 2, -hd + 0.02)
    addBox(scene, 0.04, winH, 0.03, '#EEEEEE', winX, winSill + winH / 2, -hd + 0.02)

    // Sill
    const sillMesh = new THREE.Mesh(
      new THREE.BoxGeometry(winW + 0.12, 0.05, 0.18),
      new THREE.MeshLambertMaterial({ color: '#EDE8E0' })
    )
    sillMesh.position.set(winX, winSill - 0.02, -hd + 0.08); scene.add(sillMesh)

    // Warm light through window
    const winLight = new THREE.SpotLight(0xfff0c0, 1.0, 7, Math.PI / 7, 0.6, 1)
    winLight.position.set(winX, winSill + winH / 2, -hd + 0.8)
    winLight.target.position.set(winX * 0.3, 0, 0)
    scene.add(winLight); scene.add(winLight.target)

    // ── Door on south wall ──
    // Frame (brown surround)
    const dFrame = new THREE.Mesh(
      new THREE.BoxGeometry(doorW + 0.12, doorH + 0.06, 0.09),
      new THREE.MeshLambertMaterial({ color: '#8B7355' })
    )
    dFrame.position.set(doorX, doorH / 2, hd); scene.add(dFrame)

    // Door panel (slightly lighter wood)
    const dPanel = new THREE.Mesh(
      new THREE.BoxGeometry(doorW - 0.04, doorH - 0.06, 0.06),
      new THREE.MeshLambertMaterial({ color: '#A0896A' })
    )
    dPanel.position.set(doorX, doorH / 2, hd); scene.add(dPanel)

    // Door knob
    const knob = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      new THREE.MeshStandardMaterial({ color: '#C8A830', metalness: 0.8, roughness: 0.2 })
    )
    knob.position.set(doorX + 0.36, 1.05, hd + 0.06); scene.add(knob)

    // ── Furniture ──
    const items: PlacedFurniture[] = [
      // Bed — against north-east area
      makeItem('bed',   160, 210, 105, '#9A8070',  1.2, -0.35,   0),
      // Armchair — west side facing inward
      makeItem('chair',  68,  82,  95, '#B8896A', -1.6,  0.45,  25),
      // Floor lamp — near chair, north-west corner
      makeItem('lighting', 38, 38, 178, '#D4A574', -1.95, -1.0,   0),
    ]

    const groups: THREE.Group[] = []
    items.forEach(pf => {
      const g = createFurnitureMesh(pf)
      g.position.set(pf.position.x, 0, pf.position.z)
      g.rotation.y = (pf.rotation * Math.PI) / 180
      g.traverse(c => {
        if ((c as THREE.Mesh).isMesh) {
          c.castShadow  = true
          c.receiveShadow = true
        }
      })
      scene.add(g)
      groups.push(g)
    })

    // Small rug under the chair area
    const rugGeo = new THREE.PlaneGeometry(1.4, 1.8)
    const rug = new THREE.Mesh(rugGeo,
      new THREE.MeshLambertMaterial({ color: '#C4A882', side: THREE.DoubleSide })
    )
    rug.rotation.x = -Math.PI / 2; rug.position.set(-1.5, 0.004, 0.3); scene.add(rug)

    // ── Auto-orbiting camera ──
    let angle = Math.PI * 0.18   // start: front-right
    const R  = 9.5               // orbit radius
    const camH = 5.8             // camera height
    const target = new THREE.Vector3(0, 1.1, -0.1)
    let raf: number

    const animate = () => {
      raf = requestAnimationFrame(animate)
      angle += 0.004              // ~35 s per full rotation
      camera.position.set(
        Math.sin(angle) * R,
        camH,
        Math.cos(angle) * R
      )
      camera.lookAt(target)
      renderer.render(scene, camera)
    }
    animate()

    // ── Resize ──
    const ro = new ResizeObserver(() => {
      const nw = mount.clientWidth, nh = mount.clientHeight
      if (!nw || !nh) return
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    })
    ro.observe(mount)

    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf)
      groups.forEach(disposeMesh)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
  )
}
