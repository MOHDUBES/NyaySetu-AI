import { motion } from 'framer-motion'
import { BookOpen, GitCompare, LogOut, Menu, Scale, User as UserIcon, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase, type User } from '../lib/supabase'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/comparison', label: 'Compare Docs', icon: <GitCompare size={15} /> },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    navigate('/')
  }

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

          {/* Desktop CTA / User Profile */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-card border border-surface-border text-xs text-slate-300">
                  <UserIcon size={14} className="text-gold-400" />
                  <span className="max-w-[150px] truncate" title={user.email}>
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="btn-ghost text-xs flex items-center gap-1.5 text-slate-400 hover:text-rose-400"
                  aria-label="Sign out"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link to="/auth" className="btn-ghost text-sm" aria-label="Login to your account">
                  Login
                </Link>
                <Link to="/auth?mode=signup" className="btn-primary text-sm py-2 px-4" aria-label="Sign up for NyaySetu AI">
                  Get Started
                </Link>
              </>
            )}
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
              {user ? (
                <div className="w-full flex items-center justify-between p-2 rounded-xl bg-surface-card border border-surface-border">
                  <span className="text-xs text-slate-300 truncate max-w-[200px]">{user.email}</span>
                  <button
                    onClick={() => { setMobileOpen(false); handleSignOut(); }}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 justify-center">
                    Login
                  </Link>
                  <Link to="/auth?mode=signup" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 justify-center">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  )
}
