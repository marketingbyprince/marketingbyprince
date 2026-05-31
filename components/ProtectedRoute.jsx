'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAdmin } from '@/hooks/useAdmin'

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAdmin()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !session) {
      router.push('/admin/login')
    }
  }, [loading, session, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return null

  return children
}
