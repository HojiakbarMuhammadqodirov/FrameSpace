import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  House, Sparkle, ShoppingCart, PaintBrush, FloppyDisk, Ruler,
  Sun, Moon, ArrowRight, CheckCircle, ArrowsClockwise, List, X,
} from '@phosphor-icons/react'
import * as THREE from 'three'
import AuthModal from '../components/auth/AuthModal'
import MarketingFooter from '../components/common/MarketingFooter'
import LanguageToggle from '../components/common/LanguageToggle'
import useStore from '../store/useStore'
import { useTheme } from '../hooks/useTheme'
import { useReveal } from '../hooks/useReveal'
import { useLang } from '../i18n/LanguageProvider'

// Feature cards — copy comes from translations, keyed by `key`.
const FEATURES = [
  { Icon: House,        key: 'room3d' },
  { Icon: Sparkle,      key: 'ai' },
  { Icon: ShoppingCart, key: 'shop' },
  { Icon: PaintBrush,   key: 'customize' },
  { Icon: FloppyDisk,   key: 'save' },
  { Icon: Ruler,        key: 'precision' },
]

const NAV_LINKS = [
  { key: 'shopAll',      to: '/shop' },
  { key: 'roomDesigner', to: '/dashboard' },
  { key: 'collections',  to: '/collections' },
  { key: 'inspiration',  to: '/inspiration' },
  { key: 'about',        to: '/about' },
  { key: 'contact',      to: '/contact' },
]

