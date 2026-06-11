import { useState } from 'react'
import { Link } from 'react-router-dom'
import { House, ArrowLeft, PaperPlaneTilt, CheckCircle } from '@phosphor-icons/react'

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="min-h-[100dvh] bg-brand-grey-light flex flex-col">
      <header className="flex justify-center pt-6 px-6">
        <div className="flex items-center gap-4 px-5 py-3 bg-surface-raised/90 backdrop-blur-2xl rounded-full border border-brand-grey shadow-float">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-brown rounded-md flex items-center justify-center">
              <House size={13} weight="fill" className="text-white" />
            </div>
            <span className="font-semibold text-brand-dark text-sm tracking-tight">FrameSpace</span>
          </Link>
          <div className="w-px h-4 bg-brand-grey" />
          <Link to="/" className="flex items-center gap-1.5 text-xs text-brand-grey-dark hover:text-brand-dark transition-colors">
            <ArrowLeft size={12} weight="bold" /> Back home
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          {sent ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-brand-brown/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={28} weight="fill" className="text-brand-brown" />
              </div>
              <h2 className="text-xl font-bold text-brand-dark tracking-tight mb-2">Message sent!</h2>
              <p className="text-sm text-brand-grey-dark mb-6">We'll get back to you within 24 hours.</p>
              <Link to="/" className="btn-secondary text-sm px-5 py-2.5">Back to home</Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <span className="text-xs font-semibold text-brand-brown uppercase tracking-[0.15em]">Say hello</span>
                <h1 className="text-3xl font-bold text-brand-dark tracking-tighter mt-2">Contact us</h1>
                <p className="text-brand-grey-dark text-sm mt-1">Questions, feedback, or partnership inquiries.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Name</label>
                  <input className="input" placeholder="Your name" required
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" placeholder="you@example.com" required
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea className="input min-h-[120px] resize-none" placeholder="Tell us what's on your mind..." required
                    value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                </div>
                <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                  Send message <PaperPlaneTilt size={15} weight="bold" />
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
