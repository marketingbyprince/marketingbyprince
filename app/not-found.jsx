import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '4rem', color: '#FF6933' }}>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <Link href="/" style={{ color: '#FF6933' }}>← Go Home</Link>
    </div>
  )
}
