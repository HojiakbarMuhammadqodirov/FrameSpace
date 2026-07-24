import { Link } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'
import MarketingNav from '../components/common/MarketingNav'
import MarketingFooter from '../components/common/MarketingFooter'
import RoomVignette, { type VignettePalette } from '../components/common/RoomVignette'
import { useReveal } from '../hooks/useReveal'
import { useLang } from '../i18n/LanguageProvider'

interface Collection {
  key: string
  /** [wall, floor, sofa, accent, lamp] */
  palette: VignettePalette
  featured?: boolean
}

const COLLECTIONS: Collection[] = [
  { key: 'scandinavian', palette: ['#EFEAE2', '#D9C4A3', '#B9B2A6', '#8FA98F', '#E8D9B8'], featured: true },
  { key: 'industrial',   palette: ['#4A443E', '#6E5B44', '#33302C', '#A85F32', '#E0A054'] },
  { key: 'coastal',      palette: ['#EAF0EF', '#D8C6A5', '#7E9BA6', '#4A7086', '#F0E3C0'] },
  { key: 'japandi',      palette: ['#EDE6DA', '#B08D5F', '#57504A', '#7A6A52', '#E6C990'] },
  { key: 'minimalist',   palette: ['#F2F0ED', '#C8C2B8', '#3E3B37', '#97764E', '#DED6C8'], featured: true },
  { key: 'terracotta',   palette: ['#F3E4D3', '#C1652E', '#8A4A2A', '#5E7A4A', '#EFC98A'] },
]

function CollectionCard({ c, delay }: { c: Collection; delay: number }) {
  const { t } = useLang()
  return (
    <Link
      to="/dashboard"
      data-reveal
      data-delay={String(delay)}
      className={`group block p-1.5 rounded-[1.5rem] bg-brand-dark/[0.03] border border-brand-grey
        hover:border-brand-brown/40 hover:-translate-y-1 transition-[transform,border-color] ease-spring duration-300
        ${c.featured ? 'md:col-span-2' : ''}`}
    >
      <div className="rounded-[calc(1.5rem-0.375rem)] overflow-hidden bg-surface-raised h-full flex flex-col"
        style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6)' }}>
        <div className={`relative overflow-hidden ${c.featured ? 'h-52 md:h-64' : 'h-52'}`}>
          <div className="absolute inset-0 transition-transform ease-spring duration-500 group-hover:scale-[1.04]">
            <RoomVignette palette={c.palette} />
          </div>
        </div>

        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-semibold text-brand-dark text-base tracking-tight group-hover:text-brand-brown transition-colors duration-200">
              {t(`collections.items.${c.key}.name`)}
            </h3>
            {/* palette swatches */}
            <div className="flex -space-x-1 flex-shrink-0 pt-0.5">
              {c.palette.map((hex, i) => (
                <span key={i} className="w-4 h-4 rounded-full border-2 border-surface-raised" style={{ background: hex }} />
              ))}
            </div>
          </div>
          <p className="text-sm text-brand-grey-dark leading-relaxed mb-4">{t(`collections.items.${c.key}.desc`)}</p>
          <div className="mt-auto flex items-center justify-between">
            <p className="text-[11px] text-brand-grey-dark">{t(`collections.items.${c.key}.materials`)}</p>
            <span className="flex items-center gap-1 text-xs font-medium text-brand-brown opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform] ease-spring duration-300">
              {t('collections.designWithIt')} <ArrowRight size={12} weight="bold" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function Collections() {
  useReveal()
  const { t } = useLang()

  return (
    <div className="min-h-[100dvh] bg-brand-grey-light">
      <div className="grain-overlay" aria-hidden="true" />
      <MarketingNav />

      <main id="main-content">
        <section className="px-6 md:px-12 pt-36 pb-16">
          <div className="max-w-6xl mx-auto">
            <p data-reveal className="text-xs font-semibold text-brand-brown uppercase tracking-[0.2em] mb-6">
              {t('collections.eyebrow')}
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
              <h1 data-reveal data-delay="100"
                className="lg:col-span-7 text-4xl sm:text-5xl md:text-6xl font-bold text-brand-dark tracking-tighter leading-[1.02]"
                style={{ textWrap: 'balance' }}>
                {t('collections.title1')}{' '}
                <em className="font-display font-normal italic text-brand-brown">{t('collections.titleEm')}</em>
              </h1>
              <p data-reveal data-delay="200"
                className="lg:col-span-5 text-brand-grey-dark text-base leading-relaxed self-end">
                {t('collections.intro')}
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 md:px-12 pb-24 md:pb-32">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
            {COLLECTIONS.map((c, i) => (
              <CollectionCard key={c.key} c={c} delay={Math.min((i % 3) * 100 + 100, 300)} />
            ))}
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}
