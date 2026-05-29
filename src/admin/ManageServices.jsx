import AdminLayout     from './AdminLayout'
import AdminPageShell from './components/AdminPageShell'
import CrudModal      from './components/CrudModal'
import FieldGroup     from './components/FieldGroup'
import RecordRow      from './components/RecordRow'
import { useCrud }    from './hooks/useCrud'

const DEFAULT_FORM = {
  title:       '',
  description: '',
  pillar:      '',
  icon:        '',
  is_active:   true,
}

const FIELDS = [
  { name: 'title',       label: 'Title',            required: true },
  { name: 'pillar',      label: 'Pillar / Category', placeholder: 'e.g. SEO, Social Media' },
  { name: 'icon',        label: 'Icon',              placeholder: '📌' },
  { name: 'description', label: 'Description',       type: 'textarea', rows: 3 },
  { name: 'is_active',   label: 'Active',            type: 'checkbox' },
]

export default function ManageServices() {
  const crud = useCrud('services', {
    defaultForm: DEFAULT_FORM,
    orderBy:     'pillar',
    orderAsc:    true,
  })

  const { records: services, loading, saving, modal, error } = crud
  const isAdd = modal === 'add'

  return (
    <AdminLayout>
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
        onSubmit={e => crud.save(e)}
        saving={saving}
        submitLabel={isAdd ? 'Add Service' : 'Save Changes'}
        error={error}
      >
        <FieldGroup fields={FIELDS} form={crud.form} onChange={crud.setField} />
      </CrudModal>
    </AdminLayout>
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
