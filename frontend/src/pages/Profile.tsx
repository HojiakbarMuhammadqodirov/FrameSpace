import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import useStore from '../store/useStore'
import { userApi } from '../services/api'
import { useLang } from '../i18n/LanguageProvider'
import type { User } from '../types'

type Msg = { text: string; ok: boolean } | null

export default function Profile() {
  const navigate = useNavigate()
  const { user, setAuth, token } = useStore()
  const { t } = useLang()
  const [form, setForm] = useState({ name: user?.name || '', preferences: user?.preferences || { style: 'modern', budget: 'mid-range', unit: 'meters' } })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [msg, setMsg] = useState<Msg>(null)
  const [pwMsg, setPwMsg] = useState<Msg>(null)

  useEffect(() => {
    if (!user) navigate('/')
  }, [user])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await userApi.updateProfile({ name: form.name, preferences: form.preferences })
      setAuth(res.data as User, token!)
      setMsg({ text: t('profile.profileUpdated'), ok: true })
      setTimeout(() => setMsg(null), 3000)
    } catch { setMsg({ text: t('profile.profileFailed'), ok: false }) } finally { setSaving(false) }
  }

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ text: t('profile.passwordsNoMatch'), ok: false }); return
    }
    setSavingPw(true)
    try {
      await userApi.updatePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      setPwMsg({ text: t('profile.passwordUpdated'), ok: true })
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setPwMsg(null), 3000)
    } catch { setPwMsg({ text: t('profile.passwordFailed'), ok: false }) } finally { setSavingPw(false) }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-brand-grey-light">
      <Navbar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-brand-brown rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-dark tracking-tight">{user?.name}</h1>
              <p className="text-brand-grey-dark">{user?.email}</p>
            </div>
          </div>

          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-brand-dark mb-4 tracking-tight">{t('profile.profileSettings')}</h2>
            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className="label">{t('profile.fullName')}</label>
                <input className="input" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">{t('profile.defaultStyle')}</label>
                  <select className="input" value={form.preferences.style}
                    onChange={e => setForm(f => ({ ...f, preferences: { ...f.preferences, style: e.target.value as User['preferences']['style'] } }))}>
                    {['minimalist', 'modern', 'cozy', 'luxury', 'industrial', 'scandinavian'].map(s => (
                      <option key={s} value={s}>{t(`dashboard.styles.${s}`)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">{t('profile.defaultBudget')}</label>
                  <select className="input" value={form.preferences.budget}
                    onChange={e => setForm(f => ({ ...f, preferences: { ...f.preferences, budget: e.target.value as User['preferences']['budget'] } }))}>
                    <option value="budget">{t('profile.budgets.budget')}</option>
                    <option value="mid-range">{t('profile.budgets.mid-range')}</option>
                    <option value="premium">{t('profile.budgets.premium')}</option>
                  </select>
                </div>
              </div>
              {msg && (
                <div className={`px-4 py-2 rounded-xl text-sm ${msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {msg.text}
                </div>
              )}
              <button type="submit" disabled={saving} className="btn-primary active:scale-[0.98]">
                {saving ? t('profile.saving') : t('profile.saveChanges')}
              </button>
            </form>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-brand-dark mb-4 tracking-tight">{t('profile.changePassword')}</h2>
            <form onSubmit={savePassword} className="space-y-4">
              <div>
                <label className="label">{t('profile.currentPassword')}</label>
                <input type="password" className="input" value={pwForm.currentPassword}
                  onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} />
              </div>
              <div>
                <label className="label">{t('profile.newPassword')}</label>
                <input type="password" className="input" value={pwForm.newPassword}
                  onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} />
              </div>
              <div>
                <label className="label">{t('profile.confirmNewPassword')}</label>
                <input type="password" className="input" value={pwForm.confirmPassword}
                  onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} />
              </div>
              {pwMsg && (
                <div className={`px-4 py-2 rounded-xl text-sm ${pwMsg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {pwMsg.text}
                </div>
              )}
              <button type="submit" disabled={savingPw} className="btn-primary active:scale-[0.98]">
                {savingPw ? t('profile.updating') : t('profile.updatePassword')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
