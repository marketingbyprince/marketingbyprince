'use client'
import { useEffect, useState } from 'react'
import { supabase as supabaseAdmin } from '@/lib/supabase'

export default function SiteSettings() {
  const [settings, setSettings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  useEffect(() => {
    supabaseAdmin.from('site_settings').select('*').order('key')
      .then(({ data }) => { setSettings(data || []); setLoading(false) })
  }, [])

  const updateValue = (key, value) =>
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s))

  const save = async e => {
    e.preventDefault()
    setSaving(true)
    await Promise.all(
      settings.map(s =>
        supabaseAdmin.from('site_settings').upsert({ key: s.key, value: s.value }, { onConflict: 'key' })
      )
    )
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addNew = () => {
    const key = prompt('Enter setting key (e.g. hero_headline):')
    if (key && !settings.find(s => s.key === key)) {
      setSettings(prev => [...prev, { key, value: '' }])
    }
  }

  return (
    <div className="p-6 sm:p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Site Settings</h1>
        <button onClick={addNew}
                className="btn btn-sm border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white">
          + Add Setting
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : settings.length === 0 ? (
        <div className="text-center py-20 text-gray-500 text-sm">
          <p className="mb-4">No settings yet.</p>
          <button onClick={addNew}
                  className="font-bold transition-colors hover:underline"
                  style={{ color: 'var(--accent)' }}>
            Add your first setting &rarr;
          </button>
        </div>
      ) : (
        <form onSubmit={save} className="space-y-4">
          {settings.map(s => (
            <div key={s.key} className="admin-card rounded-xl p-4">
              <label className="text-xs text-gray-500 font-mono mb-1.5 block tracking-wide">
                {s.key}
              </label>
              <input type="text" value={s.value || ''}
                     onChange={e => updateValue(s.key, e.target.value)}
                     className="admin-input" />
            </div>
          ))}

          <button type="submit" disabled={saving}
                  className={`w-full btn btn-lg justify-center disabled:opacity-60 ${
                    saved ? 'bg-green-500 text-white' : 'btn-admin'
                  }`}>
            {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save All Settings'}
          </button>
        </form>
      )}
    </div>
  )
}
