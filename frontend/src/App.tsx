import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import DisclaimerBanner from './components/DisclaimerBanner'
import Navbar from './components/Navbar'

// Code-split route components for optimal performance & instant loading
const Landing = lazy(() => import('./pages/Landing'))
const Auth = lazy(() => import('./pages/Auth'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const DocumentAnalysis = lazy(() => import('./pages/DocumentAnalysis'))
const Comparison = lazy(() => import('./pages/Comparison'))

function RouteFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading page">
      <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Persistent legal disclaimer — always visible */}
      <DisclaimerBanner />
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analysis/:documentId" element={<DocumentAnalysis />} />
            <Route path="/comparison" element={<Comparison />} />
          </Routes>
        </Suspense>
      </main>
    </BrowserRouter>
  )
}
