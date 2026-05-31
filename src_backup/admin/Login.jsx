import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/admin/dashboard')
    })
  }, [navigate])

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      navigate('/admin/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ backgroundColor: 'var(--admin-bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
               style={{ backgroundColor: 'var(--accent)' }}>
            <span className="text-white font-extrabold text-sm">PP</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin Login</h1>
          <p className="text-gray-400 text-sm mt-1">Marketing By Prince</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-card rounded-2xl p-8 space-y-5">
          <div>
            <label className="admin-label">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                   required placeholder="admin@example.com" className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                   required placeholder="••••••••" className="admin-input" />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
                  className="btn-admin btn-lg w-full justify-center disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
