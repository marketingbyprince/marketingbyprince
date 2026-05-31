import { useState, useEffect, useCallback } from 'react'
import { supabase as supabaseAdmin } from '@/lib/supabase'

export function useCrud(table, {
  defaultForm,
  orderBy  = 'created_at',
  orderAsc = false,
  select   = '*',
} = {}) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [modal,   setModal]   = useState(null)
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

  const openAdd = useCallback(() => {
    setFormState({ ...defaultForm })
    setError(null)
    setModal('add')
  }, [defaultForm])

  const openEdit = useCallback((record) => {
    setFormState({ ...record })
    setError(null)
    setModal(record)
  }, [])

  const closeModal = useCallback(() => {
    setModal(null)
    setError(null)
  }, [])

  const setField = useCallback((key, value) => {
    setFormState(prev => ({ ...prev, [key]: value }))
  }, [])

  const save = useCallback(async (e, transform) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = transform ? transform(form) : form
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

  const remove = useCallback(async (id) => {
    if (!confirm('Delete this record? This cannot be undone.')) return
    const { error: err } = await supabaseAdmin.from(table).delete().eq('id', id)
    if (err) { setError(err.message); return }
    setRecords(prev => prev.filter(r => r.id !== id))
  }, [table])

  const toggleField = useCallback(async (id, field, currentValue) => {
    const next = !currentValue
    setRecords(prev => prev.map(r => r.id === id ? { ...r, [field]: next } : r))
    const { error: err } = await supabaseAdmin
      .from(table)
      .update({ [field]: next })
      .eq('id', id)
    if (err) {
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
