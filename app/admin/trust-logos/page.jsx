'use client'
import AdminPageShell from '@/components/admin/AdminPageShell'
import CrudModal      from '@/components/admin/CrudModal'
import FieldGroup     from '@/components/admin/FieldGroup'
import RecordRow      from '@/components/admin/RecordRow'
import { useCrud }    from '@/hooks/useCrud'

const TYPE_OPTIONS = [
  { value: 'client', label: 'Client' },
  { value: 'platform', label: 'Platform' },
  { value: 'certification', label: 'Certification' },
  { value: 'partner', label: 'Partner' },
  { value: 'award', label: 'Award' },
]

const DEFAULT_FORM = {
  name: '', logo_url: '', type: 'client', url: '', sort_order: 0, is_active: true,
}

const FIELDS = [
  { name: 'name', label: 'Name', required: true },
  { name: 'logo_url', label: 'Logo Image URL', required: true, type: 'url' },
  [
    { name: 'type', label: 'Type', type: 'select', options: TYPE_OPTIONS, required: true },
    { name: 'sort_order', label: 'Sort Order', type: 'number', min: 0 },
  ],
  { name: 'url', label: 'Outbound Link', type: 'url', placeholder: 'https://... (optional)' },
  { name: 'is_active', label: 'Active', type: 'checkbox' },
]

function transformForSave(form) {
  return { ...form, sort_order: form.sort_order !== '' ? Number(form.sort_order) : 0 }
}

export default function ManageTrustLogos() {
  const crud = useCrud('trust_logos', { defaultForm: DEFAULT_FORM, orderBy: 'type', orderAsc: true })
  const { records: logos, loading, saving, modal, error } = crud
  const isAdd = modal === 'add'

  return (
    <>
      <AdminPageShell
        title="Trust Logos"
        count={logos.length}
        action={<button onClick={crud.openAdd} className="btn-admin btn-sm">+ Add Logo</button>}
      >
        <p className="text-sm text-gray-500 mb-6 -mt-4">
          Clients, platforms, certifications, partners, and awards shown in the homepage Brand Trust section.
        </p>
        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : logos.length === 0 ? (
          <p className="text-sm text-gray-500 admin-card rounded-xl px-5 py-8 text-center">No trust logos yet.</p>
        ) : (
          <div className="space-y-2">
            {logos.map(l => (
              <RecordRow
                key={l.id}
                icon="🏷️"
                title={l.name}
                subtitle={TYPE_OPTIONS.find(t => t.value === l.type)?.label || l.type}
                isActive={l.is_active}
                onToggle={() => crud.toggleField(l.id, 'is_active', l.is_active)}
                onEdit={() => crud.openEdit({ ...l, sort_order: l.sort_order ?? 0 })}
                onDelete={() => crud.remove(l.id)}
              />
            ))}
          </div>
        )}
      </AdminPageShell>

      <CrudModal
        open={!!modal}
        onClose={crud.closeModal}
        title={isAdd ? 'Add Trust Logo' : 'Edit Trust Logo'}
        onSubmit={e => crud.save(e, transformForSave)}
        saving={saving}
        submitLabel={isAdd ? 'Add Logo' : 'Save Changes'}
        error={error}
      >
        <FieldGroup fields={FIELDS} form={crud.form} onChange={crud.setField} />
      </CrudModal>
    </>
  )
}
