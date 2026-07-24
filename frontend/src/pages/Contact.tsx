import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PaperPlaneTilt, CheckCircle, EnvelopeSimple, ChatCircleText, Timer } from '@phosphor-icons/react'
import MarketingNav from '../components/common/MarketingNav'
import MarketingFooter from '../components/common/MarketingFooter'
import { useReveal } from '../hooks/useReveal'
import { useLang } from '../i18n/LanguageProvider'

const CHANNELS = [
  { Icon: EnvelopeSimple, key: 'email' },
  { Icon: ChatCircleText, key: 'partnerships' },
  { Icon: Timer,          key: 'response' },
]

export default function Contact() {
  useReveal()
  const { t } = useLang()
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="min-h-[100dvh] bg-brand-grey-light flex flex-col">
      <div className="grain-overlay" aria-hidden="true" />
      <MarketingNav />

      <main id="main-content" className="flex-1 px-6 md:px-12 pt-36 pb-24 md:pb-32">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* ── Left — editorial intro + channels ── */}
          <div className="lg:col-span-5">
            <p data-reveal className="text-xs font-semibold text-brand-brown uppercase tracking-[0.2em] mb-6">
              {t('contact.eyebrow')}
            </p>
            <h1 data-reveal data-delay="100"
              className="text-4xl sm:text-5xl font-bold text-brand-dark tracking-tighter leading-[1.02] mb-5"
              style={{ textWrap: 'balance' }}>
              {t('contact.title1')}{' '}
              <em className="font-display font-normal italic text-brand-brown">{t('contact.titleEm')}</em>
            </h1>
            <p data-reveal data-delay="150" className="text-brand-grey-dark text-base leading-relaxed mb-12 max-w-[46ch]">
              {t('contact.intro')}
            </p>

            <div data-reveal data-delay="200">
              {CHANNELS.map(({ Icon, key }) => (
                <div key={key} className="flex gap-4 py-5 border-t border-brand-grey last:border-b">
                  <div className="w-9 h-9 bg-brand-brown/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon size={17} weight="regular" className="text-brand-brown" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-dark text-sm mb-0.5">{t(`contact.channels.${key}.title`)}</h3>
                    <p className="text-xs text-brand-grey-dark leading-relaxed max-w-[42ch]">{t(`contact.channels.${key}.desc`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right — form in double-bezel shell ── */}
          <div className="lg:col-span-7" data-reveal data-delay="200">
            <div className="p-1.5 rounded-[2rem] bg-brand-dark/[0.03] border border-brand-grey">
              <div className="rounded-[calc(2rem-0.375rem)] bg-surface-raised p-7 md:p-10"
                style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6)' }}>
                {sent ? (
                  <div className="text-center py-16">
                    <div className="w-14 h-14 bg-brand-brown/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                      <CheckCircle size={28} weight="fill" className="text-brand-brown" />
                    </div>
                    <h2 className="text-xl font-bold text-brand-dark tracking-tight mb-2">{t('contact.sentTitle')}</h2>
                    <p className="text-sm text-brand-grey-dark mb-8 max-w-[36ch] mx-auto leading-relaxed">
                      {t('contact.sentDesc', { name: form.name.split(' ')[0] || t('contact.friend'), email: form.email || t('contact.yourInbox') })}
                    </p>
                    <Link to="/" className="btn-secondary text-sm px-5 py-2.5">{t('common.backToHome')}</Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="contact-name" className="label">{t('contact.name')}</label>
                        <input id="contact-name" className="input" placeholder={t('contact.namePlaceholder')} required
                          autoComplete="name"
                          value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                      </div>
                      <div>
                        <label htmlFor="contact-email" className="label">{t('contact.email')}</label>
                        <input id="contact-email" className="input" type="email" placeholder="you@example.com" required
                          autoComplete="email"
                          value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="contact-message" className="label">{t('contact.message')}</label>
                      <textarea id="contact-message" className="input min-h-[160px] resize-none"
                        placeholder={t('contact.messagePlaceholder')} required minLength={10}
                        value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                      <p className="text-[11px] text-brand-grey-dark mt-1.5">
                        {t('contact.messageHint')}
                      </p>
                    </div>
                    <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                      {t('contact.sendMessage')} <PaperPlaneTilt size={15} weight="bold" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}
