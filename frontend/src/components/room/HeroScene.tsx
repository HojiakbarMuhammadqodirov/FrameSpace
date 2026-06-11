import { useState, useEffect, useRef } from 'react'

const ITEMS = [
  {
    url: '/furniture/furniture-sofa.png',
    label: 'Luxury Boucle Sofa',
    price: '$1,299',
    tag: 'Best seller',
    glow: 'rgba(212,190,160,0.18)',
  },
  {
    url: '/furniture/furniture-table.png',
    label: 'Walnut Coffee Table',
    price: '$549',
    tag: 'New arrival',
    glow: 'rgba(180,140,90,0.15)',
  },
  {
    url: '/furniture/furniture-chair.png',
    label: 'Sage Velvet Chair',
    price: '$449',
    tag: 'Popular',
    glow: 'rgba(100,140,110,0.13)',
  },
]

export default function HeroScene() {
  const [active, setActive] = useState(0)
  const [fading, setFading] = useState(false)
  const scrollRef = useRef(0)
  const imgRef    = useRef<HTMLDivElement>(null)
  const rafRef    = useRef(0)

  // Auto-cycle every 4 s
  useEffect(() => {
    const id = setInterval(() => switchTo((active + 1) % ITEMS.length), 4200)
    return () => clearInterval(id)
  }, [active])

  // Scroll parallax + float via rAF
  useEffect(() => {
    const onScroll = () => { scrollRef.current = window.scrollY }
    window.addEventListener('scroll', onScroll, { passive: true })

    let t = 0
    const tick = () => {
      t += 0.014
      const floatY  = Math.sin(t) * 10 + Math.sin(t * 1.6) * 4
      const parallax = scrollRef.current * -0.1
      if (imgRef.current) {
        imgRef.current.style.transform = `translateY(${floatY + parallax}px)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  function switchTo(idx: number) {
    if (idx === active) return
    setFading(true)
    setTimeout(() => { setActive(idx); setFading(false) }, 320)
  }

  const item = ITEMS[active]

  return (
    <div className="w-full h-full flex flex-col items-center justify-center select-none">
      {/* Radial glow behind furniture */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{ background: `radial-gradient(ellipse 70% 60% at 55% 55%, ${item.glow} 0%, transparent 70%)` }}
      />

      {/* Furniture image — transparent PNG over solid site background */}
      <div ref={imgRef} className="relative w-full flex-1 flex items-center justify-center">
        <img
          key={active}
          src={item.url}
          alt={item.label}
          className="w-full max-h-full object-contain relative z-10"
          style={{
            opacity: fading ? 0 : 1,
            transform: fading ? 'scale(0.97)' : 'scale(1)',
            transition: 'opacity 0.32s ease, transform 0.32s ease',
          }}
          draggable={false}
        />
      </div>

      {/* Dot navigator */}
      <div className="flex items-center gap-2 mt-4 flex-shrink-0">
        {ITEMS.map((_, i) => (
          <button
            key={i}
            onClick={() => switchTo(i)}
            aria-label={`View ${ITEMS[i].label}`}
            className="transition-all duration-300 ease-spring rounded-full bg-brand-grey hover:bg-brand-brown"
            style={{
              width:  i === active ? 20 : 7,
              height: 7,
              background: i === active ? 'var(--color-brand-brown, #C8955A)' : undefined,
            }}
          />
        ))}
      </div>
    </div>
  )
}
