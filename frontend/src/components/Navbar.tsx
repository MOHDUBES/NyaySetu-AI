import { motion } from 'framer-motion'
import { Check, Edit2, GitCompare, LogOut, Menu, Scale, User as UserIcon, X } from 'lucide-react'
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
  const [customName, setCustomName] = useState<string>('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')

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

  useEffect(() => {
    if (user?.id) {
      try {
        const saved = localStorage.getItem(`nyaysetu_user_name_${user.id}`)
        if (saved) {
          setCustomName(saved)
        } else {
          setCustomName('')
        }
      } catch {}
    }
  }, [user])

  const getDisplayName = () => {
    if (!user) return ''
    if (customName.trim()) return customName.trim()

    const metaName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.user_name ||
      user.user_metadata?.display_name ||
      user.user_metadata?.first_name

    if (metaName && typeof metaName === 'string' && metaName.trim()) {
      return metaName.trim()
    }

    if (user.email) {
      const username = user.email.split('@')[0]
      let cleaned = username.replace(/[._+-]+/g, ' ').trim()

      const noTrailingNums = cleaned.replace(/\d+$/, '').trim()
      if (noTrailingNums.length >= 2) {
        cleaned = noTrailingNums
      }

      cleaned = cleaned.replace(/([a-z])([A-Z])/g, '$1 $2')

      const formatted = cleaned
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')

      if (formatted) return formatted
      return username
    }

    return 'User'
  }

  const handleStartEdit = () => {
    setNameInput(getDisplayName())
    setIsEditingName(true)
  }

  const handleSaveName = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!user) return
    const trimmed = nameInput.trim()
    if (!trimmed) {
      setIsEditingName(false)
      return
    }

    setCustomName(trimmed)
    setIsEditingName(false)
    try {
      localStorage.setItem(`nyaysetu_user_name_${user.id}`, trimmed)
      await supabase.auth.updateUser({
        data: { full_name: trimmed },
      })
    } catch (err) {
      console.warn('Failed to update name in Supabase:', err)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setCustomName('')
    setIsEditingName(false)
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
                {isEditingName ? (
                  <form onSubmit={handleSaveName} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-surface-card border border-gold-500/50 text-white focus:outline-none focus:ring-1 focus:ring-gold-400 w-32"
                      placeholder="Your Name"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="p-1.5 rounded-md bg-gold-500 text-surface-bg hover:bg-gold-400 transition-colors"
                      title="Save Name"
                      aria-label="Save Name"
                    >
                      <Check size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingName(false)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-white transition-colors"
                      title="Cancel"
                      aria-label="Cancel editing"
                    >
                      <X size={13} />
                    </button>
                  </form>
                ) : (
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-card border border-surface-border text-xs text-slate-200 transition-all"
                    title={user.email ? `Email: ${user.email} (Click pencil to edit name)` : undefined}
                  >
                    <UserIcon size={14} className="text-gold-400 shrink-0" />
                    <span className="max-w-[140px] truncate font-medium">
                      {getDisplayName()}
                    </span>
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="text-slate-500 hover:text-gold-400 transition-colors p-0.5 ml-0.5"
                      title="Edit your display name"
                      aria-label="Edit display name"
                    >
                      <Edit2 size={11} />
                    </button>
                  </div>
                )}
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
                <div className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface-card border border-surface-border">
                  <div className="flex items-center gap-2 truncate">
                    <UserIcon size={14} className="text-gold-400 shrink-0" />
                    <span className="text-xs text-slate-200 font-medium truncate max-w-[180px]" title={user.email}>
                      {getDisplayName()}
                    </span>
                  </div>
                  <button
                    onClick={() => { setMobileOpen(false); handleSignOut(); }}
                    className="text-xs text-rose-400 hover:underline shrink-0"
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
