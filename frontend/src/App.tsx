import { BrowserRouter, Route, Routes } from 'react-router-dom'
import DisclaimerBanner from './components/DisclaimerBanner'
import Navbar from './components/Navbar'
import Auth from './pages/Auth'
import Comparison from './pages/Comparison'
import Dashboard from './pages/Dashboard'
import DocumentAnalysis from './pages/DocumentAnalysis'
import Landing from './pages/Landing'

export default function App() {
  return (
    <BrowserRouter>
      {/* Persistent legal disclaimer — always visible */}
      <DisclaimerBanner />
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analysis/:documentId" element={<DocumentAnalysis />} />
          <Route path="/comparison" element={<Comparison />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
