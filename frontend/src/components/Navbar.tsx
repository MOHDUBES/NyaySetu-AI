import { motion } from 'framer-motion'
import { BookOpen, GitCompare, Menu, Scale, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/comparison', label: 'Compare Docs', icon: <GitCompare size={15} /> },
]

export default function Navbar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav
      className="sticky top-[37px] z-40 w-full glass border-b border-surface-border"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-gold-400 rounded-lg px-1"
            aria-label="NyaySetu AI — Home"
          >
            <div className="p-1.5 bg-gold-gradient rounded-lg shadow-glow">
              <Scale size={18} className="text-navy-900" aria-hidden="true" />
            </div>
            <span className="font-display font-bold text-lg">
              <span className="text-gradient">NyaySetu</span>
              <span className="text-slate-300"> AI</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
                  ${location.pathname === link.href
                    ? 'bg-gold-500/15 text-gold-400'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                aria-current={location.pathname === link.href ? 'page' : undefined}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/auth" className="btn-ghost text-sm" aria-label="Login to your account">
              Login
            </Link>
            <Link to="/auth?mode=signup" className="btn-primary text-sm py-2 px-4" aria-label="Sign up for NyaySetu AI">
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden btn-ghost p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          id="mobile-menu"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-surface-border bg-surface-card px-4 pb-4"
        >
          <div className="flex flex-col gap-1 pt-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium
                  ${location.pathname === link.href
                    ? 'bg-gold-500/15 text-gold-400'
                    : 'text-slate-300 hover:bg-white/5'
                  }`}
                aria-current={location.pathname === link.href ? 'page' : undefined}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 mt-3">
              <Link to="/auth" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 justify-center">
                Login
              </Link>
              <Link to="/auth?mode=signup" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 justify-center">
                Sign Up
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  )
}