export default function Landing() {
  const [modal, setModal] = useState<'login' | 'signup' | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [hintHidden, setHintHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { token } = useStore() as any
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const { t } = useLang()

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useReveal()

  // ── THREE.JS INTERACTIVE 3D ROOM INTEGRATION ──
  useEffect(() => {
    if (!canvasRef.current || !wrapRef.current) return

    const canvas = canvasRef.current
    const wrap = wrapRef.current

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15

    /* ── Scene ── */
    const scene = new THREE.Scene()

    /* ── Camera ── */
    const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 100)

    /* ── Resize ── */
    function onResize() {
      if (!wrap) return
      const w = wrap.clientWidth, h = wrap.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    onResize()
    window.addEventListener('resize', onResize)

    /* ── Materials ── */
    const M = (opts: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(opts)
    
    const floorMat    = M({ color: 0x8B6840, roughness: 0.50, metalness: 0.04 })
    const wallColor   = 0xECE5D8
    const ceilColor   = 0xF6F2EA
    const sofaMat     = M({ color: 0x1A2644, roughness: 0.88, metalness: 0.0 })
    const cushionMat  = M({ color: 0x22305A, roughness: 0.80, metalness: 0.0 })
    const pillowMat   = M({ color: 0xC9A84C, roughness: 0.78, metalness: 0.0 })
    const walnutMat   = M({ color: 0x3C1F0E, roughness: 0.42, metalness: 0.04 })
    const oakMat      = M({ color: 0xBA8E5C, roughness: 0.58, metalness: 0.02 })
    const oakDarkMat  = M({ color: 0x7A5432, roughness: 0.62, metalness: 0.02 })
    const metalMat    = M({ color: 0xC0A060, roughness: 0.22, metalness: 0.96 })
    const rugMat      = M({ color: 0x8B3A2A, roughness: 0.98, metalness: 0.0 })
    const rugAccMat   = M({ color: 0xC47030, roughness: 0.98, metalness: 0.0 })
    const bedFrameMat = M({ color: 0xEEEBE0, roughness: 0.68, metalness: 0.0 })
    const linenMat    = M({ color: 0xD9CEBC, roughness: 0.92, metalness: 0.0 })
    const linenAccMat = M({ color: 0x2F4060, roughness: 0.88, metalness: 0.0 })
    const lampBaseMat = M({ color: 0x8A7248, roughness: 0.28, metalness: 0.82 })
    const lampShadeMat= M({ color: 0xF5DFA0, roughness: 0.6, metalness: 0.0,
                           emissive: new THREE.Color(0xFFCF60), emissiveIntensity: 0.6,
                           side: THREE.DoubleSide, transparent: true, opacity: 0.90 })
    const potMat      = M({ color: 0xB05830, roughness: 0.80, metalness: 0.0 })
    const plantMat    = M({ color: 0x2D6B30, roughness: 0.95, metalness: 0.0 })
    const frameMat    = M({ color: 0x2A1A08, roughness: 0.40, metalness: 0.12 })
    const canvasMat   = M({ color: 0xB07845, roughness: 0.70, metalness: 0.0  })
    const glassMat    = M({ color: 0x90B8D0, roughness: 0.04, metalness: 0.0, transparent: true, opacity: 0.22 })
    const corniceMat  = M({ color: 0xC9A84C, roughness: 0.28, metalness: 0.65 })

    function mk(geo: THREE.BufferGeometry, mat: THREE.Material, cs = true, rs = true) {
      const m = new THREE.Mesh(geo, mat)
      m.castShadow = cs; m.receiveShadow = rs; return m
    }

    /* ── Room Dimensions ── */
    const W = 7, D = 7, H = 3.2
    const hw = W / 2, hd = D / 2

    // Floor & Ceiling
    const floor = mk(new THREE.BoxGeometry(W, 0.08, D), floorMat, false, true)
    floor.position.set(0, -0.04, 0)
    scene.add(floor)

    const ceilMesh = mk(new THREE.BoxGeometry(W, 0.08, D), M({ color: ceilColor, roughness: 1.0, metalness: 0.0, side: THREE.DoubleSide }), false, true)
    ceilMesh.position.set(0, H + 0.04, 0)
    scene.add(ceilMesh)

    // Cornice strip
    const cornA = mk(new THREE.BoxGeometry(W + 0.04, 0.06, 0.08), corniceMat, false, false)
    cornA.position.set(0, H - 0.03, -hd); scene.add(cornA)
    const cornB = mk(new THREE.BoxGeometry(W + 0.04, 0.06, 0.08), corniceMat, false, false)
    cornB.position.set(0, H - 0.03,  hd); scene.add(cornB)
    const cornC = mk(new THREE.BoxGeometry(0.08, 0.06, D + 0.04), corniceMat, false, false)
    cornC.position.set(-hw, H - 0.03, 0); scene.add(cornC)
    const cornD = mk(new THREE.BoxGeometry(0.08, 0.06, D + 0.04), corniceMat, false, false)
    cornD.position.set( hw, H - 0.03, 0); scene.add(cornD)

    // Smart Walls
    function makeWallMat() {
      return M({ color: wallColor, roughness: 0.92, metalness: 0.0, transparent: true, opacity: 1.0, depthWrite: false })
    }

    const wallBackMat  = makeWallMat()
    const wallBackMesh = mk(new THREE.BoxGeometry(W, H, 0.10), wallBackMat, false, true)
    wallBackMesh.position.set(0, H / 2, -hd + 0.05)
    scene.add(wallBackMesh)

    const wallLeftMat  = makeWallMat()
    const wallLeftMesh = mk(new THREE.BoxGeometry(0.10, H, D), wallLeftMat, false, true)
    wallLeftMesh.position.set(-hw + 0.05, H / 2, 0)
    scene.add(wallLeftMesh)

    const wallRightMat  = makeWallMat()
    const wallRightMesh = mk(new THREE.BoxGeometry(0.10, H, D), wallRightMat, false, true)
    wallRightMesh.position.set(hw - 0.05, H / 2, 0)
    scene.add(wallRightMesh)

    const wallFrontMat  = makeWallMat()
    const wallFrontMesh = mk(new THREE.BoxGeometry(W, H, 0.10), wallFrontMat, false, true)
    wallFrontMesh.position.set(0, H / 2, hd - 0.05)
    scene.add(wallFrontMesh)

    // Door
    const doorFrameMat = M({ color: 0xEEEBE0, roughness: 0.5, metalness: 0.0 })
    const doorFrame = mk(new THREE.BoxGeometry(1.02, 2.16, 0.12), doorFrameMat, false, false)
    doorFrame.position.set(-2.2, 1.08, hd)
    scene.add(doorFrame)

    const doorLeaf = mk(new THREE.BoxGeometry(0.92, 2.05, 0.06), M({ color: 0xD8C8A8, roughness: 0.55, metalness: 0.0 }), true, false)
    doorLeaf.position.set(-2.2, 1.025, hd + 0.01)
    scene.add(doorLeaf)

    const doorPanel = mk(new THREE.BoxGeometry(0.76, 0.88, 0.04), M({ color: 0xC8B898, roughness: 0.6 }), false, false)
    doorPanel.position.set(-2.2, 1.55, hd + 0.05)
    scene.add(doorPanel)

    const doorPanel2 = mk(new THREE.BoxGeometry(0.76, 0.88, 0.04), M({ color: 0xC8B898, roughness: 0.6 }), false, false)
    doorPanel2.position.set(-2.2, 0.52, hd + 0.05)
    scene.add(doorPanel2)

    const dHandle = mk(new THREE.CylinderGeometry(0.016, 0.016, 0.12, 10), metalMat, false, false)
    dHandle.rotation.z = Math.PI / 2
    dHandle.position.set(-1.74, 1.05, hd + 0.06)
    scene.add(dHandle)

    const dRosette = mk(new THREE.CylinderGeometry(0.038, 0.038, 0.03, 16), metalMat, false, false)
    dRosette.rotation.x = Math.PI / 2
    dRosette.position.set(-1.74, 1.05, hd + 0.075)
    scene.add(dRosette)

    // Window
    const wfMat = M({ color: 0xEEEBE0, roughness: 0.5, metalness: 0.0 })
    const winFrame = mk(new THREE.BoxGeometry(0.12, 1.45, 1.95), wfMat, false, false)
    winFrame.position.set(-hw, 1.88, 0.6)
    scene.add(winFrame)

    const winGlass = mk(new THREE.PlaneGeometry(1.78, 1.28), glassMat, false, false)
    winGlass.rotation.y = Math.PI / 2
    winGlass.position.set(-hw + 0.07, 1.88, 0.6)
    scene.add(winGlass)

    const wdH = mk(new THREE.BoxGeometry(0.04, 1.28, 0.04), frameMat, false, false)
    wdH.position.set(-hw + 0.07, 1.88, 0.6)
    scene.add(wdH)

    const wdV = mk(new THREE.BoxGeometry(0.04, 0.04, 1.78), frameMat, false, false)
    wdV.position.set(-hw + 0.07, 1.88, 0.6)
    scene.add(wdV)

    const sill = mk(new THREE.BoxGeometry(0.18, 0.06, 2.08), M({ color: 0xE8E0D0, roughness: 0.7 }), false, false)
    sill.position.set(-hw + 0.09, 1.14, 0.6)
    scene.add(sill)

    // Rug
    const rug = mk(new THREE.BoxGeometry(3.4, 0.04, 2.4), rugMat, false, true)
    rug.position.set(-0.5, 0.02, 0.2)
    scene.add(rug)

    const rugBorder = mk(new THREE.BoxGeometry(3.1, 0.045, 2.1), rugAccMat, false, false)
    rugBorder.position.set(-0.5, 0.023, 0.2)
    scene.add(rugBorder)

    // Sofa
    const sofaG = new THREE.Group()
    sofaG.position.set(-0.6, 0, -2.55)
    scene.add(sofaG)

    const sBase = mk(new THREE.BoxGeometry(2.5, 0.32, 0.96), sofaMat)
    sBase.position.set(0, 0.16, 0)
    sofaG.add(sBase)

    for (let i = -1; i <= 1; i++) {
      const sc = mk(new THREE.BoxGeometry(0.76, 0.22, 0.84), cushionMat)
      sc.position.set(i * 0.80, 0.43, 0.04)
      sofaG.add(sc)
    }

    const sBack = mk(new THREE.BoxGeometry(2.5, 0.72, 0.22), sofaMat)
    sBack.position.set(0, 0.66, -0.37)
    sofaG.add(sBack)

    for (let i = -1; i <= 1; i += 2) {
      const bc = mk(new THREE.BoxGeometry(1.12, 0.62, 0.18), cushionMat)
      bc.position.set(i * 0.60, 0.66, -0.36)
      sofaG.add(bc)
    }

    for (let s = -1; s <= 1; s += 2) {
      const sa = mk(new THREE.BoxGeometry(0.22, 0.52, 0.96), sofaMat)
      sa.position.set(s * 1.36, 0.42, 0)
      sofaG.add(sa)
    }

    const sofaLegs: [number, number][] = [[-1.15, -0.38], [1.15, -0.38], [-1.15, 0.38], [1.15, 0.38]]
    sofaLegs.forEach(([x, z]) => {
      const leg = mk(new THREE.CylinderGeometry(0.025, 0.025, 0.14, 8), metalMat)
      leg.position.set(x, 0.07, z)
      sofaG.add(leg)
    })

    const tp = mk(new THREE.BoxGeometry(0.40, 0.28, 0.12), pillowMat)
    tp.position.set(1.05, 0.82, -0.22); tp.rotation.z = 0.14
    sofaG.add(tp)

    // Coffee Table
    const ctG = new THREE.Group()
    ctG.position.set(-0.5, 0, -0.85)
    scene.add(ctG)

    const ctTop = mk(new THREE.BoxGeometry(1.35, 0.05, 0.75), walnutMat)
    ctTop.position.set(0, 0.42, 0)
    ctG.add(ctTop)

    const ctShelf = mk(new THREE.BoxGeometry(1.15, 0.04, 0.58), walnutMat)
    ctShelf.position.set(0, 0.20, 0)
    ctG.add(ctShelf)

    const tableLegs: [number, number][] = [[-0.58, -0.29], [0.58, -0.29], [-0.58, 0.29], [0.58, 0.29]]
    tableLegs.forEach(([x, z]) => {
      const leg = mk(new THREE.BoxGeometry(0.04, 0.42, 0.04), metalMat)
      leg.position.set(x, 0.21, z); ctG.add(leg)
    })

    const bookColors = [0x8B3A2A, 0x2A4A8B, 0x2A7A3A, 0xC9A84C]
    bookColors.forEach((c, i) => {
      const bk = mk(new THREE.BoxGeometry(0.07, 0.16, 0.52), M({ color: c, roughness: 0.80 }))
      bk.position.set(-0.30 + i * 0.14, 0.28, 0)
      ctG.add(bk)
    })

    const tray = mk(new THREE.BoxGeometry(0.52, 0.022, 0.37), metalMat)
    tray.position.set(0.22, 0.441, 0); ctG.add(tray)

    const candle = mk(new THREE.CylinderGeometry(0.036, 0.036, 0.13, 12), M({ color: 0xF5F0E0, roughness: 0.7 }))
    candle.position.set(0.22, 0.516, 0); ctG.add(candle)

    const flame = mk(new THREE.SphereGeometry(0.018, 8, 6), M({ color: 0xFFAA20, emissive: new THREE.Color(0xFF8800), emissiveIntensity: 2.0, roughness: 0.3 }), false, false)
    flame.position.set(0.22, 0.60, 0); ctG.add(flame)

    // Wardrobe
    const wdG = new THREE.Group()
    wdG.position.set(-2.62, 0, -3.12)
    scene.add(wdG)

    const wdBody = mk(new THREE.BoxGeometry(1.32, 2.22, 0.58), oakMat)
    wdBody.position.set(0, 1.11, 0); wdG.add(wdBody)

    const wdTop = mk(new THREE.BoxGeometry(1.38, 0.08, 0.60), oakDarkMat)
    wdTop.position.set(0, 2.26, 0); wdG.add(wdTop)

    for (let s = -1; s <= 1; s += 2) {
      const door = mk(new THREE.BoxGeometry(0.60, 2.02, 0.04), oakMat)
      door.position.set(s * 0.32, 1.11, 0.31); wdG.add(door)
      const pan1 = mk(new THREE.BoxGeometry(0.46, 0.88, 0.03), oakDarkMat)
      pan1.position.set(s * 0.32, 1.42, 0.33); wdG.add(pan1)
      const pan2 = mk(new THREE.BoxGeometry(0.46, 0.88, 0.03), oakDarkMat)
      pan2.position.set(s * 0.32, 0.56, 0.33); wdG.add(pan2)
      const hdl = mk(new THREE.CylinderGeometry(0.013, 0.013, 0.14, 8), metalMat)
      hdl.rotation.z = Math.PI / 2
      hdl.position.set(s * -0.07, 1.13, 0.35); wdG.add(hdl)
    }

    // Bed
    const bedG = new THREE.Group()
    bedG.position.set(2.35, 0, -2.20)
    scene.add(bedG)

    const bedBase = mk(new THREE.BoxGeometry(1.86, 0.28, 2.15), bedFrameMat)
    bedBase.position.set(0, 0.14, 0); bedG.add(bedBase)

    const hb = mk(new THREE.BoxGeometry(1.86, 0.78, 0.10), bedFrameMat)
    hb.position.set(0, 0.67, -1.075); bedG.add(hb)

    const hbPanel = mk(new THREE.BoxGeometry(1.56, 0.52, 0.06), M({ color: 0xD8D0C0, roughness: 0.65 }))
    hbPanel.position.set(0, 0.67, -1.04); bedG.add(hbPanel)

    const matt = mk(new THREE.BoxGeometry(1.78, 0.22, 2.08), linenMat)
    matt.position.set(0, 0.39, 0.02); bedG.add(matt)

    const duvet = mk(new THREE.BoxGeometry(1.70, 0.14, 1.55), M({ color: 0xEDE8DE, roughness: 0.92 }))
    duvet.position.set(0, 0.57, 0.32); bedG.add(duvet)

    const stripe = mk(new THREE.BoxGeometry(1.70, 0.145, 0.14), linenAccMat)
    stripe.position.set(0, 0.578, -0.40); bedG.add(stripe)

    for (let s = -1; s <= 1; s += 2) {
      const pl = mk(new THREE.BoxGeometry(0.74, 0.16, 0.48), linenMat)
      pl.position.set(s * 0.46, 0.575, -0.68); bedG.add(pl)
    }

    const bedLegs: [number, number][] = [[-0.84, -1.01], [0.84, -1.01], [-0.84, 1.02], [0.84, 1.02]]
    bedLegs.forEach(([x, z]) => {
      const leg = mk(new THREE.BoxGeometry(0.08, 0.26, 0.08), oakDarkMat)
      leg.position.set(x, 0.13, z); bedG.add(leg)
    })

    const ns = mk(new THREE.BoxGeometry(0.50, 0.54, 0.44), oakMat)
    ns.position.set(-1.22, 0.27, -0.62); bedG.add(ns)

    const nsHdl = mk(new THREE.CylinderGeometry(0.011, 0.011, 0.18, 8), metalMat)
    nsHdl.rotation.z = Math.PI / 2
    nsHdl.position.set(-1.22, 0.34, -0.40); bedG.add(nsHdl)

    const nsLampBase = mk(new THREE.CylinderGeometry(0.10, 0.12, 0.04, 16), metalMat)
    nsLampBase.position.set(-1.22, 0.56, -0.62); bedG.add(nsLampBase)

    const nsLampPole = mk(new THREE.CylinderGeometry(0.015, 0.015, 0.30, 8), metalMat)
    nsLampPole.position.set(-1.22, 0.71, -0.62); bedG.add(nsLampPole)

    const nsShade = mk(new THREE.CylinderGeometry(0.16, 0.10, 0.20, 16, 1, true), M({ color: 0xF0DCA0, emissive: new THREE.Color(0xFFCC44), emissiveIntensity: 0.5, side: THREE.DoubleSide, transparent: true, opacity: 0.88 }))
    nsShade.position.set(-1.22, 0.92, -0.62); bedG.add(nsShade)

    // Floor Lamp
    const lampG = new THREE.Group()
    lampG.position.set(1.75, 0, -2.15)
    scene.add(lampG)

    const lBase = mk(new THREE.CylinderGeometry(0.19, 0.21, 0.05, 24), lampBaseMat)
    lBase.position.set(0, 0.025, 0); lampG.add(lBase)

    const lPole = mk(new THREE.CylinderGeometry(0.022, 0.022, 1.72, 12), lampBaseMat)
    lPole.position.set(0, 0.91, 0); lampG.add(lPole)

    const lArm = mk(new THREE.CylinderGeometry(0.018, 0.018, 0.48, 8), lampBaseMat)
    lArm.rotation.z = Math.PI / 2
    lArm.position.set(0.24, 1.74, 0); lampG.add(lArm)

    const lShade = mk(new THREE.CylinderGeometry(0.30, 0.17, 0.38, 24, 1, true), lampShadeMat)
    lShade.position.set(0.48, 1.60, 0); lampG.add(lShade)

    const lShadeTop = mk(new THREE.CircleGeometry(0.16, 20), lampShadeMat)
    lShadeTop.rotation.x = -Math.PI / 2
    lShadeTop.position.set(0.48, 1.79, 0); lampG.add(lShadeTop)

    // Plant
    const plantG = new THREE.Group()
    plantG.position.set(-2.9, 0, 2.5)
    scene.add(plantG)

    const pot = mk(new THREE.CylinderGeometry(0.19, 0.14, 0.32, 20), potMat)
    pot.position.set(0, 0.16, 0); plantG.add(pot)

    const saucer = mk(new THREE.CylinderGeometry(0.23, 0.23, 0.03, 20), potMat)
    saucer.position.set(0, 0.015, 0); plantG.add(saucer)

    const soil = mk(new THREE.CylinderGeometry(0.17, 0.17, 0.04, 20), M({ color: 0x2A1A08, roughness: 1.0 }))
    soil.position.set(0, 0.32, 0); plantG.add(soil)

    const leaves = [[0,0.65,0],[0.14,0.88,0.09],[-0.16,0.80,0.06],[0.07,1.02,-0.11],[-0.09,1.14,0.13],[0.03,1.28,-0.05],[0.11,1.42,0.08],[-0.06,1.52,-0.03]]
    leaves.forEach(([x, y, z], i) => {
      const r = Math.max(0.13 - i * 0.012, 0.065)
      const leaf = mk(new THREE.SphereGeometry(r, 10, 8), plantMat)
      leaf.scale.set(1, 1.4 + i * 0.08, 0.65)
      leaf.position.set(x, y, z); plantG.add(leaf)
    })

    // Wall Art
    const paintF = mk(new THREE.BoxGeometry(1.15, 0.88, 0.06), frameMat, false, false)
    paintF.position.set(-0.6, 2.05, -hd + 0.06); scene.add(paintF)
    const paintC = mk(new THREE.BoxGeometry(0.98, 0.72, 0.03), canvasMat, false, false)
    paintC.position.set(-0.6, 2.05, -hd + 0.078); scene.add(paintC)
    const abs = mk(new THREE.BoxGeometry(0.48, 0.52, 0.025), M({ color: 0x1E3A5A, roughness: 0.7 }), false, false)
    abs.position.set(-0.7, 2.10, -hd + 0.092); scene.add(abs)

    const mirF = mk(new THREE.CylinderGeometry(0.33, 0.33, 0.042, 32), metalMat, false, false)
    mirF.rotation.x = Math.PI / 2
    mirF.position.set(1.3, 2.1, -hd + 0.062); scene.add(mirF)

    const mirG2 = mk(new THREE.CircleGeometry(0.28, 32), M({ color: 0x90B8D0, roughness: 0.0, metalness: 0.92 }), false, false)
    mirG2.position.set(1.3, 2.1, -hd + 0.085); scene.add(mirG2)

    // Chandelier
    const chanG = new THREE.Group()
    chanG.position.set(-0.3, H, -0.8)
    scene.add(chanG)

    const chanMount = mk(new THREE.CylinderGeometry(0.09, 0.09, 0.12, 20), metalMat, false, false)
    chanMount.position.set(0, -0.06, 0); chanG.add(chanMount)
    const chanRod = mk(new THREE.CylinderGeometry(0.022, 0.022, 0.32, 8), metalMat, false, false)
    chanRod.position.set(0, -0.29, 0); chanG.add(chanRod)
    const chanDisc = mk(new THREE.CylinderGeometry(0.38, 0.32, 0.09, 28), metalMat, false, false)
    chanDisc.position.set(0, -0.50, 0); chanG.add(chanDisc)

    const angles = [0, Math.PI/2, Math.PI, Math.PI*1.5]
    angles.forEach(ang => {
      const ag = new THREE.Group()
      const pa = mk(new THREE.CylinderGeometry(0.013, 0.013, 0.34, 8), metalMat, false, false)
      pa.rotation.z = Math.PI/2; pa.position.set(0.17, 0, 0); ag.add(pa)
      const bulb = mk(new THREE.SphereGeometry(0.046, 10, 8), M({ color: 0xFFE8A0, emissive: new THREE.Color(0xFFCC44), emissiveIntensity: 1.6, roughness: 0.2 }), false, false)
      bulb.position.set(0.34, -0.06, 0); ag.add(bulb)
      ag.rotation.y = ang
      ag.position.set(0, -0.48, 0)
      chanG.add(ag)
    })

    // Shelf
    const shelfG = new THREE.Group()
    shelfG.position.set(hw - 0.08, 1.55, 1.3)
    shelfG.rotation.y = -Math.PI / 2
    scene.add(shelfG)

    const shelfBoard = mk(new THREE.BoxGeometry(0.80, 0.04, 0.20), oakMat, false, false)
    shelfBoard.position.set(0, 0, 0); shelfG.add(shelfBoard)
    const sb2 = mk(new THREE.BoxGeometry(0.80, 0.04, 0.20), oakMat, false, false)
    sb2.position.set(0, -0.42, 0); shelfG.add(sb2)

    for (let xs = -1; xs <= 1; xs += 2) {
      const br = mk(new THREE.BoxGeometry(0.03, 0.12, 0.18), metalMat, false, false)
      br.position.set(xs * 0.35, -0.06, 0.01); shelfG.add(br)
      const br2 = mk(new THREE.BoxGeometry(0.03, 0.12, 0.18), metalMat, false, false)
      br2.position.set(xs * 0.35, -0.48, 0.01); shelfG.add(br2)
    }

    const shelfColors1 = [0xC9A84C, 0x3A4A70, 0xB05830]
    shelfColors1.forEach((c, i) => {
      const it = mk(new THREE.BoxGeometry(0.06, 0.08 + i*0.04, 0.06), M({ color: c, roughness: 0.6 }))
      it.position.set(-0.26 + i * 0.20, 0.06 + (0.08 + i*0.04)/2, 0); shelfG.add(it)
    })

    const shelfColors2 = [0x8B3A2A, 0x2A6B3A]
    shelfColors2.forEach((c, i) => {
      const it = mk(new THREE.BoxGeometry(0.06, 0.10 + i*0.03, 0.06), M({ color: c, roughness: 0.6 }))
      it.position.set(-0.20 + i * 0.22, -0.38 + (0.10 + i*0.03)/2, 0); shelfG.add(it)
    })

    /* ── Lighting ── */
    scene.add(new THREE.AmbientLight(0xB0C8E0, 0.40))

    const sun = new THREE.DirectionalLight(0xFFE0A0, 2.2)
    sun.position.set(-6, 5, 1)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.bias = -0.001
    scene.add(sun)

    const chanLight = new THREE.PointLight(0xFFE090, 3.0, 10, 1.6)
    chanLight.position.set(-0.3, H - 0.55, -0.8)
    chanLight.castShadow = true
    chanLight.shadow.mapSize.set(1024, 1024)
    scene.add(chanLight)

    const lampLight = new THREE.PointLight(0xFFCC60, 2.4, 5.5, 2.0)
    lampLight.position.set(2.23, 1.65, -2.15)
    scene.add(lampLight)

    const nsLight = new THREE.PointLight(0xFFD080, 1.2, 2.5, 2.0)
    nsLight.position.set(1.13, 1.0, -2.82)
    scene.add(nsLight)

    const fill = new THREE.DirectionalLight(0x9AB8D8, 0.30)
    fill.position.set(5, 4, 5)
    scene.add(fill)

    /* ── Orbit controls — default camera pulled back slightly ── */
    const pivot = new THREE.Vector3(0, 1.1, 0)
    let theta  = Math.PI * 0.30
    let phi    = 0.42
    let radius = 16.5 

    let tTheta = theta, tPhi = phi, tRadius = radius
    const PHI_MIN   = -0.08
    const PHI_MAX   = Math.PI/2 + 0.05
    const RAD_MIN   = 6
    const RAD_MAX   = 24
    const SENS_DRAG = 0.007
    const SENS_ZOOM = 0.12

    function camFromSpherical() {
      const sinPhi = Math.sin(phi), cosPhi = Math.cos(phi)
      camera.position.set(
        pivot.x + radius * Math.cos(theta) * cosPhi,
        pivot.y + radius * sinPhi,
        pivot.z + radius * Math.sin(theta) * cosPhi
      )
      camera.lookAt(pivot)
    }
    camFromSpherical()

    /* ── Interaction Handlers ── */
    let dragging = false
    let pX = 0, pY = 0
    let autoSpin = true

    function pointerDown(x: number, y: number) {
      dragging  = true
      autoSpin  = false
      pX = x
      pY = y
      setHintHidden(true)
    }

    function pointerMove(x: number, y: number) {
      if (!dragging) return
      const dx = x - pX, dy = y - pY
      pX = x; pY = y
      tTheta -= dx * SENS_DRAG
      tPhi = Math.max(PHI_MIN, Math.min(PHI_MAX, tPhi + dy * SENS_DRAG))
    }

    function pointerUp() { dragging = false }

    const onMouseDown = (e: globalThis.MouseEvent) => pointerDown(e.clientX, e.clientY)
    const onMouseMove = (e: globalThis.MouseEvent) => pointerMove(e.clientX, e.clientY)
    
    const onTouchStart = (e: globalThis.TouchEvent) => {
      if (e.touches.length > 0) pointerDown(e.touches[0].clientX, e.touches[0].clientY)
    }
    const onTouchMove = (e: globalThis.TouchEvent) => {
      if (e.touches.length > 0) pointerMove(e.touches[0].clientX, e.touches[0].clientY)
    }

    const onWheel = (e: globalThis.WheelEvent) => {
      e.preventDefault()
      tRadius = Math.max(RAD_MIN, Math.min(RAD_MAX, tRadius + e.deltaY * SENS_ZOOM * 0.05))
    }

    wrap.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", pointerUp)
    wrap.addEventListener("touchstart", onTouchStart, { passive: false })
    wrap.addEventListener("touchmove", onTouchMove, { passive: false })
    wrap.addEventListener("touchend", pointerUp)
    wrap.addEventListener("wheel", onWheel, { passive: false })

    /* ── Smart Wall Fade ── */
    const FADE_RANGE = 2.0
    function wallOpacity(camCoord: number, wallPos: number, outsideDir: number) {
      const dist = (camCoord - wallPos) * outsideDir
      if (dist <= 0) return 1.0
      return Math.max(0, 1.0 - dist / FADE_RANGE)
    }

    /* ── Animation Loop ── */
    let animationFrameId: number
    const clock = new THREE.Clock()

    function animate() {
      animationFrameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      if (autoSpin) tTheta += 0.0028

      theta  += (tTheta  - theta)  * 0.09
      phi    += (tPhi    - phi)    * 0.09
      radius += (tRadius - radius) * 0.09

      camFromSpherical()

      const cx = camera.position.x, cy = camera.position.y, cz = camera.position.z
      
      wallBackMat.opacity  = wallOpacity(cz, -hd, -1)
      wallFrontMat.opacity = wallOpacity(cz,  hd,  1)
      wallLeftMat.opacity  = wallOpacity(cx, -hw, -1)
      wallRightMat.opacity = wallOpacity(cx,  hw,  1)

      ceilMesh.material.opacity = wallOpacity(cy, H, 1)
      ceilMesh.material.transparent = true

      wallBackMat.needsUpdate  = true
      wallFrontMat.needsUpdate = true
      wallLeftMat.needsUpdate  = true
      wallRightMat.needsUpdate = true
      ceilMesh.material.needsUpdate = true

      // Lamp flickering effects
      lampLight.intensity = 2.4 + Math.sin(t * 3.1) * 0.14 + Math.sin(t * 7.4) * 0.04
      chanLight.intensity = 3.0 + Math.sin(t * 1.8) * 0.10
      nsLight.intensity   = 1.2 + Math.sin(t * 2.5) * 0.08
      lampShadeMat.emissiveIntensity = 0.60 + Math.sin(t * 3.1) * 0.06

      renderer.render(scene, camera)
    }
    animate()

    /* ── Clean up ── */
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', onResize)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", pointerUp)
      if (wrap) {
        wrap.removeEventListener("mousedown", onMouseDown)
        wrap.removeEventListener("touchstart", onTouchStart)
        wrap.removeEventListener("touchmove", onTouchMove)
        wrap.removeEventListener("touchend", pointerUp)
        wrap.removeEventListener("wheel", onWheel)
      }

      scene.traverse((object: any) => {
        if (!object.isMesh) return
        object.geometry.dispose()
        if (Array.isArray(object.material)) {
          object.material.forEach((mat: any) => {
            if (mat && typeof mat.dispose === 'function') mat.dispose()
          })
        } else {
          if (object.material && typeof object.material.dispose === 'function') object.material.dispose()
        }
      })
      renderer.dispose()
    }
  }, [])

  return (
    <div className="min-h-[100dvh] bg-brand-grey-light overflow-x-hidden">

      {/* ── Full-width transparent navbar — visible at top ── */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-[opacity,transform] duration-300 ${
        scrolled ? 'opacity-0 pointer-events-none -translate-y-1' : 'opacity-100'
      }`}>
        <div className="flex items-center justify-between px-5 sm:px-10 md:px-16 py-5">
          
          {/* Mobile: menu button in place of the logo */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="md:hidden w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-brand-dark hover:bg-brand-grey/60 transition-colors ease-spring duration-150"
          >
            {menuOpen ? <X size={20} weight="regular" /> : <List size={20} weight="regular" />}
          </button>

          <Link to="/" className="hidden md:flex items-center">
            <img src="/logo.png" alt="FrameSpace Logo" className="h-10 w-auto object-contain" />
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(l => (
              <Link key={l.to} to={l.to}
                className="text-sm font-medium text-brand-dark/70 hover:text-brand-dark transition-colors duration-150">
                {t(`nav.${l.key}`)}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <LanguageToggle />
            <button onClick={toggle} title={theme === 'light' ? t('common.darkMode') : t('common.lightMode')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-brand-grey-dark hover:text-brand-dark hover:bg-brand-grey/60 transition-colors ease-spring duration-150">
              {theme === 'light' ? <Moon size={15} weight="regular" /> : <Sun size={15} weight="regular" />}
            </button>
            {token ? (
              <Link to="/dashboard" className="btn-primary text-sm py-2 px-5">{t('common.myDashboard')}</Link>
            ) : (
              <>
                <button onClick={() => setModal('login')} className="btn-ghost text-sm py-2 px-4 hidden sm:block">{t('common.signIn')}</button>
                <button onClick={() => setModal('signup')} className="btn-primary text-sm py-2 px-4 sm:px-5 flex items-center gap-1.5">
                  {t('common.getStarted')} <ArrowRight size={13} weight="bold" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Island navbar — appears on scroll ── */}
      <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-1.5rem)] transition-[opacity,transform] duration-300 ${
        scrolled ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}>
        <nav className="flex items-center gap-3 px-4 py-2.5 bg-surface-raised/90 backdrop-blur-2xl rounded-full border border-brand-grey shadow-float whitespace-nowrap">
          
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="sm:hidden w-7 h-7 rounded-full flex items-center justify-center text-brand-dark hover:bg-brand-grey transition-colors ease-spring duration-150"
          >
            {menuOpen ? <X size={16} weight="regular" /> : <List size={16} weight="regular" />}
          </button>

          <Link to="/" className="hidden sm:flex items-center">
            <img src="/logo.png" alt="FrameSpace Logo" className="h-6 w-auto object-contain" />
          </Link>

          <div className="w-px h-4 bg-brand-grey" />

          <div className="hidden sm:flex items-center gap-4">
            <Link to="/shop" className="text-xs font-medium text-brand-grey-dark hover:text-brand-dark transition-colors duration-150">{t('nav.shop')}</Link>
            <Link to="/inspiration" className="text-xs font-medium text-brand-grey-dark hover:text-brand-dark transition-colors duration-150">{t('nav.inspiration')}</Link>
            <Link to="/about" className="text-xs font-medium text-brand-grey-dark hover:text-brand-dark transition-colors duration-150">{t('nav.about')}</Link>
          </div>

          <div className="w-px h-4 bg-brand-grey hidden sm:block" />

          <div className="flex items-center gap-1.5">
            <LanguageToggle />
            <button onClick={toggle}
              className="w-7 h-7 rounded-full flex items-center justify-center text-brand-grey-dark hover:text-brand-dark hover:bg-brand-grey transition-colors ease-spring duration-150">
              {theme === 'light' ? <Moon size={13} weight="regular" /> : <Sun size={13} weight="regular" />}
            </button>
            {token ? (
              <Link to="/dashboard" className="btn-primary text-xs py-1.5 px-4">{t('common.dashboard')}</Link>
            ) : (
              <>
                <button onClick={() => setModal('login')} className="btn-ghost text-xs py-1.5 px-3 hidden sm:block">{t('common.signIn')}</button>
                <button onClick={() => setModal('signup')} className="btn-primary text-xs py-1.5 px-4">{t('common.getStarted')}</button>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile nav menu — revealed by the menu button that replaces the logo on phones */}
      {menuOpen && (
        <div className="md:hidden fixed top-20 inset-x-0 mx-auto z-50 w-[min(20rem,calc(100vw-1.5rem))] bg-surface-raised/95 backdrop-blur-2xl rounded-2xl border border-brand-grey shadow-float p-2 animate-slide-up">
          {NAV_LINKS.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-medium text-brand-dark hover:bg-brand-grey transition-colors"
            >
              {t(`nav.${l.key}`)}
            </Link>
          ))}
          <div className="border-t border-brand-grey my-1.5" />
          {token ? (
            <Link
              to="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2"
            >
              {t('common.myDashboard')} <ArrowRight size={13} weight="bold" />
            </Link>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => { setMenuOpen(false); setModal('login') }}
                className="btn-secondary flex-1 text-sm py-2.5"
              >
                {t('common.signIn')}
              </button>
              <button
                onClick={() => { setMenuOpen(false); setModal('signup') }}
                className="btn-primary flex-1 text-sm py-2.5"
              >
                {t('common.getStarted')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Hero — two-column split ── */}
      <section className="min-h-[100dvh] flex items-center px-8 md:px-16 pt-16 pb-10">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">

            {/* Left column — copy ── */}
            <div>
              <div data-reveal className="inline-flex items-center gap-2 bg-brand-brown/10 text-brand-brown text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                <span className="w-1.5 h-1.5 bg-brand-brown rounded-full animate-pulse" />
                {t('landing.badge')}
              </div>

              <h1 data-reveal data-delay="100"
                className="text-[2.5rem] sm:text-[3.5rem] lg:text-[4rem] font-bold text-brand-dark leading-[1.03] tracking-tighter mb-6">
                {t('landing.heroTitle1')}<br />
                <em className="font-display font-normal italic text-brand-brown">{t('landing.heroTitleEm')}</em><br />
                {t('landing.heroTitle3')}
              </h1>

              <p data-reveal data-delay="150"
                className="text-brand-grey-dark text-lg leading-relaxed mb-8 max-w-[42ch]"
                style={{ textWrap: 'pretty' }}>
                {t('landing.heroSubtitle')}
              </p>

              <div data-reveal data-delay="200" className="flex flex-col sm:flex-row gap-3 mb-8">
                {token ? (
                  <button onClick={() => navigate('/dashboard')}
                    className="btn-primary text-base px-8 py-3 flex items-center gap-2">
                    {t('common.continueDesigning')} <ArrowRight size={16} weight="bold" />
                  </button>
                ) : (
                  <>
                    <button onClick={() => setModal('signup')}
                      className="btn-primary text-base px-8 py-3 flex items-center gap-2">
                      {t('common.startDesigningFree')} <ArrowRight size={16} weight="bold" />
                    </button>
                    <button onClick={() => setModal('login')} className="btn-secondary text-base px-8 py-3">
                      {t('common.signIn')}
                    </button>
                  </>
                )}
              </div>

              <div data-reveal data-delay="250" className="flex flex-wrap items-center gap-5">
                {[t('landing.free'), t('landing.noCard'), t('landing.styles50')].map(label => (
                  <span key={label} className="flex items-center gap-1.5 text-xs text-brand-grey-dark">
                    <CheckCircle size={13} weight="fill" className="text-brand-brown flex-shrink-0" />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right column — interactive 3D canvas viewport */}
            <div data-reveal data-delay="100" 
              ref={wrapRef}
              className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] overflow-visible cursor-grab active:cursor-grabbing select-none"
            >
              <canvas 
                ref={canvasRef} 
                className="w-full h-full block" 
                aria-label="Interactive 3D preview of a furnished room — drag to rotate"
              />
              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-1.5 font-medium text-[10px] tracking-wider uppercase text-brand-dark/50 bg-white/60 backdrop-blur-md px-3 py-1 rounded-full border border-brand-dark/5 pointer-events-none transition-opacity duration-500 ${
                hintHidden ? 'opacity-0' : 'opacity-100'
              }`}>
                <ArrowsClockwise size={11} weight="bold" />
                {t('landing.dragHint')}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Features bento grid ── */}
      <section className="px-6 md:px-12 py-20 bg-surface-raised overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div data-reveal className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <p className="text-xs font-semibold text-brand-brown uppercase tracking-[0.15em]">
              {t('landing.whatsIncluded')}
            </p>
            <div className="flex items-center gap-5 text-[11px] text-brand-grey-dark font-medium">
              {[t('landing.styles50'), t('landing.realtime3d'), t('landing.aiPowered')].map((s, i) => (
                <span key={s} className="flex items-center gap-1.5">
                  {i !== 0 && <span className="w-1 h-1 rounded-full bg-brand-grey inline-block" />}
                  {s}
                </span>
              ))}
            </div>
          </div>

          <h2 data-reveal data-delay="100"
            className="text-3xl md:text-4xl font-bold text-brand-dark tracking-tighter mb-10"
            style={{ textWrap: 'balance' }}>
            {t('landing.everythingTitle')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Featured card — spans 2 cols and 2 rows */}
            <div data-reveal data-delay="150"
              className="md:col-span-2 md:row-span-2 p-1.5 rounded-[1.5rem] bg-brand-brown/5 border border-brand-brown/20 group hover:-translate-y-1 transition-transform ease-spring duration-300">
              <div className="h-full rounded-[calc(1.5rem-0.375rem)] bg-brand-grey-light p-8 flex flex-col justify-between min-h-[280px] overflow-hidden relative"
                style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8)' }}>

                {/* Animated room wireframe mockup */}
                <div className="absolute top-6 right-6 w-[160px] h-[110px] rounded-xl border border-brand-brown/20 bg-surface-raised/70 overflow-hidden backdrop-blur-sm hidden md:block">
                  <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'linear-gradient(rgba(200,149,90,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(200,149,90,0.4) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  <div className="absolute w-10 h-7 rounded bg-brand-brown/30 border border-brand-brown/40"
                    style={{ top: '28%', left: '18%', animation: 'pulse 3s ease-in-out infinite' }} />
                  <div className="absolute w-6 h-6 rounded bg-brand-brown/20 border border-brand-brown/30"
                    style={{ top: '45%', left: '55%', animation: 'pulse 3s ease-in-out 0.8s infinite' }} />
                  <div className="absolute w-14 h-4 rounded bg-brand-brown/25 border border-brand-brown/30"
                    style={{ top: '65%', left: '22%', animation: 'pulse 3s ease-in-out 1.6s infinite' }} />
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-2 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-semibold text-brand-dark">{t('landing.realtime3d')}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="mt-auto">
                  <div className="w-12 h-12 bg-brand-brown rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform ease-spring duration-300">
                    <House size={24} weight="fill" className="text-white" />
                  </div>
                  <h3 className="font-semibold text-brand-dark text-xl mb-2 tracking-tight">{t('landing.features.room3dLong.title')}</h3>
                  <p className="text-sm text-brand-grey-dark leading-relaxed max-w-[46ch]">
                    {t('landing.features.room3dLong.desc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Remaining 5 features auto-fill the grid */}
            {FEATURES.slice(1).map(({ Icon, key }, i) => (
              <div key={key} data-reveal data-delay={String((i + 2) * 100)}
                className="p-1.5 rounded-[1.25rem] bg-brand-dark/[0.03] border border-brand-grey group hover:-translate-y-1 transition-transform ease-spring duration-300">
                <div className="h-full rounded-[calc(1.25rem-0.375rem)] bg-surface-raised p-6 flex flex-col"
                  style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6)' }}>
                  <div className="w-9 h-9 bg-brand-brown/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-brand-brown group-hover:rotate-6 transition-all ease-spring duration-300">
                    <Icon size={18} weight="regular" className="text-brand-brown group-hover:text-white transition-colors ease-spring duration-300" />
                  </div>
                  <h3 className="font-semibold text-brand-dark text-sm mb-1.5 tracking-tight">{t(`landing.features.${key}.title`)}</h3>
                  <p className="text-xs text-brand-grey-dark leading-relaxed">{t(`landing.features.${key}.desc`)}</p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 md:px-12 py-24 bg-brand-grey-light">
        <div className="max-w-3xl mx-auto text-center">
          <p data-reveal className="text-xs font-semibold text-brand-brown uppercase tracking-[0.15em] mb-4">
            {t('landing.readyWhenYouAre')}
          </p>
          <h2 data-reveal data-delay="100"
            className="text-4xl md:text-5xl font-bold text-brand-dark tracking-tighter mb-6"
            style={{ textWrap: 'balance' }}>
            {t('landing.ctaTitle')}
          </h2>
          <p data-reveal data-delay="150" className="text-brand-grey-dark text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            {t('landing.ctaSubtitle')}
          </p>
          <div data-reveal data-delay="200">
            {token ? (
              <Link to="/dashboard" className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2">
                {t('common.openDashboard')} <ArrowRight size={16} weight="bold" />
              </Link>
            ) : (
              <button onClick={() => setModal('signup')}
                className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2">
                {t('common.startFree')} <ArrowRight size={16} weight="bold" />
              </button>
            )}
          </div>
        </div>
      </section>

      <MarketingFooter />

      {modal && <AuthModal initialMode={modal} onClose={() => setModal(null)} />}
    </div>
  )
}