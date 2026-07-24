import { Link } from 'react-router-dom'
import { ArrowRight, Quotes } from '@phosphor-icons/react'
import MarketingNav from '../components/common/MarketingNav'
import MarketingFooter from '../components/common/MarketingFooter'
import RoomVignette, { type VignettePalette, type VignetteVariant } from '../components/common/RoomVignette'
import { useReveal } from '../hooks/useReveal'
import { useLang } from '../i18n/LanguageProvider'

interface Room {
  key: string
  designer: string
  variant: VignetteVariant
  palette: VignettePalette
  /** vignette height class — varies for the masonry rhythm */
  h: string
}

const ROOMS: Room[] = [
  { key: 'r1', designer: 'Amara Osei',        variant: 'sofa',   h: 'h-64', palette: ['#F2EDE4', '#CBB59A', '#3E3B37', '#97764E', '#E8D9B8'] },
  { key: 'r2', designer: 'Jonas Lindqvist',   variant: 'bed',    h: 'h-48', palette: ['#EFEAE2', '#D9C4A3', '#8C9BAA', '#5E7A8C', '#EFD9A8'] },
  { key: 'r3', designer: 'Priya Raghunathan', variant: 'desk',   h: 'h-56', palette: ['#E9E2D6', '#7A5C40', '#3A3733', '#A85F32', '#E0B36A'] },
  { key: 'r4', designer: 'Tomás Herrera',     variant: 'dining', h: 'h-64', palette: ['#F1E7D8', '#9C6B3F', '#4E4238', '#7E4E2E', '#EBC584'] },
  { key: 'r5', designer: 'Mina Kovács',       variant: 'sofa',   h: 'h-48', palette: ['#EDEDE9', '#C8C2B8', '#54514C', '#7E9BA6', '#E4D6BC'] },
  { key: 'r6', designer: 'Leila Benhaddou',   variant: 'bed',    h: 'h-56', palette: ['#F4EDE0', '#D9B98C', '#5E7A4A', '#C1652E', '#F0D490'] },
]

function RoomCard({ r, index }: { r: Room; index: number }) {
  const { t } = useLang()
  const tags = t(`inspiration.rooms.${r.key}.tags`).split(',')
  return (
    <Link
      to="/gallery"
      data-reveal
      data-delay={String(Math.min((index % 3) * 100 + 100, 300))}
      className="group block break-inside-avoid mb-5 p-1.5 rounded-[1.5rem] bg-brand-dark/[0.03] border border-brand-grey
        hover:border-brand-brown/40 hover:-translate-y-1 transition-[transform,border-color] ease-spring duration-300"
    >
      <div className="rounded-[calc(1.5rem-0.375rem)] overflow-hidden bg-surface-raised"
        style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6)' }}>
        <div className={`relative overflow-hidden ${r.h}`}>
          <div className="absolute inset-0 transition-transform ease-spring duration-500 group-hover:scale-[1.04]">
            <RoomVignette palette={r.palette} variant={r.variant} />
          </div>
        </div>
        <div className="p-5">
          <p className="font-semibold text-sm text-brand-dark tracking-tight group-hover:text-brand-brown transition-colors duration-200">
            {t(`inspiration.rooms.${r.key}.label`)}
          </p>
          <p className="text-xs text-brand-grey-dark mt-1">{t('inspiration.by')} {r.designer}</p>
          <div className="flex gap-1.5 mt-3">
            {tags.map(tag => (
              <span key={tag} className="text-[10px] font-medium uppercase tracking-[0.08em] text-brand-brown bg-brand-brown/10 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function Inspiration() {
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
              {t('inspiration.eyebrow')}
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
              <h1 data-reveal data-delay="100"
                className="lg:col-span-7 text-4xl sm:text-5xl md:text-6xl font-bold text-brand-dark tracking-tighter leading-[1.02]"
                style={{ textWrap: 'balance' }}>
                {t('inspiration.title1')}{' '}
                <em className="font-display font-normal italic text-brand-brown">{t('inspiration.titleEm')}</em>
              </h1>
              <p data-reveal data-delay="200"
                className="lg:col-span-5 text-brand-grey-dark text-base leading-relaxed self-end">
                {t('inspiration.intro')}
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 md:px-12 pb-16">
          <div className="max-w-6xl mx-auto columns-1 sm:columns-2 lg:columns-3 gap-5">
            {ROOMS.slice(0, 3).map((r, i) => <RoomCard key={r.key} r={r} index={i} />)}

            {/* Pull-quote — breaks the grid rhythm */}
            <div data-reveal data-delay="200"
              className="break-inside-avoid mb-5 p-1.5 rounded-[1.5rem] bg-brand-brown/10 border border-brand-brown/20">
              <div className="rounded-[calc(1.5rem-0.375rem)] bg-brand-dark dark:bg-[#1e1b17] p-7"
                style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08)' }}>
                <Quotes size={24} weight="fill" className="text-brand-orange mb-4" />
                <p className="font-display italic text-xl text-white leading-snug mb-4">
                  {t('inspiration.quote')}
                </p>
                <p className="text-xs text-white/50">{t('inspiration.quoteAuthor')}</p>
              </div>
            </div>

            {ROOMS.slice(3).map((r, i) => <RoomCard key={r.key} r={r} index={i + 3} />)}
          </div>
        </section>

        <section className="px-6 md:px-12 pb-24 md:pb-32">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-t border-brand-grey pt-10">
            <div data-reveal>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-dark tracking-tighter mb-1">
                {t('inspiration.galleryTitle')}
              </h2>
              <p className="text-sm text-brand-grey-dark">{t('inspiration.gallerySub')}</p>
            </div>
            <Link data-reveal data-delay="100" to="/gallery"
              className="btn-primary text-sm py-3 pl-6 pr-2 inline-flex items-center gap-3 group flex-shrink-0">
              {t('inspiration.browseGallery')}
              <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center transition-transform ease-spring duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-px">
                <ArrowRight size={13} weight="bold" />
              </span>
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}
