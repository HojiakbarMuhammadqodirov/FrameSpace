import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import MarketingNav from '../components/common/MarketingNav'
import MarketingFooter from '../components/common/MarketingFooter'
import { useLang } from '../i18n/LanguageProvider'

const PRIVACY_KEYS = ['collect', 'store', 'controls']
const TERMS_KEYS = ['yours', 'fair', 'listings']

export default function Legal() {
  const { hash } = useLocation()
  const { t } = useLang()

  useEffect(() => {
    if (!hash) return
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
  }, [hash])

  return (
    <div className="min-h-[100dvh] bg-brand-grey-light">
      <div className="grain-overlay" aria-hidden="true" />
      <MarketingNav />

      <main id="main-content" className="px-6 md:px-12 pt-36 pb-24 max-w-3xl mx-auto">
        <p className="text-xs font-semibold text-brand-brown uppercase tracking-[0.2em] mb-6">{t('legal.eyebrow')}</p>
        <h1 className="text-4xl md:text-5xl font-bold text-brand-dark tracking-tighter mb-4">
          {t('legal.title1')}{' '}
          <em className="font-display font-normal italic text-brand-brown">{t('legal.titleEm')}</em>
        </h1>
        <p className="text-sm text-brand-grey-dark leading-relaxed mb-16 max-w-[56ch]">
          {t('legal.intro')}
        </p>

        <section id="privacy" className="mb-16 scroll-mt-28">
          <h2 className="text-2xl font-bold text-brand-dark tracking-tight mb-6">{t('legal.privacyTitle')}</h2>
          {PRIVACY_KEYS.map(k => (
            <div key={k} className="py-6 border-t border-brand-grey">
              <h3 className="font-semibold text-brand-dark text-sm mb-2">{t(`legal.privacy.${k}.title`)}</h3>
              <p className="text-sm text-brand-grey-dark leading-relaxed">{t(`legal.privacy.${k}.body`)}</p>
            </div>
          ))}
        </section>

        <section id="terms" className="scroll-mt-28">
          <h2 className="text-2xl font-bold text-brand-dark tracking-tight mb-6">{t('legal.termsTitle')}</h2>
          {TERMS_KEYS.map(k => (
            <div key={k} className="py-6 border-t border-brand-grey">
              <h3 className="font-semibold text-brand-dark text-sm mb-2">{t(`legal.terms.${k}.title`)}</h3>
              <p className="text-sm text-brand-grey-dark leading-relaxed">{t(`legal.terms.${k}.body`)}</p>
            </div>
          ))}
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}
