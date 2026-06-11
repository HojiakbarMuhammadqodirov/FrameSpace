import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  House, Sparkle, ShoppingCart, PaintBrush, FloppyDisk, Ruler,
  Sun, Moon, ArrowRight, CheckCircle,
  TwitterLogo, InstagramLogo, YoutubeLogo, EnvelopeSimple,
} from '@phosphor-icons/react'
import AuthModal from '../components/auth/AuthModal'
import useStore from '../store/useStore'
import { useTheme } from '../hooks/useTheme'

const FEATURES = [
  {
    Icon: House,
    title: '3D room visualization',
    desc: 'See your room come to life with real-time 3D rendering, realistic lighting, and textured surfaces. Orbit, zoom, and inspect every detail before buying.',
  },
  {
    Icon: Sparkle,
    title: 'AI recommendations',
    desc: 'Get smart furniture suggestions based on your room size, style preference, lighting, and budget.',
  },
  {
    Icon: ShoppingCart,
    title: 'Shop the best deals',
    desc: 'Browse curated furniture from top stores with price comparisons and direct purchase links.',
  },
  {
    Icon: PaintBrush,
    title: 'Full customization',
    desc: 'Drag, rotate, and resize furniture. Customize colors, materials, and textures in real time.',
  },
  {
    Icon: FloppyDisk,
    title: 'Save and share',
    desc: 'Save multiple room designs, load them anytime, and share links with friends or designers.',
  },
  {
    Icon: Ruler,
    title: 'Precision room editor',
    desc: 'Set exact dimensions, add windows, doors, and customize wall colors, floor types, and more.',
  },
]

const NAV_LINKS = [
  { label: 'Shop All',      to: '/shop' },
  { label: 'Room Designer', to: '/dashboard' },
  { label: 'Collections',   to: '/collections' },
  { label: 'Inspiration',   to: '/inspiration' },
  { label: 'About',         to: '/about' },
  { label: 'Contact',       to: '/contact' },
]

