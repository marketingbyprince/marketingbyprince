import AdminLayout     from './AdminLayout'
import AdminPageShell from './components/AdminPageShell'
import CrudModal      from './components/CrudModal'
import FieldGroup     from './components/FieldGroup'
import RecordRow      from './components/RecordRow'
import { useCrud }    from './hooks/useCrud'

const DEFAULT_FORM = {
  name:       '',
  icon:       '',
  url:        '',
  category:   '',
  sort_order: 0,
  is_active:  true,
}

const FIELDS = [
  { name: 'name',     label: 'Platform Name', required: true },
  { name: 'category', label: 'Category',      placeholder: 'e.g. Social, Advertising, Analytics' },
  [
    { name: 'icon', label: 'Icon',       placeholder: '🌐' },
    { name: 'sort_order', label: 'Sort Order', type: 'number', min: 0, placeholder: '0' },
  ],
  { name: 'url',       label: 'Website URL', type: 'url', placeholder: 'https://' },
  { name: 'is_active', label: 'Active',      type: 'checkbox' },
]

function transformForSave(form) {
  return {
    ...form,
    sort_order: form.sort_order !== '' ? Number(form.sort_order) : 0,
  }
}

export default function ManagePlatforms() {
  const crud = useCrud('platforms', {
    defaultForm: DEFAULT_FORM,
    orderBy:     'sort_order',
    orderAsc:    true,
  })

  const { records: platforms, loading, saving, modal, error } = crud
  const isAdd = modal === 'add'

  return (
    <AdminLayout>
      <AdminPageShell
        title="Platforms"
        count={platforms.length}
        action={
          <button onClick={crud.openAdd} className="btn-admin btn-sm">
            + Add Platform
          </button>
        }
      >
        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : platforms.length === 0 ? (
          <EmptyState label="platform" />
        ) : (
          <div className="space-y-2">
            {platforms.map(p => (
              <RecordRow
                key={p.id}
                icon={p.icon || '🌐'}
                title={p.name}
                subtitle={p.category}
                meta={
                  p.url ? (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-xs truncate max-w-[180px] transition-colors hover:text-accent"
                      style={{ color: 'var(--admin-muted)' }}
                    >
                      {p.url.replace(/^https?:\/\//, '')}
                    </a>
                  ) : null
                }
                isActive={p.is_active}
                onToggle={() => crud.toggleField(p.id, 'is_active', p.is_active)}
                onEdit={() => crud.openEdit({ ...p, sort_order: p.sort_order ?? 0 })}
                onDelete={() => crud.remove(p.id)}
              />
            ))}
          </div>
        )}
      </AdminPageShell>

      <CrudModal
        open={!!modal}
        onClose={crud.closeModal}
        title={isAdd ? 'Add Platform' : 'Edit Platform'}
        onSubmit={e => crud.save(e, transformForSave)}
        saving={saving}
        submitLabel={isAdd ? 'Add Platform' : 'Save Changes'}
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
