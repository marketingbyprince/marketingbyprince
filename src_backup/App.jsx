import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MobileBottomCTA from './components/MobileBottomCTA'
import ProtectedRoute from './components/ProtectedRoute'

// Public pages
import Home from './pages/Home'
import About from './pages/About'
import Services      from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import Gigs from './pages/Gigs'
import GigDetail from './pages/GigDetail'
import Portfolio from './pages/Portfolio'
import CaseStudy from './pages/CaseStudy'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Certifications from './pages/Certifications'
import Contact from './pages/Contact'

// Admin pages
import Login               from './admin/Login'
import Dashboard           from './admin/Dashboard'
import ManageServices      from './admin/ManageServices'
import ManagePackages      from './admin/ManagePackages'
import ManageAddons        from './admin/ManageAddons'
import ManagePlatforms     from './admin/ManagePlatforms'
import ManageGigs          from './admin/ManageGigs'
import ManageCaseStudies   from './admin/ManageCaseStudies'
import ManageArticles      from './admin/ManageArticles'
import ManageCertifications from './admin/ManageCertifications'
import ManageLeads         from './admin/ManageLeads'
import SiteSettings        from './admin/SiteSettings'
import MediaManager        from './admin/MediaManager'
import ManageAbout         from './admin/ManageAbout'

function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <MobileBottomCTA />
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services"      element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/gigs" element={<Gigs />} />
          <Route path="/gigs/:id" element={<GigDetail />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/portfolio/:id" element={<CaseStudy />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/certifications" element={<Certifications />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* Admin routes — no Navbar/Footer */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/services"  element={<ProtectedRoute><ManageServices  /></ProtectedRoute>} />
        <Route path="/admin/packages"  element={<ProtectedRoute><ManagePackages  /></ProtectedRoute>} />
        <Route path="/admin/addons"    element={<ProtectedRoute><ManageAddons    /></ProtectedRoute>} />
        <Route path="/admin/platforms" element={<ProtectedRoute><ManagePlatforms /></ProtectedRoute>} />
        <Route path="/admin/gigs"      element={<ProtectedRoute><ManageGigs      /></ProtectedRoute>} />
        <Route path="/admin/case-studies" element={<ProtectedRoute><ManageCaseStudies /></ProtectedRoute>} />
        <Route path="/admin/articles" element={<ProtectedRoute><ManageArticles /></ProtectedRoute>} />
        <Route path="/admin/certifications" element={<ProtectedRoute><ManageCertifications /></ProtectedRoute>} />
        <Route path="/admin/leads" element={<ProtectedRoute><ManageLeads /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><SiteSettings /></ProtectedRoute>} />
        <Route path="/admin/media"    element={<ProtectedRoute><MediaManager   /></ProtectedRoute>} />
        <Route path="/admin/about"    element={<ProtectedRoute><ManageAbout    /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
