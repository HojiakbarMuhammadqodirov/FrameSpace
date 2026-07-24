import { Link } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'
import MarketingNav from '../components/common/MarketingNav'
import MarketingFooter from '../components/common/MarketingFooter'
import { useReveal } from '../hooks/useReveal'
import { useLang } from '../i18n/LanguageProvider'

const STATS = [
  { value: '2,418', key: 'rooms' },
  { value: '137',   key: 'pieces' },
  { value: '12',    key: 'countries' },
  { value: '94.6%', key: 'recommend' },
]

const PRINCIPLES = [{ n: '01', key: 'p1' }, { n: '02', key: 'p2' }, { n: '03', key: 'p3' }]
const MILESTONES = [{ key: 'm1' }, { key: 'm2' }, { key: 'm3' }]

export default function About() {
  useReveal()
  const { t } = useLang()

  return (
    <div className="min-h-[100dvh] bg-brand-grey-light">
      <div className="grain-overlay" aria-hidden="true" />
      <MarketingNav />

      <main id="main-content">
        {/* ── Hero — asymmetric editorial split ── */}
        <section className="px-6 md:px-12 pt-36 pb-24 md:pb-32">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-7">
              <p data-reveal className="text-xs font-semibold text-brand-brown uppercase tracking-[0.2em] mb-6">
                {t('about.eyebrow')}
              </p>
              <h1 data-reveal data-delay="100"
                className="text-4xl sm:text-5xl md:text-6xl font-bold text-brand-dark tracking-tighter leading-[1.02]"
                style={{ textWrap: 'balance' }}>
                {t('about.title1')}{' '}
                <em className="font-display font-normal italic text-brand-brown">{t('about.titleEm')}</em>
              </h1>
            </div>
            <div className="lg:col-span-5 flex flex-col justify-end">
              <p data-reveal data-delay="200" className="text-brand-grey-dark text-base leading-relaxed">
                {t('about.intro')}
              </p>
            </div>
          </div>
        </section>

        {/* ── Stats — hairline-separated, no boxes ── */}
        <section className="px-6 md:px-12 pb-24 md:pb-32">
          <div className="max-w-6xl mx-auto">
            <div data-reveal className="grid grid-cols-2 md:grid-cols-4 border-t border-brand-grey">
              {STATS.map(s => (
                <div key={s.key} className="pt-6 pb-2 pr-6 border-brand-grey [&:not(:first-child)]:md:border-l [&:not(:first-child)]:md:pl-6">
                  <p className="text-3xl md:text-4xl font-bold text-brand-dark tracking-tighter font-mono tabular-nums">
                    {s.value}
                  </p>
                  <p className="text-xs text-brand-grey-dark mt-2 leading-snug">{t(`about.stats.${s.key}`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Principles — numbered editorial list ── */}
        <section className="px-6 md:px-12 py-24 md:py-32 bg-surface-raised">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
              <div className="lg:col-span-4">
                <p data-reveal className="text-xs font-semibold text-brand-brown uppercase tracking-[0.2em] mb-4">
                  {t('about.believeEyebrow')}
                </p>
                <h2 data-reveal data-delay="100"
                  className="text-3xl md:text-4xl font-bold text-brand-dark tracking-tighter"
                  style={{ textWrap: 'balance' }}>
                  {t('about.believeTitle1')}{' '}
                  <em className="font-display font-normal italic text-brand-brown">{t('about.believeTitleEm')}</em>
                </h2>
              </div>
              <div className="lg:col-span-8">
                {PRINCIPLES.map((p, i) => (
                  <div key={p.n} data-reveal data-delay={String((i + 1) * 100)}
                    className="grid grid-cols-[3rem_1fr] sm:grid-cols-[5rem_1fr] gap-4 sm:gap-8 py-8 border-t border-brand-grey first:border-t-0 first:pt-0 last:pb-0">
                    <span className="font-display italic text-2xl sm:text-3xl text-brand-brown/60 leading-none pt-1">
                      {p.n}
                    </span>
                    <div>
                      <h3 className="font-semibold text-brand-dark text-lg tracking-tight mb-2">{t(`about.principles.${p.key}.title`)}</h3>
                      <p className="text-sm text-brand-grey-dark leading-relaxed max-w-[58ch]">{t(`about.principles.${p.key}.desc`)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Timeline ── */}
        <section className="px-6 md:px-12 py-24 md:py-32">
          <div className="max-w-3xl mx-auto">
            <p data-reveal className="text-xs font-semibold text-brand-brown uppercase tracking-[0.2em] mb-4">
              {t('about.historyEyebrow')}
            </p>
            <h2 data-reveal data-delay="100" className="text-3xl md:text-4xl font-bold text-brand-dark tracking-tighter mb-12">
              {t('about.historyTitle')}
            </h2>
            <div className="border-l border-brand-grey">
              {MILESTONES.map((m, i) => (
                <div key={m.key} data-reveal data-delay={String((i + 1) * 100)}
                  className="relative pl-8 pb-10 last:pb-0">
                  <span className="absolute -left-[5px] top-1.5 w-[9px] h-[9px] rounded-full bg-brand-brown" />
                  <p className="text-xs font-mono text-brand-grey-dark mb-1.5">{t(`about.milestones.${m.key}.date`)}</p>
                  <p className="text-sm text-brand-dark leading-relaxed max-w-[52ch]">{t(`about.milestones.${m.key}.text`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA band ── */}
        <section className="px-6 md:px-12 pb-24 md:pb-32">
          <div className="max-w-6xl mx-auto">
            <div data-reveal className="p-1.5 rounded-[2rem] bg-brand-brown/10 border border-brand-brown/20">
              <div className="rounded-[calc(2rem-0.375rem)] bg-brand-dark dark:bg-[#1e1b17] px-8 md:px-14 py-14 md:py-20 relative overflow-hidden"
                style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08)' }}>
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(60% 80% at 80% 20%, rgba(200,149,90,0.22), transparent 70%)' }} />
                <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tighter mb-3"
                      style={{ textWrap: 'balance' }}>
                      {t('about.ctaTitle1')}{' '}
                      <em className="font-display font-normal italic text-brand-orange">{t('about.ctaTitleEm')}</em>
                    </h2>
                    <p className="text-white/60 text-sm leading-relaxed max-w-[44ch]">
                      {t('about.ctaSub')}
                    </p>
                  </div>
                  <Link to="/dashboard"
                    className="btn-primary text-sm py-3 pl-6 pr-2 inline-flex items-center gap-3 group w-max flex-shrink-0">
                    {t('common.startDesigning')}
                    <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center transition-transform ease-spring duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-px">
                      <ArrowRight size={13} weight="bold" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}
