'use client'
import AdminPageShell from '@/components/admin/AdminPageShell'
import CrudModal      from '@/components/admin/CrudModal'
import FieldGroup     from '@/components/admin/FieldGroup'
import RecordRow      from '@/components/admin/RecordRow'
import { useCrud }    from '@/hooks/useCrud'

// ─── Schema ─────────────────────────────────────────────────────────────────
// Table: service_packages
// Columns: id, name, tier, price, delivery_days, description, features (text[]),
//          is_featured, is_active, created_at

const DEFAULT_FORM = {
  name:          '',
  tier:          'standard',
  price:         '',
  delivery_days: '',
  description:   '',
  features:      '',    // stored as string while editing, converted to array on save
  is_featured:   false,
  is_active:     true,
}

const TIER_OPTIONS = [
  { value: 'starter',  label: 'Starter' },
  { value: 'standard', label: 'Standard' },
  { value: 'premium',  label: 'Premium' },
  { value: 'custom',   label: 'Custom / Enterprise' },
]

// Tier pill colours in the list view
const TIER_COLOR = {
  starter:  'bg-blue-500/10 text-blue-400',
  standard: 'bg-purple-500/10 text-purple-400',
  premium:  'bg-accent/10 text-accent',
  custom:   'bg-yellow-500/10 text-yellow-400',
}

const FIELDS = [
  { name: 'name', label: 'Package Name', required: true },
  { name: 'tier', label: 'Tier', type: 'select', options: TIER_OPTIONS, required: true },
  [
    { name: 'price',         label: 'Price (₹)',     type: 'number', min: 0, placeholder: '0' },
    { name: 'delivery_days', label: 'Delivery (days)', type: 'number', min: 1, placeholder: '7' },
  ],
  { name: 'description', label: 'Short Description', type: 'textarea', rows: 2 },
  {
    name:        'features',
    label:       'Features',
    type:        'textarea',
    rows:        5,
    placeholder: 'One feature per line…',
    hint:        'Each line becomes a separate feature bullet.',
  },
  { name: 'is_featured', label: 'Featured (highlight this package)', type: 'checkbox' },
  { name: 'is_active',   label: 'Active',                            type: 'checkbox' },
]

// Convert DB array → newline string for the textarea
function transformForEdit(record) {
  return {
    ...record,
    price:         record.price         ?? '',
    delivery_days: record.delivery_days ?? '',
    features:      Array.isArray(record.features)
      ? record.features.join('\n')
      : (record.features || ''),
  }
}

// Convert form values back to DB types before saving
function transformForSave(form) {
  return {
    ...form,
    price:         form.price         ? Number(form.price)         : null,
    delivery_days: form.delivery_days ? Number(form.delivery_days) : null,
    features:      typeof form.features === 'string'
      ? form.features.split('\n').map(s => s.trim()).filter(Boolean)
      : (form.features || []),
  }
}

export default function ManagePackages() {
  const crud = useCrud('service_packages', {
    defaultForm: DEFAULT_FORM,
    orderBy:     'tier',
    orderAsc:    true,
  })

  const { records: packages, loading, saving, modal, error } = crud
  const isAdd = modal === 'add'

  return (
    <>
      <AdminPageShell
        title="Packages"
        count={packages.length}
        action={
          <button onClick={crud.openAdd} className="btn-admin btn-sm">
            + Add Package
          </button>
        }
      >
        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : packages.length === 0 ? (
          <EmptyState label="package" />
        ) : (
          <div className="space-y-2">
            {packages.map(p => (
              <RecordRow
                key={p.id}
                title={p.name}
                subtitle={p.description}
                meta={
                  <>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${
                        TIER_COLOR[p.tier] ?? 'bg-white/5 text-gray-400'
                      }`}
                    >
                      {p.tier}
                    </span>
                    {p.price != null && (
                      <span className="text-sm font-bold text-white">
                        ₹{Number(p.price).toLocaleString('en-IN')}
                      </span>
                    )}
                    {p.is_featured && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">
                        ★ Featured
                      </span>
                    )}
                  </>
                }
                isActive={p.is_active}
                onToggle={() => crud.toggleField(p.id, 'is_active', p.is_active)}
                onEdit={() => crud.openEdit(transformForEdit(p))}
                onDelete={() => crud.remove(p.id)}
              />
            ))}
          </div>
        )}
      </AdminPageShell>

      <CrudModal
        open={!!modal}
        onClose={crud.closeModal}
        title={isAdd ? 'Add Package' : 'Edit Package'}
        onSubmit={e => crud.save(e, transformForSave)}
        saving={saving}
        submitLabel={isAdd ? 'Add Package' : 'Save Changes'}
        error={error}
        size="lg"
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
