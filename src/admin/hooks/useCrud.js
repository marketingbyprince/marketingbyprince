import { useState, useEffect, useCallback } from 'react'
import { supabaseAdmin } from '../../lib/supabase'

/**
 * Generic CRUD hook for admin manage pages.
 *
 * @param {string} table            - Supabase table name
 * @param {object} options
 * @param {object} options.defaultForm  - Initial blank form values
 * @param {string} [options.orderBy]    - Column to sort by (default: 'created_at')
 * @param {boolean} [options.orderAsc]  - Sort direction (default: false = DESC)
 * @param {string} [options.select]     - Supabase select string (default: '*')
 */
export function useCrud(table, {
  defaultForm,
  orderBy  = 'created_at',
  orderAsc = false,
  select   = '*',
} = {}) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [modal,   setModal]   = useState(null)   // null | 'add' | record object
  const [form,    setFormState] = useState(defaultForm)
  const [error,   setError]   = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data, error: fetchErr } = await supabaseAdmin
      .from(table)
      .select(select)
      .order(orderBy, { ascending: orderAsc })
    if (!fetchErr) setRecords(data || [])
    setLoading(false)
  }, [table, select, orderBy, orderAsc])

  useEffect(() => { refetch() }, [refetch])

  // Open add modal with a fresh blank form
  const openAdd = useCallback(() => {
    setFormState({ ...defaultForm })
    setError(null)
    setModal('add')
  }, [defaultForm])

  // Open edit modal pre-filled with the record.
  // Pass a transformForEdit(record) if you need to convert DB values
  // (e.g. arrays → newline strings) before displaying in the form.
  const openEdit = useCallback((record) => {
    setFormState({ ...record })
    setError(null)
    setModal(record)
  }, [])

  const closeModal = useCallback(() => {
    setModal(null)
    setError(null)
  }, [])

  // Update a single field in the live form
  const setField = useCallback((key, value) => {
    setFormState(prev => ({ ...prev, [key]: value }))
  }, [])

  /**
   * Save the current form to Supabase.
   * @param {Event}    e          - Form submit event (will be prevented)
   * @param {Function} [transform] - Optional (form) => payload mapper called
   *                                 before sending to Supabase. Use to coerce
   *                                 types, split textarea strings into arrays, etc.
   */
  const save = useCallback(async (e, transform) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = transform ? transform(form) : form

    // Strip server-managed columns before writing
    const { id, created_at, updated_at, ...cleanPayload } = payload

    let supabaseError
    if (modal === 'add') {
      const { error: err } = await supabaseAdmin.from(table).insert([cleanPayload])
      supabaseError = err
    } else {
      const { error: err } = await supabaseAdmin
        .from(table)
        .update(cleanPayload)
        .eq('id', modal.id)
      supabaseError = err
    }

    if (supabaseError) {
      setError(supabaseError.message)
      setSaving(false)
      return
    }

    await refetch()
    setModal(null)
    setSaving(false)
  }, [form, modal, table, refetch])

  // Delete a record with confirm prompt
  const remove = useCallback(async (id) => {
    if (!confirm('Delete this record? This cannot be undone.')) return
    const { error: err } = await supabaseAdmin.from(table).delete().eq('id', id)
    if (err) { setError(err.message); return }
    setRecords(prev => prev.filter(r => r.id !== id))
  }, [table])

  // Toggle a boolean column in-place (optimistic update)
  const toggleField = useCallback(async (id, field, currentValue) => {
    const next = !currentValue
    setRecords(prev => prev.map(r => r.id === id ? { ...r, [field]: next } : r))
    const { error: err } = await supabaseAdmin
      .from(table)
      .update({ [field]: next })
      .eq('id', id)
    if (err) {
      // Revert on failure
      setRecords(prev => prev.map(r => r.id === id ? { ...r, [field]: currentValue } : r))
      setError(err.message)
    }
  }, [table])

  return {
    records,
    loading,
    saving,
    modal,
    form,
    error,
    openAdd,
    openEdit,
    closeModal,
    setField,
    save,
    remove,
    toggleField,
    refetch,
  }
}
