// Tiny event-based toast bus so any admin module (including hooks and
// shared components that have no toast UI of their own) can surface an
// error without threading toast state through every prop chain. ToastHost
// (mounted once in app/admin/layout.jsx) listens for this event and renders
// it.
export function showAdminToast(message, type = 'error') {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('admin-toast', { detail: { message, type } }))
}
