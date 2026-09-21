import { showAdminToast } from '@/lib/adminToast'

// Supabase/PostgREST returns { error: null } for an update/delete whose
// WHERE clause matched zero rows — including when an RLS policy's USING
// clause silently filters the target row out. Without .select() there is
// no way to tell that apart from a real success, so every write this
// wraps asks for the affected rows back and treats an empty result as a
// failure worth surfacing, not swallowing.
export async function checkedWrite(query, { table, action = 'save' } = {}) {
  const { data, error } = await query.select()

  if (error) {
    showAdminToast(`${action} failed on "${table}": ${error.message}`)
    return { data: null, error }
  }

  if (!data || data.length === 0) {
    const err = { message: `0 rows affected on "${table}". This usually means a Row Level Security policy rejected the write, the record no longer exists, or your admin session has expired — try signing out and back in.` }
    showAdminToast(`${action} failed on "${table}": ${err.message}`)
    return { data: null, error: err }
  }

  return { data, error: null }
}
