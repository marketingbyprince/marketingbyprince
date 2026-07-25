'use client'
import AdminPageShell from '@/components/admin/AdminPageShell'
import CrudModal      from '@/components/admin/CrudModal'
import FieldGroup     from '@/components/admin/FieldGroup'
import RecordRow      from '@/components/admin/RecordRow'
import { useCrud }    from '@/hooks/useCrud'
import { SERVICE_PILLARS } from '@/lib/servicePillars'

const DEFAULT_FORM = {
  title:       '',
  slug:        '',
  description: '',
  pillar:      SERVICE_PILLARS[0],
  icon:        '',
  is_active:   true,
}

const FIELDS = [
  { name: 'title',       label: 'Title',            required: true },
  {
    name: 'slug', label: 'URL Slug', required: true,
    placeholder: 'performance-marketing', hint: 'Used as /services/slug — lowercase, hyphenated',
  },
  { name: 'pillar',      label: 'Pillar', type: 'select', required: true, options: SERVICE_PILLARS },
  { name: 'icon',        label: 'Icon',              placeholder: '📌' },
  { name: 'description', label: 'Description',       type: 'textarea', rows: 3 },
  { name: 'is_active',   label: 'Active',            type: 'checkbox' },
]

function slugify(str) {
  return str.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
}

function transformForSave(form) {
  return { ...form, slug: slugify(form.slug || form.title) }
}

export default function ManageServices() {
  const crud = useCrud('services', {
    defaultForm: DEFAULT_FORM,
    orderBy:     'pillar',
    orderAsc:    true,
  })

  const { records: services, loading, saving, modal, error } = crud
  const isAdd = modal === 'add'

  return (
    <>
      <AdminPageShell
        title="Services"
        count={services.length}
        action={
          <button onClick={crud.openAdd} className="btn-admin btn-sm">
            + Add Service
          </button>
        }
      >
        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : services.length === 0 ? (
          <EmptyState label="service" />
        ) : (
          <div className="space-y-2">
            {services.map(s => (
              <RecordRow
                key={s.id}
                icon={s.icon || '📌'}
                title={s.title}
                subtitle={s.pillar}
                isActive={s.is_active}
                onToggle={() => crud.toggleField(s.id, 'is_active', s.is_active)}
                onEdit={() => crud.openEdit(s)}
                onDelete={() => crud.remove(s.id)}
              />
            ))}
          </div>
        )}
      </AdminPageShell>

      <CrudModal
        open={!!modal}
        onClose={crud.closeModal}
        title={isAdd ? 'Add Service' : 'Edit Service'}
        onSubmit={e => crud.save(e, transformForSave)}
        saving={saving}
        submitLabel={isAdd ? 'Add Service' : 'Save Changes'}
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
