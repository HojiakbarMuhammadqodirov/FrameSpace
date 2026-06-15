import { Link } from 'react-router-dom'
import { House, ArrowLeft, Sparkle, Users, Globe } from '@phosphor-icons/react'

const STATS = [
  { label: 'Rooms designed', value: '500+' },
  { label: 'Furniture pieces',  value: '100+' },
  { label: 'Countries',         value: '5+' },
  { label: 'Happy designers',   value: '1000+' },
]

export default function About() {
  return (
    <div className="min-h-[100dvh] bg-brand-grey-light flex flex-col">
      <header className="flex justify-center pt-6 px-6">
        <div className="flex items-center gap-4 px-5 py-3 bg-surface-raised/90 backdrop-blur-2xl rounded-full border border-brand-grey shadow-float">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-brown rounded-md flex items-center justify-center">
              <House size={13} weight="fill" className="text-white" />
            </div>
            <span className="font-semibold text-brand-dark text-sm tracking-tight">FrameSpace</span>
          </Link>
          <div className="w-px h-4 bg-brand-grey" />
          <Link to="/" className="flex items-center gap-1.5 text-xs text-brand-grey-dark hover:text-brand-dark transition-colors">
            <ArrowLeft size={12} weight="bold" /> Back home
          </Link>
        </div>
      </header>

      <main className="flex-1 px-8 md:px-16 py-16 max-w-3xl mx-auto w-full">
        <div className="mb-12">
          <span className="text-xs font-semibold text-brand-brown uppercase tracking-[0.15em]">Our story</span>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-dark tracking-tighter mt-2 mb-4">
            We believe your home should feel like <span className="text-brand-brown">you</span>
          </h1>
          <p className="text-brand-grey-dark text-base leading-relaxed">
            FrameSpace started with a simple problem: visualizing furniture in a room before buying it is hard. We built a tool that makes it easy, beautiful, and even fun — combining real-time 3D rendering with AI-powered recommendations.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {STATS.map(s => (
            <div key={s.label} className="bg-surface-raised rounded-2xl border border-brand-grey p-5 text-center">
              <p className="text-2xl font-bold text-brand-dark tracking-tighter">{s.value}</p>
              <p className="text-xs text-brand-grey-dark mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {[
            { Icon: Sparkle, title: 'AI at the core', desc: 'Our recommendation engine scores furniture against your room dimensions, lighting, style, and budget to find the perfect match.' },
            { Icon: Users,   title: 'Built for everyone', desc: 'Whether you\'re a first-time renter or a professional designer, FrameSpace scales from a single bedroom to a full commercial project.' },
            { Icon: Globe,   title: 'Globally sourced', desc: 'We partner with furniture retailers worldwide to bring you competitive prices and real-time stock availability.' },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-5 bg-surface-raised rounded-2xl border border-brand-grey">
              <div className="w-9 h-9 bg-brand-brown/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon size={18} weight="regular" className="text-brand-brown" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-dark text-sm mb-1">{title}</h3>
                <p className="text-xs text-brand-grey-dark leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
