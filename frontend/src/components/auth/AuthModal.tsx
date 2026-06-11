import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { House, X, ArrowRight } from '@phosphor-icons/react'
import { authApi } from '../../services/api'
import useStore from '../../store/useStore'

interface Props {
  onClose: () => void
  initialMode?: 'login' | 'signup'
}

export default function AuthModal({ onClose, initialMode = 'login' }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useStore()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (mode === 'signup') {
      if (!form.name.trim()) return setError('Name is required')
      if (form.password !== form.confirmPassword) return setError('Passwords do not match')
      if (form.password.length < 6) return setError('Password must be at least 6 characters')
    }
    setLoading(true)
    try {
      const res = mode === 'login'
        ? await authApi.login({ email: form.email, password: form.password })
        : await authApi.signup({ name: form.name, email: form.email, password: form.password })
      setAuth(res.data.user, res.data.token)
      onClose()
      navigate('/dashboard')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: { msg: string }[] } } }
      setError(e.response?.data?.errors?.[0]?.msg || e.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (m: 'login' | 'signup') => { setMode(m); setError('') }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      {/* Double-bezel outer shell */}
      <div
        className="w-full max-w-sm animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-1.5 rounded-[2rem] bg-brand-dark/8 border border-brand-grey shadow-2xl">
          <div
            className="rounded-[calc(2rem-0.375rem)] bg-surface-raised overflow-hidden"
            style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15)' }}
          >
            {/* Header band */}
            <div className="px-7 pt-7 pb-5">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-brand-brown rounded-xl flex items-center justify-center flex-shrink-0">
                    <House size={18} weight="fill" className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-brand-brown uppercase tracking-[0.12em]">FrameSpace</p>
                    <h2 className="text-lg font-bold text-brand-dark tracking-tight leading-tight">
                      {mode === 'login' ? 'Welcome back' : 'Create account'}
                    </h2>
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-grey-dark hover:bg-brand-grey transition-colors ease-spring duration-150 flex-shrink-0">
                  <X size={15} weight="regular" />
                </button>
              </div>

              {/* Mode toggle pill */}
              <div className="flex bg-brand-grey rounded-xl p-1">
                {(['login', 'signup'] as const).map(m => (
                  <button key={m} onClick={() => switchMode(m)}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ease-spring duration-200 ${
                      mode === m ? 'bg-surface-raised shadow-sm text-brand-dark' : 'text-brand-grey-dark hover:text-brand-dark'
                    }`}>
                    {m === 'login' ? 'Sign in' : 'Sign up'}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-7 pb-7 space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="label">Full name</label>
                  <input name="name" value={form.name} onChange={handleChange}
                    className="input" placeholder="Alex Johnson" autoFocus={mode === 'signup'} required />
                </div>
              )}
              <div>
                <label className="label">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  className="input" placeholder="you@example.com" autoFocus={mode === 'login'} required />
              </div>
              <div>
                <label className="label">Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange}
                  className="input" placeholder="••••••••" required />
              </div>
              {mode === 'signup' && (
                <div>
                  <label className="label">Confirm password</label>
                  <input name="confirmPassword" type="password" value={form.confirmPassword}
                    onChange={handleChange} className="input" placeholder="••••••••" required />
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-1">
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    {mode === 'login' ? 'Sign in' : 'Create account'}
                    <ArrowRight size={14} weight="bold" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