export default function Landing() {
  const [modal, setModal] = useState<'login' | 'signup' | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const { token } = useStore()
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target) }
      }),
      { threshold: 0.1 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <div className="min-h-[100dvh] bg-brand-grey-light overflow-x-hidden">

      {/* ── Full-width transparent navbar — visible at top ── */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-[opacity,transform] duration-300 ${
        scrolled ? 'opacity-0 pointer-events-none -translate-y-1' : 'opacity-100'
      }`}>
        <div className="flex items-center justify-between px-10 md:px-16 py-5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-brand-brown rounded-lg flex items-center justify-center">
              <House size={15} weight="fill" className="text-white" />
            </div>
            <span className="font-bold text-brand-dark text-base tracking-tight">FrameSpace</span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(l => (
              <Link key={l.to} to={l.to}
                className="text-sm font-medium text-brand-dark/70 hover:text-brand-dark transition-colors duration-150">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <button onClick={toggle} title={theme === 'light' ? 'Dark mode' : 'Light mode'}
              className="w-8 h-8 rounded-full flex items-center justify-center text-brand-grey-dark hover:text-brand-dark hover:bg-brand-grey/60 transition-colors ease-spring duration-150">
              {theme === 'light' ? <Moon size={15} weight="regular" /> : <Sun size={15} weight="regular" />}
            </button>
            {token ? (
              <Link to="/dashboard" className="btn-primary text-sm py-2 px-5">My dashboard</Link>
            ) : (
              <>
                <button onClick={() => setModal('login')} className="btn-ghost text-sm py-2 px-4">Sign in</button>
                <button onClick={() => setModal('signup')} className="btn-primary text-sm py-2 px-5 flex items-center gap-1.5">
                  Get started <ArrowRight size={13} weight="bold" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Island navbar — appears on scroll ── */}
      <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-[opacity,transform] duration-300 ${
        scrolled ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}>
        <nav className="flex items-center gap-3 px-4 py-2.5 bg-surface-raised/90 backdrop-blur-2xl rounded-full border border-brand-grey shadow-float whitespace-nowrap">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-brown rounded-md flex items-center justify-center">
              <House size={13} weight="fill" className="text-white" />
            </div>
            <span className="font-semibold text-brand-dark text-sm tracking-tight">FrameSpace</span>
          </Link>

          <div className="w-px h-4 bg-brand-grey" />

          <div className="hidden sm:flex items-center gap-4">
            <Link to="/shop" className="text-xs font-medium text-brand-grey-dark hover:text-brand-dark transition-colors duration-150">Shop</Link>
            <Link to="/inspiration" className="text-xs font-medium text-brand-grey-dark hover:text-brand-dark transition-colors duration-150">Inspiration</Link>
            <Link to="/about" className="text-xs font-medium text-brand-grey-dark hover:text-brand-dark transition-colors duration-150">About</Link>
          </div>

          <div className="w-px h-4 bg-brand-grey hidden sm:block" />

          <div className="flex items-center gap-1.5">
            <button onClick={toggle}
              className="w-7 h-7 rounded-full flex items-center justify-center text-brand-grey-dark hover:text-brand-dark hover:bg-brand-grey transition-colors ease-spring duration-150">
              {theme === 'light' ? <Moon size={13} weight="regular" /> : <Sun size={13} weight="regular" />}
            </button>
            {token ? (
              <Link to="/dashboard" className="btn-primary text-xs py-1.5 px-4">Dashboard</Link>
            ) : (
              <>
                <button onClick={() => setModal('login')} className="btn-ghost text-xs py-1.5 px-3">Sign in</button>
                <button onClick={() => setModal('signup')} className="btn-primary text-xs py-1.5 px-4">Get started</button>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* ── Hero — two-column split ── */}
      <section className="min-h-[100dvh] flex items-center px-8 md:px-16 pt-16 pb-10">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">

            {/* Left — text */}
            <div>
              <div data-reveal className="inline-flex items-center gap-2 bg-brand-brown/10 text-brand-brown text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                <span className="w-1.5 h-1.5 bg-brand-brown rounded-full animate-pulse" />
                AI-powered room design
              </div>

              <h1 data-reveal data-delay="100"
                className="text-[3rem] sm:text-[3.5rem] lg:text-[4rem] font-bold text-brand-dark leading-[1.03] tracking-tighter mb-6">
                Design your<br />
                perfect room<br />
                in <span className="text-brand-brown">3D</span>
              </h1>

              <p data-reveal data-delay="150"
                className="text-brand-grey-dark text-lg leading-relaxed mb-8 max-w-[42ch]"
                style={{ textWrap: 'pretty' } as React.CSSProperties}>
                Visualize your dream space with real-time 3D rendering, get AI-powered furniture recommendations, and shop curated deals — all in one place.
              </p>

              <div data-reveal data-delay="200" className="flex flex-col sm:flex-row gap-3 mb-8">
                {token ? (
                  <button onClick={() => navigate('/dashboard')}
                    className="btn-primary text-base px-8 py-3 flex items-center gap-2">
                    Continue designing <ArrowRight size={16} weight="bold" />
                  </button>
                ) : (
                  <>
                    <button onClick={() => setModal('signup')}
                      className="btn-primary text-base px-8 py-3 flex items-center gap-2">
                      Start designing free <ArrowRight size={16} weight="bold" />
                    </button>
                    <button onClick={() => setModal('login')} className="btn-secondary text-base px-8 py-3">
                      Sign in
                    </button>
                  </>
                )}
              </div>

              <div data-reveal data-delay="250" className="flex flex-wrap items-center gap-5">
                {['Free to start', 'No credit card required', '50+ furniture styles'].map(label => (
                  <span key={label} className="flex items-center gap-1.5 text-xs text-brand-grey-dark">
                    <CheckCircle size={13} weight="fill" className="text-brand-brown flex-shrink-0" />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — looping video with edge fade */}
            <div data-reveal data-delay="100" className="relative h-[360px] sm:h-[460px] lg:h-[560px] rounded-3xl overflow-hidden">
              {/* side-edge fade masks */}
              <div className="absolute inset-y-0 left-0 w-20 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to right, #f7f4f0, transparent)' }} />
              <div className="absolute inset-y-0 right-0 w-20 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to left, #f7f4f0, transparent)' }} />
              <video
                src="/furniture/Chair.webm"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features bento grid ── */}
      <section className="px-6 md:px-12 py-20 bg-surface-raised overflow-hidden">
        <div className="max-w-5xl mx-auto">
          {/* Eyebrow + stat strip */}
          <div data-reveal className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <p className="text-xs font-semibold text-brand-brown uppercase tracking-[0.15em]">
              What's included
            </p>
            <div className="flex items-center gap-5 text-[11px] text-brand-grey-dark font-medium">
              {['50+ furniture styles', 'Real-time 3D', 'AI-powered'].map((s, i) => (
                <span key={s} className="flex items-center gap-1.5">
                  {i !== 0 && <span className="w-1 h-1 rounded-full bg-brand-grey inline-block" />}
                  {s}
                </span>
              ))}
            </div>
          </div>

          <h2 data-reveal data-delay="100"
            className="text-3xl md:text-4xl font-bold text-brand-dark tracking-tighter mb-10"
            style={{ textWrap: 'balance' } as React.CSSProperties}>
            Everything you need to design
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Hero card — spans 2 cols with animated 3D viewport mockup */}
            <div data-reveal data-delay="150"
              className="md:col-span-2 md:row-span-2 p-1.5 rounded-[1.5rem] bg-brand-brown/5 border border-brand-brown/20 group hover:-translate-y-1 transition-transform ease-spring duration-300">
              <div className="h-full rounded-[calc(1.5rem-0.375rem)] bg-brand-grey-light p-8 flex flex-col justify-between min-h-[280px] overflow-hidden relative"
                style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8)' }}>

                {/* Animated room wireframe mockup */}
                <div className="absolute top-6 right-6 w-[160px] h-[110px] rounded-xl border border-brand-brown/20 bg-surface-raised/70 overflow-hidden backdrop-blur-sm">
                  <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'linear-gradient(rgba(200,149,90,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(200,149,90,0.4) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  {/* Animated furniture blocks */}
                  <div className="absolute w-10 h-7 rounded bg-brand-brown/30 border border-brand-brown/40"
                    style={{ top: '28%', left: '18%', animation: 'pulse 3s ease-in-out infinite' }} />
                  <div className="absolute w-6 h-6 rounded bg-brand-brown/20 border border-brand-brown/30"
                    style={{ top: '45%', left: '55%', animation: 'pulse 3s ease-in-out 0.8s infinite' }} />
                  <div className="absolute w-14 h-4 rounded bg-brand-brown/25 border border-brand-brown/30"
                    style={{ top: '65%', left: '22%', animation: 'pulse 3s ease-in-out 1.6s infinite' }} />
                  {/* Live badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-2 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-semibold text-brand-dark">Live preview</span>
                  </div>
                </div>

                {/* Content */}
                <div className="mt-auto">
                  <div className="w-12 h-12 bg-brand-brown rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform ease-spring duration-300">
                    <House size={24} weight="fill" className="text-white" />
                  </div>
                  <h3 className="font-semibold text-brand-dark text-xl mb-2 tracking-tight">3D room visualization</h3>
                  <p className="text-sm text-brand-grey-dark leading-relaxed max-w-[46ch]">
                    See your room come to life with real-time 3D rendering, realistic lighting, and textured surfaces. Orbit, zoom, and inspect every detail before buying a single piece.
                  </p>
                </div>
              </div>
            </div>

            {FEATURES.slice(1, 4).map(({ Icon, title, desc }, i) => (
              <div key={title} data-reveal data-delay={String((i + 2) * 100)}
                className="p-1.5 rounded-[1.25rem] bg-brand-dark/[0.03] border border-brand-grey group hover:-translate-y-1 transition-transform ease-spring duration-300">
                <div className="h-full rounded-[calc(1.25rem-0.375rem)] bg-surface-raised p-6 flex flex-col"
                  style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6)' }}>
                  <div className="w-9 h-9 bg-brand-brown/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-brand-brown group-hover:rotate-6 transition-all ease-spring duration-300">
                    <Icon size={18} weight="regular" className="text-brand-brown group-hover:text-white transition-colors ease-spring duration-300" />
                  </div>
                  <h3 className="font-semibold text-brand-dark text-sm mb-1.5 tracking-tight">{title}</h3>
                  <p className="text-xs text-brand-grey-dark leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {FEATURES.slice(4).map(({ Icon, title, desc }, i) => (
              <div key={title} data-reveal data-delay={String(i * 100)}
                className="p-1.5 rounded-[1.25rem] bg-brand-dark/[0.03] border border-brand-grey group hover:-translate-y-1 transition-transform ease-spring duration-300">
                <div className="h-full rounded-[calc(1.25rem-0.375rem)] bg-surface-raised p-6 flex flex-col"
                  style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6)' }}>
                  <div className="w-9 h-9 bg-brand-brown/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-brand-brown group-hover:rotate-6 transition-all ease-spring duration-300">
                    <Icon size={18} weight="regular" className="text-brand-brown group-hover:text-white transition-colors ease-spring duration-300" />
                  </div>
                  <h3 className="font-semibold text-brand-dark text-sm mb-1.5 tracking-tight">{title}</h3>
                  <p className="text-xs text-brand-grey-dark leading-relaxed">{desc}</p>
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
            Ready when you are
          </p>
          <h2 data-reveal data-delay="100"
            className="text-4xl md:text-5xl font-bold text-brand-dark tracking-tighter mb-6"
            style={{ textWrap: 'balance' } as React.CSSProperties}>
            Design your dream room today
          </h2>
          <p data-reveal data-delay="150" className="text-brand-grey-dark text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            Join thousands of designers and homeowners who use FrameSpace to bring their vision to life.
          </p>
          <div data-reveal data-delay="200">
            {token ? (
              <Link to="/dashboard" className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2">
                Open my dashboard <ArrowRight size={16} weight="bold" />
              </Link>
            ) : (
              <button onClick={() => setModal('signup')}
                className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2">
                Start for free <ArrowRight size={16} weight="bold" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-brand-dark text-white">
        {/* Main footer body */}
        <div className="px-8 md:px-16 pt-16 pb-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

            {/* Brand column */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-brand-brown rounded-xl flex items-center justify-center">
                  <House size={17} weight="fill" className="text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight">FrameSpace</span>
              </div>
              <p className="text-sm text-white/55 leading-relaxed mb-6 max-w-[22ch]">
                The smartest way to design your perfect room — in full 3D.
              </p>
              <div className="flex gap-3">
                {[
                  { Icon: TwitterLogo,   href: '#' },
                  { Icon: InstagramLogo, href: '#' },
                  { Icon: YoutubeLogo,   href: '#' },
                  { Icon: EnvelopeSimple, href: '/contact' },
                ].map(({ Icon, href }, i) => (
                  <Link key={i} to={href}
                    className="w-8 h-8 rounded-lg bg-white/8 hover:bg-brand-brown transition-colors ease-spring duration-150 flex items-center justify-center text-white/60 hover:text-white">
                    <Icon size={15} weight="regular" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-white/40 mb-4">Product</p>
              <ul className="space-y-2.5">
                {[
                  { label: 'Room Designer', to: '/dashboard' },
                  { label: 'Shop All Furniture', to: '/shop' },
                  { label: 'Collections', to: '/collections' },
                  { label: 'AI Recommendations', to: '/dashboard' },
                  { label: 'Share & Export', to: '/dashboard' },
                ].map(l => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-white/55 hover:text-white transition-colors duration-150">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-white/40 mb-4">Company</p>
              <ul className="space-y-2.5">
                {[
                  { label: 'About',       to: '/about' },
                  { label: 'Inspiration', to: '/inspiration' },
                  { label: 'Contact',     to: '/contact' },
                  { label: 'Gallery',     to: '/gallery' },
                ].map(l => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-white/55 hover:text-white transition-colors duration-150">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-white/40 mb-4">Stay in the loop</p>
              <p className="text-sm text-white/55 leading-relaxed mb-4">
                Design tips, new arrivals, and inspiration — in your inbox.
              </p>
              <form onSubmit={e => e.preventDefault()} className="flex gap-2">
                <input
                  type="email"
                  placeholder="you@email.com"
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-brand-brown transition-colors"
                />
                <button type="submit"
                  className="px-3 py-2 rounded-lg bg-brand-brown hover:bg-brand-brown-dark transition-colors ease-spring duration-150 flex-shrink-0">
                  <ArrowRight size={14} weight="bold" className="text-white" />
                </button>
              </form>
              <p className="text-[10px] text-white/30 mt-2">No spam. Unsubscribe anytime.</p>
            </div>
          </div>
        </div>

        {/* Footer bottom bar */}
        <div className="border-t border-white/10 px-8 md:px-16 py-5">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-white/35">© 2025 FrameSpace. Design your perfect space.</p>
            <div className="flex items-center gap-5">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
                <Link key={l} to="#" className="text-[11px] text-white/35 hover:text-white/70 transition-colors duration-150">
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {modal && <AuthModal initialMode={modal} onClose={() => setModal(null)} />}
    </div>
  )
}
