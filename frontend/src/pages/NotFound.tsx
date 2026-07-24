import { Link } from 'react-router-dom'
import { ArrowRight, Compass } from '@phosphor-icons/react'
import MarketingNav from '../components/common/MarketingNav'
import { useLang } from '../i18n/LanguageProvider'

export default function NotFound() {
  const { t } = useLang()
  return (
    <div className="min-h-[100dvh] bg-brand-grey-light flex flex-col">
      <div className="grain-overlay" aria-hidden="true" />
      <MarketingNav />

      <main id="main-content" className="flex-1 flex items-center justify-center px-6 pt-24 pb-16">
        <div className="text-center max-w-md">
          <p className="font-display italic text-[6rem] leading-none text-brand-brown/30 select-none mb-2">404</p>
          <div className="w-12 h-12 bg-brand-brown/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Compass size={24} weight="regular" className="text-brand-brown" />
          </div>
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight mb-2">{t('notFound.title')}</h1>
          <p className="text-sm text-brand-grey-dark leading-relaxed mb-8">
            {t('notFound.desc')}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/" className="btn-secondary text-sm px-5 py-2.5">{t('common.backToHome')}</Link>
            <Link to="/dashboard" className="btn-primary text-sm py-2.5 pl-5 pr-2 inline-flex items-center gap-2 group">
              {t('notFound.openDesigner')}
              <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center transition-transform ease-spring duration-300 group-hover:translate-x-0.5">
                <ArrowRight size={11} weight="bold" />
              </span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
