import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon, ArrowRight, List, X } from '@phosphor-icons/react'
import useStore from '../../store/useStore'
import { useTheme } from '../../hooks/useTheme'
import { useLang } from '../../i18n/LanguageProvider'
import LanguageToggle from './LanguageToggle'

const LINKS = [
  { key: 'shop',        to: '/shop' },
  { key: 'collections', to: '/collections' },
  { key: 'inspiration', to: '/inspiration' },
  { key: 'about',       to: '/about' },
  { key: 'contact',     to: '/contact' },
]

/** Floating glass-pill navigation shared by all marketing subpages. */
export default function MarketingNav() {
  const location = useLocation()
  const { theme, toggle } = useTheme()
  const { token } = useStore() as any
  const { t } = useLang()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
    <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-max max-w-[calc(100vw-1.5rem)]">
      <nav className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 bg-surface-raised/90 backdrop-blur-2xl rounded-full border border-brand-grey shadow-float whitespace-nowrap">
        {/* Mobile: a menu button sits where the logo is; tapping it reveals the links. */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Menu"
          aria-expanded={menuOpen}
          className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-brand-dark hover:bg-brand-grey transition-colors ease-spring duration-150"
        >
          {menuOpen ? <X size={17} weight="regular" /> : <List size={17} weight="regular" />}
        </button>

        {/* Logo — desktop only */}
        <Link to="/" className="hidden md:flex items-center" aria-label="FrameSpace home">
          <img src="/logo.png" alt="FrameSpace" className="h-6 w-auto object-contain" />
        </Link>

        <div className="w-px h-4 bg-brand-grey hidden md:block" />

        <div className="hidden md:flex items-center gap-1">
          {LINKS.map(l => {
            const active = location.pathname.startsWith(l.to)
            return (
              <Link
                key={l.to}
                to={l.to}
                aria-current={active ? 'page' : undefined}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ease-spring duration-150 ${
                  active
                    ? 'bg-brand-brown/10 text-brand-brown'
                    : 'text-brand-grey-dark hover:text-brand-dark'
                }`}
              >
                {t(`nav.${l.key}`)}
              </Link>
            )
          })}
        </div>

        <div className="w-px h-4 bg-brand-grey" />

        {/* Right actions — always visible */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <LanguageToggle />
          <button
            onClick={toggle}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            className="w-7 h-7 rounded-full flex items-center justify-center text-brand-grey-dark hover:text-brand-dark hover:bg-brand-grey transition-colors ease-spring duration-150"
          >
            {theme === 'light' ? <Moon size={13} weight="regular" /> : <Sun size={13} weight="regular" />}
          </button>
          <Link to="/dashboard" className="btn-primary text-xs py-1.5 pl-4 pr-1.5 hidden md:flex items-center gap-2 group">
            {token ? t('common.dashboard') : t('common.startDesigning')}
            <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center transition-transform ease-spring duration-300 group-hover:translate-x-0.5">
              <ArrowRight size={10} weight="bold" />
            </span>
          </Link>
        </div>
      </nav>
    </header>

    {/* Mobile dropdown — fixed to the viewport (outside the transformed header) so it stays centered */}
    {menuOpen && (
      <div className="md:hidden fixed top-[4.75rem] inset-x-0 mx-auto z-50 w-[min(20rem,calc(100vw-1.5rem))] bg-surface-raised/95 backdrop-blur-2xl rounded-2xl border border-brand-grey shadow-float p-2 animate-slide-up">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 mb-1 rounded-xl hover:bg-brand-grey transition-colors"
          >
            <img src="/logo.png" alt="FrameSpace" className="h-5 w-auto object-contain" />
          </Link>
          {LINKS.map(l => {
            const active = location.pathname.startsWith(l.to)
            return (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? 'bg-brand-brown/10 text-brand-brown' : 'text-brand-dark hover:bg-brand-grey'
                }`}
              >
                {t(`nav.${l.key}`)}
              </Link>
            )
          })}
          <Link
            to="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="btn-primary w-full text-sm py-2.5 mt-1 flex items-center justify-center gap-2"
          >
            {token ? t('common.dashboard') : t('common.startDesigning')}
            <ArrowRight size={13} weight="bold" />
          </Link>
        </div>
      )}
    </>
  )
}
