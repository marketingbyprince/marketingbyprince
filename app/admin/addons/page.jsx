'use client'
import { useEffect, useState } from 'react'
import AdminPageShell from '@/components/admin/AdminPageShell'
import CrudModal      from '@/components/admin/CrudModal'
import FieldGroup     from '@/components/admin/FieldGroup'
import RecordRow      from '@/components/admin/RecordRow'
import { useCrud }    from '@/hooks/useCrud'
import { supabase }   from '@/lib/supabase'

// ─── Schema ─────────────────────────────────────────────────────────────────
// Table: add_on_services
// Columns: id, service_id (fk -> services), name, description, price, icon,
//          category, is_active, sort_order, created_at

const DEFAULT_FORM = {
  service_id:  '',
  name:        '',
  description: '',
  price:       '',
  icon:        '',
  category:    '',
  sort_order:  0,
  is_active:   true,
}

function transformForSave(form) {
  return {
    ...form,
    price:      form.price !== '' ? Number(form.price) : null,
    sort_order: form.sort_order !== '' ? Number(form.sort_order) : 0,
  }
}

export default function ManageAddons() {
  const crud = useCrud('add_on_services', {
    defaultForm: DEFAULT_FORM,
    orderBy:     'sort_order',
    orderAsc:    true,
  })
  const [services, setServices] = useState([])

  useEffect(() => {
    supabase.from('services').select('id, title').order('title')
      .then(({ data }) => setServices(data || []))
  }, [])

  const serviceOptions = services.map(s => ({ value: s.id, label: s.title }))
  const serviceName = (id) => services.find(s => s.id === id)?.title

  const FIELDS = [
    { name: 'service_id', label: 'Service', type: 'select', required: true, options: serviceOptions },
    { name: 'name',     label: 'Add-on Name',    required: true },
    { name: 'category', label: 'Category', placeholder: 'e.g. Content, Design, Analytics' },
    [
      { name: 'icon', label: 'Icon', placeholder: '🧩' },
      { name: 'sort_order', label: 'Sort Order', type: 'number', min: 0, placeholder: '0' },
    ],
    { name: 'price',    label: 'Price (₹)', type: 'number', min: 0, placeholder: '0' },
    { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
    { name: 'is_active',   label: 'Active',      type: 'checkbox' },
  ]

  const { records: addons, loading, saving, modal, error } = crud
  const isAdd = modal === 'add'

  return (
    <>
      <AdminPageShell
        title="Add-ons"
        count={addons.length}
        action={
          <button onClick={crud.openAdd} className="btn-admin btn-sm">
            + Add Add-on
          </button>
        }
      >
        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : addons.length === 0 ? (
          <EmptyState label="add-on" />
        ) : (
          <div className="space-y-2">
            {addons.map(a => (
              <RecordRow
                key={a.id}
                icon={a.icon || '🧩'}
                title={a.name}
                subtitle={[serviceName(a.service_id), a.category].filter(Boolean).join(' · ')}
                meta={
                  a.price != null ? (
                    <span className="text-sm font-bold text-white">
                      ₹{Number(a.price).toLocaleString('en-IN')}
                    </span>
                  ) : null
                }
                isActive={a.is_active}
                onToggle={() => crud.toggleField(a.id, 'is_active', a.is_active)}
                onEdit={() => crud.openEdit({ ...a, price: a.price ?? '' })}
                onDelete={() => crud.remove(a.id)}
              />
            ))}
          </div>
        )}
      </AdminPageShell>

      <CrudModal
        open={!!modal}
        onClose={crud.closeModal}
        title={isAdd ? 'Add Add-on' : 'Edit Add-on'}
        onSubmit={e => crud.save(e, transformForSave)}
        saving={saving}
        submitLabel={isAdd ? 'Add Add-on' : 'Save Changes'}
        error={error}
      >
        <FieldGroup fields={FIELDS} form={crud.form} onChange={crud.setField} />
      </CrudModal>
    </>
  )
}

function EmptyState({ label }) {
  return (
    <div className="text-center py-20">
      <p className="font-semibold text-sm" style={{ color: 'var(--admin-muted)' }}>
        No {label}s yet
      </p>
      <p className="text-xs mt-1 text-gray-700">Click the button above to add the first one.</p>
    </div>
  )
}
