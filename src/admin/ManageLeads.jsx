import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import AdminLayout from './AdminLayout'

export default function ManageLeads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const fetchLeads = async () => {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchLeads() }, [])

  const markRead = async id => {
    await supabase.from('leads').update({ is_read: true }).eq('id', id)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, is_read: true } : l))
  }

  const openLead = lead => {
    setSelected(lead)
    if (!lead.is_read) markRead(lead.id)
  }

  return (
    <AdminLayout>
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Leads</h1>
            <p className="text-gray-400 text-sm mt-1">{leads.filter(l => !l.is_read).length} unread</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No leads yet.</div>
        ) : (
          <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-gray-800">
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3 hidden sm:table-cell">Email</th>
                  <th className="px-5 py-3 hidden md:table-cell">Budget</th>
                  <th className="px-5 py-3 hidden lg:table-cell">Date</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {leads.map(lead => (
                  <tr
                    key={lead.id}
                    onClick={() => openLead(lead)}
                    className={`cursor-pointer hover:bg-gray-800/50 transition-colors ${!lead.is_read ? 'bg-blue-500/5' : ''}`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="text-white text-sm font-medium">{lead.name}</div>
                      {lead.company && <div className="text-gray-500 text-xs">{lead.company}</div>}
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell text-gray-400 text-sm">{lead.email}</td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-gray-400 text-sm">{lead.budget_range || '—'}</td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-gray-500 text-xs">
                      {lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      {lead.is_read ? (
                        <span className="text-xs text-gray-500">Read</span>
                      ) : (
                        <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full font-medium">New</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Detail modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-5">
                <h3 className="text-white font-bold text-lg">{selected.name}</h3>
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white">✕</button>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Email', value: selected.email },
                  { label: 'Company', value: selected.company },
                  { label: 'Budget', value: selected.budget_range },
                  { label: 'Source', value: selected.source_page },
                  { label: 'Date', value: selected.created_at ? new Date(selected.created_at).toLocaleString('en-IN') : null },
                ].filter(f => f.value).map(({ label, value }) => (
                  <div key={label}>
                    <span className="text-gray-500 text-xs">{label}</span>
                    <p className="text-gray-200">{value}</p>
                  </div>
                ))}
                <div>
                  <span className="text-gray-500 text-xs">Message</span>
                  <p className="text-gray-200 whitespace-pre-wrap leading-relaxed mt-1">{selected.message}</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <a href={`mailto:${selected.email}`} className="flex-1 text-center py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                  Reply via Email
                </a>
                <button onClick={() => setSelected(null)} className="flex-1 py-2 border border-gray-700 text-gray-300 rounded-lg text-sm transition-colors hover:border-gray-600">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
