'use client'
import AdminPageShell from '@/components/admin/AdminPageShell'
import CrudModal      from '@/components/admin/CrudModal'
import FieldGroup     from '@/components/admin/FieldGroup'
import RecordRow      from '@/components/admin/RecordRow'
import { useCrud }    from '@/hooks/useCrud'

// ─── Schema ─────────────────────────────────────────────────────────────────
// Table: addons
// Columns: id, title, description, price, icon, category, is_active, created_at

const DEFAULT_FORM = {
  title:       '',
  description: '',
  price:       '',
  icon:        '',
  category:    '',
  is_active:   true,
}

const FIELDS = [
  { name: 'title',    label: 'Title',    required: true },
  { name: 'category', label: 'Category', placeholder: 'e.g. Content, Design, Analytics' },
  { name: 'icon',     label: 'Icon',     placeholder: '🧩' },
  { name: 'price',    label: 'Price (₹)', type: 'number', min: 0, placeholder: '0' },
  { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
  { name: 'is_active',   label: 'Active',      type: 'checkbox' },
]

function transformForSave(form) {
  return {
    ...form,
    price: form.price !== '' ? Number(form.price) : null,
  }
}

export default function ManageAddons() {
  const crud = useCrud('addons', {
    defaultForm: DEFAULT_FORM,
    orderBy:     'category',
    orderAsc:    true,
  })

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
                title={a.title}
                subtitle={a.category}
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
