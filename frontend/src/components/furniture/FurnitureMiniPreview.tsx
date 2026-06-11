import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { createFurnitureMesh, disposeMesh } from '../../hooks/furnitureBuilder'
import type { FurnitureItem, PlacedFurniture } from '../../types'

interface Props {
  item: FurnitureItem
  color: string
  size?: number
}

export default function FurnitureMiniPreview({ item, color, size = 220 }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const pf: PlacedFurniture = {
      furnitureId: item._id,
      name: item.name,
      position: { x: 0, y: 0, z: 0 },
      rotation: 0, scale: 1,
      color,
      material: item.materials[0] || 'fabric',
      furnitureData: item,
    }

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf5f2ee)

    const w = item.dimensions.width  / 100
    const d = item.dimensions.depth  / 100
    const h = item.dimensions.height / 100
    const span = Math.max(w, d, h)
    const dist = span * 2.0 + 0.4

    const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 30)
    camera.position.set(dist * 0.72, dist * 0.58 + 0.2, dist * 0.88)
    camera.lookAt(0, h / 2, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(size, size)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.25
    mount.appendChild(renderer.domElement)

    // Environment for PBR
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()

    // Lights
    scene.add(new THREE.AmbientLight(0xfff8f0, 0.6))
    const key = new THREE.DirectionalLight(0xfffde7, 2.8)
    key.position.set(4, 7, 5)
    key.castShadow = true
    key.shadow.mapSize.set(512, 512)
    key.shadow.bias = -0.002
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xc8d8ff, 0.7)
    fill.position.set(-3, 3, -2)
    scene.add(fill)
    scene.add(new THREE.HemisphereLight(0xfff4e0, 0x8B7355, 0.5))

    // Shadow floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.ShadowMaterial({ opacity: 0.14, transparent: true })
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.002
    floor.receiveShadow = true
    scene.add(floor)

    // Furniture
    const group = createFurnitureMesh(pf)
    group.traverse(c => {
      if ((c as THREE.Mesh).isMesh) { c.castShadow = true; c.receiveShadow = true }
    })
    scene.add(group)

    let raf: number
    let t = 0
    const animate = () => {
      raf = requestAnimationFrame(animate)
      t += 0.007
      group.rotation.y = t
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      disposeMesh(group)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [item._id, color, size])

  return (
    <div
      ref={mountRef}
      style={{ width: size, height: size }}
      className="rounded-xl overflow-hidden"
    />
  )
}
