import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { Room, PlacedFurniture, ViewMode } from '../types'
import { createFurnitureMesh, highlightMesh, disposeMesh } from './furnitureBuilder'

interface SceneCallbacks {
  onFurnitureSelect: (id: string | null) => void
  onFurnitureMove: (id: string, pos: { x: number; y: number; z: number }) => void
}

interface SceneOptions { snapToGrid: boolean }

const gridSnap = (v: number, g = 0.1) => Math.round(v / g) * g

export function useThreeScene(
  mountRef: React.RefObject<HTMLDivElement>,
  callbacks: SceneCallbacks,
  options: SceneOptions = { snapToGrid: false }
) {
  const sceneRef      = useRef<THREE.Scene | null>(null)
  const cameraRef     = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef   = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef   = useRef<OrbitControls | null>(null)
  const walkCtrlRef   = useRef<PointerLockControls | null>(null)
  const sunRef        = useRef<THREE.DirectionalLight | null>(null)
  const fillRef       = useRef<THREE.DirectionalLight | null>(null)
  const animFrameRef  = useRef<number>(0)
  const furnitureGroupRef = useRef<THREE.Group | null>(null)
  const roomGroupRef  = useRef<THREE.Group | null>(null)
  const raycaster     = useRef(new THREE.Raycaster())
  const mouse         = useRef(new THREE.Vector2())
  const selectedMesh  = useRef<THREE.Object3D | null>(null)
  const isDragging    = useRef(false)
  const dragOffset    = useRef(new THREE.Vector3())
  const dragPlane     = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const meshMap       = useRef<Map<string, THREE.Group>>(new Map())
  const cbRef         = useRef(callbacks)
  cbRef.current = callbacks
  const optsRef       = useRef(options)
  optsRef.current = options
  const shiftHeld     = useRef(false)
  const walkMode      = useRef(false)
  const walkKeys      = useRef({ w: false, a: false, s: false, d: false })

  useEffect(() => {
    if (!mountRef.current) return
    const mount = mountRef.current
    const w = mount.clientWidth || 800
    const h = mount.clientHeight || 600

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf0ede8)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 200)
    camera.position.set(7, 6, 9)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    renderer.domElement.id = 'room-canvas'
    mount.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // IBL environment for physically-based materials
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()

    const orbitControls = new OrbitControls(camera, renderer.domElement)
    orbitControls.enableDamping = true
    orbitControls.dampingFactor = 0.06
    orbitControls.maxPolarAngle = Math.PI / 2 + 0.05
    orbitControls.minDistance = 2
    orbitControls.maxDistance = 25
    orbitControls.target.set(0, 1, 0)
    controlsRef.current = orbitControls

    const walkControls = new PointerLockControls(camera, renderer.domElement)
    scene.add(walkControls.getObject())
    walkCtrlRef.current = walkControls

    const roomGroup = new THREE.Group()
    scene.add(roomGroup)
    roomGroupRef.current = roomGroup

    const furnitureGroup = new THREE.Group()
    scene.add(furnitureGroup)
    furnitureGroupRef.current = furnitureGroup

    scene.add(new THREE.AmbientLight(0xfff8f0, 0.5))
    const sun = new THREE.DirectionalLight(0xfffde7, 1.8)
    sun.position.set(8, 14, 6)
    sun.castShadow = true
    sun.shadow.mapSize.set(4096, 4096)
    sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 60
    sun.shadow.camera.left = -15; sun.shadow.camera.right = 15
    sun.shadow.camera.top = 15; sun.shadow.camera.bottom = -15
    sun.shadow.bias = -0.0008
    sun.shadow.radius = 2
    scene.add(sun)
    sunRef.current = sun
    const fill = new THREE.DirectionalLight(0xc8d8ff, 0.55)
    fill.position.set(-5, 5, -4)
    scene.add(fill)
    fillRef.current = fill
    const rim = new THREE.DirectionalLight(0xfff0d0, 0.35)
    rim.position.set(0, 3, -8)
    scene.add(rim)
    scene.add(new THREE.HemisphereLight(0xfff4e0, 0x4a3728, 0.4))

    const clock = new THREE.Clock()
    const walkSpeed = 4

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate)
      if (walkMode.current && walkCtrlRef.current?.isLocked) {
        const delta = clock.getDelta()
        const dir = new THREE.Vector3()
        const right = new THREE.Vector3()
        camera.getWorldDirection(dir)
        dir.y = 0; dir.normalize()
        right.crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize()
        const keys = walkKeys.current
        if (keys.w) camera.position.addScaledVector(dir, walkSpeed * delta)
        if (keys.s) camera.position.addScaledVector(dir, -walkSpeed * delta)
        if (keys.a) camera.position.addScaledVector(right, -walkSpeed * delta)
        if (keys.d) camera.position.addScaledVector(right, walkSpeed * delta)
        camera.position.y = Math.max(1.6, camera.position.y)
      } else {
        orbitControls.update()
      }
      renderer.render(scene, camera)
    }
    animate()

    const ro = new ResizeObserver(() => {
      const nw = mount.clientWidth, nh = mount.clientHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    })
    ro.observe(mount)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') shiftHeld.current = true
      const k = e.key.toLowerCase()
      if (k === 'w') walkKeys.current.w = true
      if (k === 'a') walkKeys.current.a = true
      if (k === 's') walkKeys.current.s = true
      if (k === 'd') walkKeys.current.d = true
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') shiftHeld.current = false
      const k = e.key.toLowerCase()
      if (k === 'w') walkKeys.current.w = false
      if (k === 'a') walkKeys.current.a = false
      if (k === 's') walkKeys.current.s = false
      if (k === 'd') walkKeys.current.d = false
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    const onDown = (e: MouseEvent) => handleDown(e)
    const onMove = (e: MouseEvent) => handleMove(e)
    const onUp   = () => handleUp()
    renderer.domElement.addEventListener('mousedown', onDown)
    renderer.domElement.addEventListener('mousemove', onMove)
    renderer.domElement.addEventListener('mouseup', onUp)

    return () => {
      ro.disconnect()
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      renderer.domElement.removeEventListener('mousedown', onDown)
      renderer.domElement.removeEventListener('mousemove', onMove)
      renderer.domElement.removeEventListener('mouseup', onUp)
      cancelAnimationFrame(animFrameRef.current)
      walkControls.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  function getNDC(e: MouseEvent) {
    const rect = rendererRef.current!.domElement.getBoundingClientRect()
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
  }

  function getHelpers(): THREE.Object3D[] {
    const out: THREE.Object3D[] = []
    furnitureGroupRef.current?.traverse(c => {
      if ((c as THREE.Mesh).isMesh && c.name === 'selectionHelper') out.push(c)
    })
    return out
  }

  function handleDown(e: MouseEvent) {
    if (e.button !== 0 || walkMode.current) return
    getNDC(e)
    raycaster.current.setFromCamera(mouse.current, cameraRef.current!)
    const hits = raycaster.current.intersectObjects(getHelpers(), false)
    if (hits.length > 0) {
      const group = hits[0].object.parent!
      selectedMesh.current = group
      isDragging.current = true
      controlsRef.current!.enabled = false
      cbRef.current.onFurnitureSelect(group.userData.furnitureId)
      const pt = new THREE.Vector3()
      raycaster.current.ray.intersectPlane(dragPlane.current, pt)
      dragOffset.current.subVectors(group.position, pt)
    } else {
      selectedMesh.current = null
      cbRef.current.onFurnitureSelect(null)
    }
  }

  function handleMove(e: MouseEvent) {
    if (!isDragging.current || !selectedMesh.current) return
    getNDC(e)
    raycaster.current.setFromCamera(mouse.current, cameraRef.current!)
    const pt = new THREE.Vector3()
    if (raycaster.current.ray.intersectPlane(dragPlane.current, pt)) {
      const np = pt.add(dragOffset.current)
      const shouldSnap = optsRef.current.snapToGrid && !shiftHeld.current
      const nx = shouldSnap ? gridSnap(np.x) : np.x
      const nz = shouldSnap ? gridSnap(np.z) : np.z
      selectedMesh.current.position.set(nx, selectedMesh.current.position.y, nz)
    }
  }

  function handleUp() {
    if (isDragging.current && selectedMesh.current) {
      const { x, y, z } = selectedMesh.current.position
      cbRef.current.onFurnitureMove(selectedMesh.current.userData.furnitureId, { x, y, z })
    }
    isDragging.current = false
    if (controlsRef.current) controlsRef.current.enabled = true
  }

  const buildRoom = useCallback((room: Room, showGrid: boolean) => {
    const rg = roomGroupRef.current
    if (!rg) return
    while (rg.children.length) rg.remove(rg.children[0])

    const { width, depth, height } = room.dimensions
    const hw = width / 2, hd = depth / 2
    const wallColor  = room.style?.wallColor  || '#F5F0EB'
    const floorColor = room.style?.floorColor || '#C4A882'
    const ceilColor  = room.style?.ceilingColor || '#FFFFFF'

    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = floorColor; ctx.fillRect(0, 0, 512, 512)
    ctx.strokeStyle = 'rgba(0,0,0,0.07)'; ctx.lineWidth = 1
    for (let i = 0; i < 512; i += 64) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke()
    }
    const floorTex = new THREE.CanvasTexture(canvas)
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping
    floorTex.repeat.set(width, depth)
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(width, depth),
      new THREE.MeshLambertMaterial({ map: floorTex }))
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; rg.add(floor)

    const wMat = () => new THREE.MeshLambertMaterial({ color: wallColor })
    const addWall = (ww: number, wh: number, x: number, y: number, z: number, ry: number) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), wMat())
      m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; rg.add(m)
    }
    addWall(width, height,  0,          height/2, -hd,  0)
    addWall(depth, height, -hw,         height/2,   0,  Math.PI/2)
    addWall(depth, height,  hw,         height/2,   0, -Math.PI/2)

    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(width, depth),
      new THREE.MeshLambertMaterial({ color: ceilColor, transparent: true, opacity: 0.85, side: THREE.DoubleSide }))
    ceil.rotation.x = Math.PI/2; ceil.position.set(0, height, 0); rg.add(ceil)

    const bMat = new THREE.MeshLambertMaterial({ color: '#D4C4B0' })
    const bb = new THREE.Mesh(new THREE.BoxGeometry(width, 0.07, 0.04), bMat)
    bb.position.set(0, 0.035, -hd+0.02); rg.add(bb)
    const bL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.07, depth), bMat.clone())
    bL.position.set(-hw+0.02, 0.035, 0); rg.add(bL)
    const bR = bL.clone(); bR.position.x = hw-0.02; rg.add(bR)

    room.windows?.forEach(win => {
      const wW = win.width, wH = win.height, sill = win.sillHeight, p = win.position
      let wx = 0, wz = 0, ry = 0
      if      (win.wall === 'north') { wx = (p-0.5)*width;  wz = -hd; ry = 0 }
      else if (win.wall === 'south') { wx = (p-0.5)*width;  wz =  hd; ry = Math.PI }
      else if (win.wall === 'west')  { wz = (p-0.5)*depth;  wx = -hw; ry = Math.PI/2 }
      else                           { wz = (p-0.5)*depth;  wx =  hw; ry = -Math.PI/2 }
      const wy = sill + wH/2
      const frame = new THREE.Mesh(new THREE.BoxGeometry(wW+0.1, wH+0.1, 0.05),
        new THREE.MeshLambertMaterial({ color: '#FFFFFF' }))
      frame.position.set(wx, wy, wz); frame.rotation.y = ry; rg.add(frame)
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(wW, wH),
        new THREE.MeshLambertMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.35 }))
      glass.position.set(wx, wy, wz); glass.rotation.y = ry; rg.add(glass)
      const sillM = new THREE.Mesh(new THREE.BoxGeometry(wW+0.1, 0.06, 0.15),
        new THREE.MeshLambertMaterial({ color: '#EDE8E0' }))
      sillM.position.set(wx, sill-0.03, wz); sillM.rotation.y = ry; rg.add(sillM)
    })

    room.doors?.forEach(door => {
      const dW = door.width, dH = 2.1, p = door.position
      let dx = 0, dz = 0, ry = 0
      if      (door.wall === 'north') { dx = (p-0.5)*width;  dz = -hd }
      else if (door.wall === 'south') { dx = (p-0.5)*width;  dz =  hd; ry = Math.PI }
      else if (door.wall === 'west')  { dz = (p-0.5)*depth;  dx = -hw; ry = Math.PI/2 }
      else                            { dz = (p-0.5)*depth;  dx =  hw; ry = -Math.PI/2 }
      const fM = new THREE.Mesh(new THREE.BoxGeometry(dW+0.1, dH+0.1, 0.08),
        new THREE.MeshLambertMaterial({ color: '#8B7355' }))
      fM.position.set(dx, dH/2, dz); fM.rotation.y = ry; rg.add(fM)
      const pM = new THREE.Mesh(new THREE.BoxGeometry(dW-0.04, dH-0.04, 0.05),
        new THREE.MeshLambertMaterial({ color: '#A0896A' }))
      pM.position.set(dx, dH/2, dz); pM.rotation.y = ry; rg.add(pM)
    })

    if (showGrid) {
      const sz = Math.max(width, depth) + 2
      const g = new THREE.GridHelper(sz, sz * 10, 0xbbbbbb, 0xe0ddd8)
      g.position.y = 0.005; rg.add(g)
    }
    if (controlsRef.current) controlsRef.current.target.set(0, height*0.3, 0)
  }, [])

  const updateFurniture3D = useCallback((items: PlacedFurniture[], selectedId: string | null) => {
    const fg = furnitureGroupRef.current
    if (!fg) return
    const newIds = new Set(items.map(f => f._id || f.furnitureId))
    meshMap.current.forEach((mesh, id) => {
      if (!newIds.has(id)) { fg.remove(mesh); disposeMesh(mesh); meshMap.current.delete(id) }
    })
    items.forEach(pf => {
      const id = pf._id || pf.furnitureId
      const existing = meshMap.current.get(id)
      if (existing && existing.userData.pfColor !== pf.color) {
        fg.remove(existing); disposeMesh(existing); meshMap.current.delete(id)
      }
      let group = meshMap.current.get(id)
      if (!group) {
        group = createFurnitureMesh(pf)
        group.userData.furnitureId = id
        group.userData.pfColor = pf.color
        fg.add(group)
        meshMap.current.set(id, group)
      }
      group.position.set(pf.position.x, pf.position.y, pf.position.z)
      group.rotation.y = (pf.rotation * Math.PI) / 180
      group.scale.setScalar(pf.scale || 1)
      highlightMesh(group, id === selectedId)
    })
  }, [])

  const setView = useCallback((mode: ViewMode, dims?: { width: number; depth: number; height: number }) => {
    const cam = cameraRef.current, ctrl = controlsRef.current
    if (!cam || !ctrl) return
    const w = dims?.width || 5, d = dims?.depth || 4, h = dims?.height || 2.7
    const dist = Math.max(w, d) * 1.5
    const pos: Record<ViewMode, [number, number, number]> = {
      free:         [dist, dist*0.8, dist],
      default:      [w*0.9, h*1.6, d*2],
      front:        [0, h*0.6, d*2.2],
      'side-left':  [-w*2.2, h*0.6, 0],
      'side-right': [w*2.2, h*0.6, 0],
      top:          [0, Math.max(w,d)*1.6, 0.001],
    }
    const [px, py, pz] = pos[mode] ?? pos.default
    cam.position.set(px, py, pz)
    ctrl.target.set(0, h*0.3, 0)
    ctrl.update()
  }, [])

  const setTimeOfDay = useCallback((hour: number) => {
    const sun = sunRef.current
    if (!sun) return
    // Map hour 6-22 to sun position and color
    const t = (hour - 6) / 16 // 0 at 6:00, 1 at 22:00
    const angle = t * Math.PI // 0 = east horizon, PI = west horizon
    const elevation = Math.sin(angle) // 0 at sunrise/sunset, 1 at noon
    const dist = 14
    sun.position.set(
      Math.cos(angle) * dist,
      Math.max(0.5, elevation * dist),
      4
    )
    // Color: warm orange at sunrise/sunset, white at noon, dim at night
    const isRising = t < 0.3 || t > 0.7
    if (elevation < 0.15) {
      sun.color.setHex(0xff7744); sun.intensity = 0.3
    } else if (isRising) {
      sun.color.setHex(0xffcc88); sun.intensity = 0.7 + elevation * 0.5
    } else {
      sun.color.setHex(0xfffde7); sun.intensity = 0.8 + elevation * 0.4
    }
    // Scene background tints
    if (sceneRef.current) {
      const bg = elevation < 0.1
        ? new THREE.Color(0x1a1520)
        : elevation < 0.3
          ? new THREE.Color(0xe8c8a0).lerp(new THREE.Color(0xf0ede8), (elevation - 0.1) / 0.2)
          : new THREE.Color(0xf0ede8)
      sceneRef.current.background = bg
    }
  }, [])

  const toggleWalkMode = useCallback((onExit?: () => void) => {
    const wc = walkCtrlRef.current
    const oc = controlsRef.current
    if (!wc || !oc) return
    if (!walkMode.current) {
      walkMode.current = true
      oc.enabled = false
      wc.lock()
      const handleUnlock = () => {
        walkMode.current = false
        oc.enabled = true
        onExit?.()
        wc.removeEventListener('unlock', handleUnlock)
      }
      wc.addEventListener('unlock', handleUnlock)
    } else {
      wc.unlock()
    }
  }, [])

  return { buildRoom, updateFurniture3D, setView, setTimeOfDay, toggleWalkMode }
}
