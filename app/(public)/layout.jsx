import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import MobileBottomCTA from '@/components/MobileBottomCTA'
import { CurrencyProvider } from '@/context/CurrencyContext'

export default function PublicLayout({ children }) {
  return (
    <CurrencyProvider>
      <Navbar />
      {children}
      <MobileBottomCTA />
      <Footer />
    </CurrencyProvider>
  )
}
