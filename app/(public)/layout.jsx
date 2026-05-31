import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import MobileBottomCTA from '@/components/MobileBottomCTA'

export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <MobileBottomCTA />
      <Footer />
    </>
  )
}
