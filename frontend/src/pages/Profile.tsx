import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import useStore from '../store/useStore'
import { userApi } from '../services/api'
import type { User } from '../types'

export default function Profile() {
  const navigate = useNavigate()
  const { user, setAuth, token } = useStore()
  const [form, setForm] = useState({ name: user?.name || '', preferences: user?.preferences || { style: 'modern', budget: 'mid-range', unit: 'meters' } })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [msg, setMsg] = useState('')
  const [pwMsg, setPwMsg] = useState('')

  useEffect(() => {
    if (!user) navigate('/')
  }, [user])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await userApi.updateProfile({ name: form.name, preferences: form.preferences })
      setAuth(res.data as User, token!)
      setMsg('Profile updated')
      setTimeout(() => setMsg(''), 3000)
    } catch { setMsg('Failed to update profile') } finally { setSaving(false) }
  }

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg('Passwords do not match'); return
    }
    setSavingPw(true)
    try {
      await userApi.updatePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      setPwMsg('Password updated')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setPwMsg(''), 3000)
    } catch { setPwMsg('Failed to update password') } finally { setSavingPw(false) }
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
            <h2 className="text-lg font-semibold text-brand-dark mb-4 tracking-tight">Profile settings</h2>
            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className="label">Full name</label>
                <input className="input" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Default style</label>
                  <select className="input" value={form.preferences.style}
                    onChange={e => setForm(f => ({ ...f, preferences: { ...f.preferences, style: e.target.value as User['preferences']['style'] } }))}>
                    {['minimalist', 'modern', 'cozy', 'luxury', 'industrial', 'scandinavian'].map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Default budget</label>
                  <select className="input" value={form.preferences.budget}
                    onChange={e => setForm(f => ({ ...f, preferences: { ...f.preferences, budget: e.target.value as User['preferences']['budget'] } }))}>
                    <option value="budget">Budget</option>
                    <option value="mid-range">Mid-range</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </div>
              {msg && (
                <div className={`px-4 py-2 rounded-xl text-sm ${msg.includes('success') || msg === 'Profile updated' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {msg}
                </div>
              )}
              <button type="submit" disabled={saving} className="btn-primary active:scale-[0.98]">
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-brand-dark mb-4 tracking-tight">Change password</h2>
            <form onSubmit={savePassword} className="space-y-4">
              <div>
                <label className="label">Current password</label>
                <input type="password" className="input" value={pwForm.currentPassword}
                  onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} />
              </div>
              <div>
                <label className="label">New password</label>
                <input type="password" className="input" value={pwForm.newPassword}
                  onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} />
              </div>
              <div>
                <label className="label">Confirm new password</label>
                <input type="password" className="input" value={pwForm.confirmPassword}
                  onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} />
              </div>
              {pwMsg && (
                <div className={`px-4 py-2 rounded-xl text-sm ${pwMsg.includes('success') || pwMsg === 'Password updated' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {pwMsg}
                </div>
              )}
              <button type="submit" disabled={savingPw} className="btn-primary active:scale-[0.98]">
                {savingPw ? 'Updating...' : 'Update password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
