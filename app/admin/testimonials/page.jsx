'use client'
import AdminPageShell from '@/components/admin/AdminPageShell'
import CrudModal      from '@/components/admin/CrudModal'
import FieldGroup     from '@/components/admin/FieldGroup'
import RecordRow      from '@/components/admin/RecordRow'
import { useCrud }    from '@/hooks/useCrud'

const DEFAULT_FORM = {
  name: '', role: '', company: '', quote: '', avatar_url: '', rating: 5, sort_order: 0, is_active: true,
}

const FIELDS = [
  { name: 'name', label: 'Name', required: true },
  [
    { name: 'role', label: 'Role' },
    { name: 'company', label: 'Company' },
  ],
  { name: 'quote', label: 'Quote', required: true, type: 'textarea', rows: 4 },
  { name: 'avatar_url', label: 'Avatar Image URL', type: 'url' },
  [
    { name: 'rating', label: 'Rating (1-5)', type: 'number', min: 1, max: 5 },
    { name: 'sort_order', label: 'Sort Order', type: 'number', min: 0 },
  ],
  { name: 'is_active', label: 'Active', type: 'checkbox' },
]

function transformForSave(form) {
  return {
    ...form,
    rating: form.rating !== '' ? Number(form.rating) : null,
    sort_order: form.sort_order !== '' ? Number(form.sort_order) : 0,
  }
}

export default function ManageTestimonials() {
  const crud = useCrud('testimonials', { defaultForm: DEFAULT_FORM, orderBy: 'sort_order', orderAsc: true })
  const { records: testimonials, loading, saving, modal, error } = crud
  const isAdd = modal === 'add'

  return (
    <>
      <AdminPageShell
        title="Testimonials"
        count={testimonials.length}
        action={<button onClick={crud.openAdd} className="btn-admin btn-sm">+ Add Testimonial</button>}
      >
        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : testimonials.length === 0 ? (
          <p className="text-sm text-gray-500 admin-card rounded-xl px-5 py-8 text-center">No testimonials yet.</p>
        ) : (
          <div className="space-y-2">
            {testimonials.map(t => (
              <RecordRow
                key={t.id}
                icon="💬"
                title={t.name}
                subtitle={[t.role, t.company].filter(Boolean).join(', ')}
                isActive={t.is_active}
                onToggle={() => crud.toggleField(t.id, 'is_active', t.is_active)}
                onEdit={() => crud.openEdit({ ...t, rating: t.rating ?? 5, sort_order: t.sort_order ?? 0 })}
                onDelete={() => crud.remove(t.id)}
              />
            ))}
          </div>
        )}
      </AdminPageShell>

      <CrudModal
        open={!!modal}
        onClose={crud.closeModal}
        title={isAdd ? 'Add Testimonial' : 'Edit Testimonial'}
        onSubmit={e => crud.save(e, transformForSave)}
        saving={saving}
        submitLabel={isAdd ? 'Add Testimonial' : 'Save Changes'}
        error={error}
        size="lg"
      >
        <FieldGroup fields={FIELDS} form={crud.form} onChange={crud.setField} />
      </CrudModal>
    </>
  )
}
