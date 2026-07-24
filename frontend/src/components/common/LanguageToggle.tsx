import { Translate } from '@phosphor-icons/react'
import { useLang } from '../../i18n/LanguageProvider'

interface Props {
  className?: string
  iconSize?: number
}

/**
 * One button that flips the whole site between Uzbek and English.
 * Shows the currently active language code; the tooltip states what it switches to.
 */
export default function LanguageToggle({ className, iconSize = 13 }: Props) {
  const { lang, toggle } = useLang()

  return (
    <button
      onClick={toggle}
      title={lang === 'uz' ? 'Switch to English' : "O‘zbekchaga o‘tish"}
      aria-label={lang === 'uz' ? 'Switch to English' : "O‘zbekchaga o‘tish"}
      className={
        className ??
        'flex items-center gap-1 h-7 px-2 rounded-full text-brand-grey-dark hover:text-brand-dark hover:bg-brand-grey transition-colors ease-spring duration-150'
      }
    >
      <Translate size={iconSize} weight="regular" />
      <span className="text-[11px] font-semibold tracking-wide tabular-nums">
        {lang === 'uz' ? 'UZ' : 'EN'}
      </span>
    </button>
  )
}
