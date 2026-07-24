import { Link, useNavigate, useLocation } from 'react-router-dom'
import { House, GridFour, Sun, Moon, SignOut } from '@phosphor-icons/react'
import useStore from '../../store/useStore'
import { useTheme } from '../../hooks/useTheme'
import { useLang } from '../../i18n/LanguageProvider'
import LanguageToggle from './LanguageToggle'

export default function Navbar() {
  const { user, clearAuth } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggle } = useTheme()
  const { t } = useLang()

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <nav className="h-14 bg-surface-raised border-b border-brand-grey flex items-center px-4 sm:px-6 gap-2 sm:gap-4 z-40 flex-shrink-0">
      <Link to="/" className="flex items-center gap-2 sm:mr-4">
        <div className="w-7 h-7 bg-brand-brown rounded-lg flex items-center justify-center">
          <House size={16} weight="fill" className="text-white" />
        </div>
        <span className="font-semibold text-brand-dark text-lg tracking-tight hidden sm:inline">FrameSpace</span>
      </Link>

      <div className="flex items-center gap-1">
        <Link
          to="/dashboard"
          className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ease-spring duration-150 ${
            isActive('/dashboard') ? 'bg-brand-brown/10 text-brand-brown' : 'text-brand-grey-dark hover:text-brand-dark hover:bg-brand-grey'
          }`}
        >
          {t('common.dashboard')}
        </Link>
        <Link
          to="/dashboard"
          className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ease-spring duration-150 flex items-center gap-1.5 ${
            isActive('/designer') ? 'bg-brand-brown/10 text-brand-brown' : 'text-brand-grey-dark hover:text-brand-dark hover:bg-brand-grey'
          }`}
        >
          <GridFour size={14} weight="regular" />
          <span className="hidden sm:inline">{t('nav.newRoom')}</span>
        </Link>
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <span className="text-sm text-brand-grey-dark hidden md:block">
          {t('nav.hi')}, <span className="font-medium text-brand-dark">{user?.name?.split(' ')[0]}</span>
        </span>

        <LanguageToggle />

        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-grey-dark hover:text-brand-dark hover:bg-brand-grey transition-colors ease-spring duration-150"
        >
          {theme === 'light' ? <Moon size={16} weight="regular" /> : <Sun size={16} weight="regular" />}
        </button>

        <Link to="/profile">
          <div className="w-8 h-8 bg-brand-brown rounded-full flex items-center justify-center text-white text-sm font-bold hover:bg-brand-brown-dark transition-colors ease-spring duration-150 cursor-pointer">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        </Link>
        <button
          onClick={handleLogout}
          title={t('nav.signOut')}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-grey-dark hover:text-brand-dark hover:bg-brand-grey transition-colors ease-spring duration-150"
        >
          <SignOut size={16} weight="regular" />
        </button>
      </div>
    </nav>
  )
}
