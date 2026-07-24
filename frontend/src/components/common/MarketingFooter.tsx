import { Link } from 'react-router-dom'
import { TwitterLogo, InstagramLogo, YoutubeLogo, EnvelopeSimple, ArrowRight } from '@phosphor-icons/react'
import { useLang } from '../../i18n/LanguageProvider'

const PRODUCT_LINKS = [
  { key: 'roomDesigner', to: '/dashboard' },
  { key: 'shopAll',      to: '/shop' },
  { key: 'collections',  to: '/collections' },
  { key: 'aiRecs',       to: '/dashboard' },
  { key: 'shareExport',  to: '/dashboard' },
]

const COMPANY_LINKS = [
  { key: 'about',       to: '/about' },
  { key: 'inspiration', to: '/inspiration' },
  { key: 'contact',     to: '/contact' },
  { key: 'gallery',     to: '/gallery' },
]

/** Site footer shared by the landing page and all marketing subpages. */
export default function MarketingFooter() {
  const { t } = useLang()
  return (
    <footer className="bg-brand-dark dark:bg-[#1e1b17] text-white">
      <div className="px-8 md:px-16 pt-16 pb-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <img src="/logo.png" alt="FrameSpace" className="h-8 w-auto object-contain" />
            </div>
            <p className="text-sm text-white/55 leading-relaxed mb-6 max-w-[22ch]">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-3">
              {[
                { Icon: TwitterLogo,    href: '/contact', label: 'Twitter' },
                { Icon: InstagramLogo,  href: '/contact', label: 'Instagram' },
                { Icon: YoutubeLogo,    href: '/contact', label: 'YouTube' },
                { Icon: EnvelopeSimple, href: '/contact', label: 'Email' },
              ].map(({ Icon, href, label }) => (
                <Link key={label} to={href} aria-label={label}
                  className="w-8 h-8 rounded-lg bg-white/8 hover:bg-brand-brown transition-colors ease-spring duration-150 flex items-center justify-center text-white/60 hover:text-white">
                  <Icon size={15} weight="regular" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-white/40 mb-4">{t('footer.product')}</p>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map(l => (
                <li key={l.key}>
                  <Link to={l.to} className="text-sm text-white/55 hover:text-white transition-colors duration-150">
                    {t(`footer.${l.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-white/40 mb-4">{t('footer.company')}</p>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map(l => (
                <li key={l.key}>
                  <Link to={l.to} className="text-sm text-white/55 hover:text-white transition-colors duration-150">
                    {t(`footer.${l.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-white/40 mb-4">{t('footer.stayInLoop')}</p>
            <p className="text-sm text-white/55 leading-relaxed mb-4">
              {t('footer.newsletterDesc')}
            </p>
            <form onSubmit={e => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                aria-label="Email address"
                className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-brand-brown transition-colors"
              />
              <button type="submit" aria-label="Subscribe"
                className="px-3 py-2 rounded-lg bg-brand-brown hover:bg-brand-brown-dark transition-colors ease-spring duration-150 flex-shrink-0">
                <ArrowRight size={14} weight="bold" className="text-white" />
              </button>
            </form>
            <p className="text-[10px] text-white/30 mt-2">{t('footer.noSpam')}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-8 md:px-16 py-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-white/35">{t('footer.rights')}</p>
          <div className="flex items-center gap-5">
            <Link to="/legal#privacy" className="text-[11px] text-white/35 hover:text-white/70 transition-colors duration-150">
              {t('footer.privacy')}
            </Link>
            <Link to="/legal#terms" className="text-[11px] text-white/35 hover:text-white/70 transition-colors duration-150">
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
