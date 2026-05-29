import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import AdminLayout from './AdminLayout'

export default function ManageLeads() {
  const [leads,    setLeads]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState(null)

  // Lookup maps built from gigs + packages
  const [gigMap, setGigMap] = useState({})   // id → title
  const [pkgMap, setPkgMap] = useState({})   // id → { name, tier }

  useEffect(() => {
    Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('gigs').select('id, title'),
      supabase.from('gig_packages').select('id, name, tier'),
    ]).then(([{ data: leadsData }, { data: gigsData }, { data: pkgsData }]) => {
      setLeads(leadsData || [])
      const gm = {}; (gigsData || []).forEach(g => { gm[g.id] = g.title }); setGigMap(gm)
      const pm = {}; (pkgsData || []).forEach(p => { pm[p.id] = { name: p.name, tier: p.tier } }); setPkgMap(pm)
      setLoading(false)
    })
  }, [])

  const markRead = async id => {
    await supabase.from('leads').update({ is_read: true }).eq('id', id)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, is_read: true } : l))
  }

  const openLead = lead => {
    setSelected(lead)
    if (!lead.is_read) markRead(lead.id)
  }

  // ── Helpers ───────────────────────────────────────────────────────
  const gigTitle  = lead => lead.selected_gig_id         ? (gigMap[lead.selected_gig_id] ?? '—')         : null
  const pkgLabel  = lead => lead.selected_gig_package_id ? (pkgMap[lead.selected_gig_package_id]?.name ?? pkgMap[lead.selected_gig_package_id]?.tier ?? '—') : null
  const addonList = lead => {
    if (!lead.selected_addons?.length) return null
    return lead.selected_addons.map(a => a.name).join(', ')
  }
  const platformList = lead => {
    if (!lead.selected_platforms?.length) return null
    return lead.selected_platforms.map(p => p.name).join(', ')
  }
  const isGigLead = lead => !!(lead.selected_gig_id)

  const unread = leads.filter(l => !l.is_read).length

  return (
    <AdminLayout>
      <div className="p-6 sm:p-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Leads</h1>
            <p className="text-gray-400 text-sm mt-1">{unread} unread · {leads.length} total</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : leads.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-sm">No leads yet.</div>
        ) : (
          <div className="admin-card rounded-xl overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="hidden sm:table-cell">Email</th>
                  <th className="hidden md:table-cell">Source</th>
                  <th className="hidden lg:table-cell">Package</th>
                  <th className="hidden xl:table-cell">Estimate</th>
                  <th className="hidden lg:table-cell">Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr
                    key={lead.id}
                    onClick={() => openLead(lead)}
                    style={!lead.is_read ? { backgroundColor: 'rgba(255,105,51,0.04)' } : {}}
                  >
                    <td>
                      <div className="text-white text-sm font-semibold">{lead.name}</div>
                      {lead.company && (
                        <div className="text-gray-500 text-xs">{lead.company}</div>
                      )}
                    </td>
                    <td className="hidden sm:table-cell text-gray-400 text-sm">
                      <div>{lead.email}</div>
                      {lead.phone && <div className="text-xs text-gray-600">{lead.phone}</div>}
                    </td>
                    <td className="hidden md:table-cell">
                      {isGigLead(lead) ? (
                        <div>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">
                            Gig
                          </span>
                          <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[140px]">
                            {gigTitle(lead)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">
                          {lead.source_page || 'Contact'}
                        </span>
                      )}
                    </td>
                    <td className="hidden lg:table-cell text-gray-400 text-sm">
                      {pkgLabel(lead) ? (
                        <span className="capitalize">{pkgLabel(lead)}</span>
                      ) : (
                        <span className="text-gray-600">{lead.budget_range || '—'}</span>
                      )}
                    </td>
                    <td className="hidden xl:table-cell">
                      {lead.estimated_price ? (
                        <span className="font-bold text-sm" style={{ color: 'var(--accent)' }}>
                          ${Number(lead.estimated_price).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-600 text-sm">—</span>
                      )}
                    </td>
                    <td className="hidden lg:table-cell text-gray-500 text-xs">
                      {lead.created_at
                        ? new Date(lead.created_at).toLocaleDateString('en-IN')
                        : '—'}
                    </td>
                    <td>
                      {lead.is_read
                        ? <span className="badge-admin-read">Read</span>
                        : <span className="badge-admin-new">New</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Detail modal ─────────────────────────────────────────── */}
        {selected && (
          <div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <div
              className="admin-card rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-white font-extrabold text-lg tracking-tight">
                    {selected.name}
                  </h3>
                  {selected.company && (
                    <p className="text-gray-400 text-sm mt-0.5">{selected.company}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-500 hover:text-white transition-colors text-xl leading-none ml-4"
                >
                  &times;
                </button>
              </div>

              {/* Contact info */}
              <div className="space-y-3 text-sm mb-6">
                <ModalRow label="Email"  value={selected.email} />
                {selected.phone   && <ModalRow label="Phone"   value={selected.phone} />}
                {selected.company && <ModalRow label="Company" value={selected.company} />}
                <ModalRow
                  label="Date"
                  value={selected.created_at
                    ? new Date(selected.created_at).toLocaleString('en-IN')
                    : null}
                />
              </div>

              {/* Gig intelligence */}
              {isGigLead(selected) && (
                <div
                  className="rounded-xl p-4 mb-6 space-y-3"
                  style={{ backgroundColor: 'rgba(255,105,51,0.06)', border: '1px solid rgba(255,105,51,0.2)' }}
                >
                  <p className="text-xs font-extrabold uppercase tracking-wider mb-2"
                     style={{ color: 'var(--accent)' }}>
                    Gig Inquiry Details
                  </p>
                  <ModalRow label="Gig"      value={gigTitle(selected)} />
                  {pkgLabel(selected) && (
                    <ModalRow label="Package" value={pkgLabel(selected)} />
                  )}
                  {selected.selected_platforms?.length > 0 && (
                    <ModalRow
                      label="Platforms"
                      value={selected.selected_platforms.map(p => p.name).join(', ')}
                    />
                  )}
                  {selected.selected_addons?.length > 0 && (
                    <div>
                      <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                        Add-Ons
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {selected.selected_addons.map((a, i) => (
                          <span key={i} className="badge-gray text-xs">
                            {a.name}
                            {a.price > 0 && (
                              <span className="ml-1 font-bold" style={{ color: 'var(--accent)' }}>
                                +${Number(a.price).toLocaleString()}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selected.estimated_price > 0 && (
                    <div className="flex items-center justify-between pt-3 border-t mt-1"
                         style={{ borderColor: 'rgba(255,105,51,0.2)' }}>
                      <span className="text-sm font-bold text-gray-300">Estimated / mo</span>
                      <span className="font-extrabold text-lg" style={{ color: 'var(--accent)' }}>
                        ${Number(selected.estimated_price).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Contact-form fields */}
              {!isGigLead(selected) && selected.budget_range && (
                <ModalRow label="Budget" value={selected.budget_range} />
              )}

              {/* Message */}
              {selected.message && (
                <div className="mb-6">
                  <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                    Message
                  </span>
                  <p className="text-gray-200 whitespace-pre-wrap leading-relaxed mt-1 text-sm">
                    {selected.message}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <a
                  href={`mailto:${selected.email}`}
                  className="flex-1 text-center btn-admin btn-md"
                >
                  Reply via Email
                </a>
                {selected.phone && (
                  <a
                    href={`tel:${selected.phone}`}
                    className="flex-1 text-center btn btn-md border border-gray-700 text-gray-300 hover:border-gray-600"
                  >
                    Call
                  </a>
                )}
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 btn btn-md border border-gray-700 text-gray-300 hover:border-gray-600"
                >
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

function ModalRow({ label, value }) {
  if (!value) return null
  return (
    <div>
      <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}</span>
      <p className="text-gray-200 mt-0.5 text-sm">{value}</p>
    </div>
  )
}
