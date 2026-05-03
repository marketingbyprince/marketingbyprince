import { useEffect, useState } from 'react'
import { supabaseAdmin } from '../lib/supabase'
import AdminLayout from './AdminLayout'

export default function SiteSettings() {
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabaseAdmin.from('site_settings').select('*').order('key')
      .then(({ data }) => { setSettings(data || []); setLoading(false) })
  }, [])

  const updateValue = (key, value) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s))
  }

  const save = async e => {
    e.preventDefault()
    setSaving(true)
    await Promise.all(
      settings.map(s => supabaseAdmin.from('site_settings').upsert({ key: s.key, value: s.value }, { onConflict: 'key' }))
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
    <AdminLayout>
      <div className="p-6 sm:p-8 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Site Settings</h1>
          <button onClick={addNew} className="px-4 py-2 border border-gray-700 text-gray-300 hover:text-white rounded-xl text-sm transition-colors">
            + Add Setting
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : settings.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="mb-4">No settings yet.</p>
            <button onClick={addNew} className="text-blue-400 hover:underline text-sm">Add your first setting →</button>
          </div>
        ) : (
          <form onSubmit={save} className="space-y-4">
            {settings.map(s => (
              <div key={s.key} className="bg-[#111827] border border-gray-800 rounded-xl p-4">
                <label className="text-xs text-gray-500 font-mono mb-1.5 block">{s.key}</label>
                <input
                  type="text"
                  value={s.value || ''}
                  onChange={e => updateValue(s.key, e.target.value)}
                  className="w-full bg-[#0A0F1E] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={saving}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-60'
              }`}
            >
              {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save All Settings'}
            </button>
          </form>
        )}
      </div>
    </AdminLayout>
  )
}
