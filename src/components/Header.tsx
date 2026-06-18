import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation, useSearch } from '@tanstack/react-router'
import { useGoogleLogin } from '@react-oauth/google'
import { useSelector } from '@tanstack/react-store'
import { ShoppingBag, User, LogOut, ChevronDown, Loader2, Menu, X } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { cartStore, openCart } from '../lib/cart-store'
import exclusiveProducts from '../lib/exclusiveProducts.json'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const cartItems = useSelector(cartStore, (s) => s.items)
  const search = useSearch({ strict: false }) as { productId?: string }

  const isExclusive = (() => {
    if (location.pathname === '/exclusive-collection') return true
    if (location.pathname === '/checkout') {
      if (search.productId) {
        return exclusiveProducts.some((ex) => ex.id === search.productId)
      }
      return cartItems.length > 0 && cartItems.every((item) => {
        return item.isExclusive || exclusiveProducts.some((ex) => ex.id === item.id)
      })
    }
    if (location.pathname === '/cart') {
      return cartItems.length > 0 && cartItems.every((item) => {
        return item.isExclusive || exclusiveProducts.some((ex) => ex.id === item.id)
      })
    }
    return false
  })()

  const [session, setSession] = useState<any>(null)

  const [profile, setProfile] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const cartCount = useSelector(cartStore, (s) =>
    s.items.reduce((n, i) => n + i.quantity, 0)
  )

  // Listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (data) {
        setProfile(data)
        // If profile is incomplete, redirect to setup page
        if (!data.full_name || !data.phone || !data.shipping_address) {
          navigate({ to: '/login' })
        }
      } else {
        // Redirect to setup page if no profile exists
        navigate({ to: '/login' })
      }
    } catch (err) {
      console.error('Error fetching header profile:', err)
      navigate({ to: '/login' })
    }
  }

  // Google Login popup and server exchange
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setAuthLoading(true)
      setMenuOpen(false)
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'Google authentication failed')

        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        })
        if (sessionError) throw sessionError
      } catch (err: any) {
        console.error('Google SSO Error:', err)
      } finally {
        setAuthLoading(false)
      }
    },
    onError: (err) => {
      console.error('Google OAuth failed:', err)
    }
  })

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setMenuOpen(false)
    navigate({ to: '/' })
  }

  return (
    <header className={`sticky top-0 z-50 border-b fluid-header transition-all duration-700 ease-in-out ${isExclusive
      ? 'border-[#B08B40]/20 bg-[#1F1A16] text-[#E5D5B8]'
      : 'border-[#E6DFD5]/40 bg-[#FDF8EB]/90 backdrop-blur-md'
      }`}>
      <nav className="max-w-7xl mx-auto px-6 md:px-10 h-24 flex items-center justify-between gap-4">

        {/* Left Side: Brand Logo */}
        <div className="flex items-center flex-shrink-0">
          <Link
            to="/"
            className={`font-script text-3xl md:text-4xl hover:text-[#B08B40] transition-all duration-700 ease-in-out no-underline tracking-normal select-none relative flex items-baseline whitespace-nowrap ${isExclusive ? 'text-[#E5D5B8]' : 'text-[#B08B40]'
              }`}
          >
            <span>LakshKriti</span>
            <span
              className={`absolute left-full ml-2 font-script text-2xl md:text-3xl tracking-normal normal-case transition-all duration-700 ease-in-out whitespace-nowrap ${isExclusive
                ? 'opacity-95 translate-x-0'
                : 'opacity-0 -translate-x-4 pointer-events-none'
                }`}
            >
              Exclusive
            </span>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-10 justify-center flex-1">
          <Link
            to="/products"
            className={`font-sans text-[11px] lg:text-[13px] font-semibold tracking-[0.18em] uppercase hover:text-[#B08B40] transition-all duration-700 ease-in-out no-underline relative py-2 group whitespace-nowrap ${isExclusive ? 'text-[#E5D5B8]' : 'nav-link-custom'
              }`}
            activeProps={{ className: isExclusive ? 'text-[#B08B40]' : 'nav-link-custom-active' }}
          >
            Products
            <span className={`absolute bottom-0 left-0 w-full h-[1.5px] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-in-out origin-left ${isExclusive ? 'bg-[#E5D5B8]' : 'bg-[#B08B40]'
              }`} />
          </Link>
          <Link
            to="/exclusive-collection"
            className={`font-sans text-[11px] lg:text-[13px] font-semibold tracking-[0.18em] uppercase hover:text-[#B08B40] transition-all duration-700 ease-in-out no-underline relative py-2 group whitespace-nowrap ${isExclusive ? 'text-[#E5D5B8]' : 'nav-link-custom'
              }`}
            activeProps={{ className: isExclusive ? 'text-[#B08B40]' : 'nav-link-custom-active' }}
          >
            Exclusive
            <span className={`absolute bottom-0 left-0 w-full h-[1.5px] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-in-out origin-left ${isExclusive ? 'bg-[#E5D5B8]' : 'bg-[#B08B40]'
              }`} />
          </Link>
          <Link
            to="/"
            hash="story"
            className={`font-sans text-[11px] lg:text-[13px] font-semibold tracking-[0.18em] uppercase hover:text-[#B08B40] transition-all duration-700 ease-in-out no-underline relative py-2 group whitespace-nowrap ${isExclusive ? 'text-[#E5D5B8]' : 'nav-link-custom'
              }`}
          >
            About
            <span className={`absolute bottom-0 left-0 w-full h-[1.5px] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-in-out origin-left ${isExclusive ? 'bg-[#E5D5B8]' : 'bg-[#B08B40]'
              }`} />
          </Link>
          <Link
            to="/"
            hash="contact"
            className={`font-sans text-[11px] lg:text-[13px] font-semibold tracking-[0.18em] uppercase hover:text-[#B08B40] transition-all duration-700 ease-in-out no-underline relative py-2 group whitespace-nowrap ${isExclusive ? 'text-[#E5D5B8]' : 'nav-link-custom'
              }`}
          >
            Contact
            <span className={`absolute bottom-0 left-0 w-full h-[1.5px] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-in-out origin-left ${isExclusive ? 'bg-[#E5D5B8]' : 'bg-[#B08B40]'
              }`} />
          </Link>
        </div>



        {/* Right Side: Authentication and Icons */}
        <div className="flex items-center gap-5 md:gap-7 flex-shrink-0 justify-end">

          {/* User / Profile Dropdown Trigger */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`hover:text-[#B08B40] transition-colors duration-700 ease-in-out focus:outline-none cursor-pointer p-1 bg-transparent border-none flex items-center gap-1.5 ${isExclusive ? 'text-[#E5D5B8]' : 'nav-icon-custom'
                }`}
              title="Profile"
            >
              <User className="w-5 h-5 md:w-[22px] md:h-[22px] stroke-[1.2] transition-colors duration-700 ease-in-out" />
              {session && (
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-700 ease-in-out ${isExclusive ? 'text-[#E5D5B8]' : 'nav-icon-custom'
                  } ${menuOpen ? 'rotate-180' : ''}`} />
              )}
            </button>


            {menuOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-white border border-[#E6DFD5]/60 rounded-2xl shadow-lg py-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200 font-sans">
                {session ? (
                  /* ================= LOGGED IN DROP-DOWN VIEW ================= */
                  <>
                    <div className="px-4.5 pb-3 border-b border-[#E6DFD5]/40 mb-2">
                      <p className="text-[10px] text-stone-400 font-bold tracking-wider uppercase">Signed in as</p>
                      <p className="text-sm text-stone-850 font-bold truncate">
                        {profile?.full_name || session.user.email}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-3 px-4.5 py-2.5 text-stone-700 hover:bg-[#FDFBF7] hover:text-[#B08B40] transition-colors duration-200 text-xs font-bold uppercase tracking-wider no-underline"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 px-4.5 py-2.5 text-rose-600 hover:bg-rose-50/50 transition-colors duration-200 text-xs font-bold uppercase tracking-wider border-none bg-none text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  /* ================= LOGGED OUT DROP-DOWN VIEW ================= */
                  <div className="px-4 py-2 flex flex-col items-center text-center gap-3">
                    <button
                      onClick={() => googleLogin()}
                      disabled={authLoading}
                      className="w-full flex items-center justify-center gap-2.5 px-4 py-3 border border-stone-200 hover:border-[#B08B40] hover:bg-stone-50 rounded-xl transition-all duration-300 cursor-pointer font-sans font-semibold uppercase tracking-wider text-xs text-stone-700 disabled:opacity-50 shadow-sm bg-white"
                    >
                      {authLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#B08B40]" />
                      ) : (
                        <img src="/google.png" alt="Google" className="w-[22px] h-[22px] object-contain" />
                      )}
                      <span>Continue with Google</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Button */}
          <button
            onClick={openCart}
            className={`hover:text-[#B08B40] transition-colors duration-700 ease-in-out focus:outline-none cursor-pointer p-1 relative ${isExclusive ? 'text-[#E5D5B8]' : 'nav-icon-custom'
              }`}
          >
            <ShoppingBag className="w-5 h-5 md:w-[22px] md:h-[22px] stroke-[1.2] transition-colors duration-700 ease-in-out" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#B08B40] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
            <span className="sr-only">Cart</span>
          </button>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileNavOpen(true)}
            className={`md:hidden hover:text-[#B08B40] transition-colors duration-700 ease-in-out focus:outline-none cursor-pointer p-1 bg-transparent border-none ${isExclusive ? 'text-[#E5D5B8]' : 'nav-icon-custom'
              }`}
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6 stroke-[1.2]" />
          </button>
        </div>

      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-[100] md:hidden bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Mobile Drawer Content */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[280px] z-[101] md:hidden shadow-2xl transition-all duration-500 ease-out flex flex-col p-6 font-sans ${isExclusive
            ? 'bg-[#1F1A16] text-[#E5D5B8] border-l border-[#B08B40]/25'
            : 'bg-[#FDF8EB] text-[#1F1A16] border-l border-[#E6DFD5]/40'
          } ${mobileNavOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-6 border-b border-stone-200/10 mb-8">
          <span className="font-script text-2xl text-[#B08B40] select-none">
            LakshKriti
          </span>
          <button
            onClick={() => setMobileNavOpen(false)}
            className={`hover:text-[#B08B40] transition-colors duration-300 focus:outline-none cursor-pointer p-1 rounded-full ${isExclusive ? 'text-[#E5D5B8]/60 hover:text-[#E5D5B8]' : 'text-[#1F1A16]/60 hover:text-[#1F1A16]'
              }`}
          >
            <X className="w-6 h-6 stroke-[1.5]" />
          </button>
        </div>

        {/* Drawer Links */}
        <div className="flex flex-col gap-6">
          <Link
            to="/products"
            onClick={() => setMobileNavOpen(false)}
            className={`text-sm font-semibold tracking-[0.2em] uppercase hover:text-[#B08B40] transition-colors duration-300 no-underline py-2 border-b border-stone-200/10 ${isExclusive ? 'text-[#E5D5B8]' : 'nav-link-custom'
              }`}
            activeProps={{ className: isExclusive ? 'text-[#B08B40] font-bold' : 'nav-link-custom-active font-bold' }}
          >
            Products
          </Link>
          <Link
            to="/exclusive-collection"
            onClick={() => setMobileNavOpen(false)}
            className={`text-sm font-semibold tracking-[0.2em] uppercase hover:text-[#B08B40] transition-colors duration-300 no-underline py-2 border-b border-stone-200/10 ${isExclusive ? 'text-[#E5D5B8]' : 'nav-link-custom'
              }`}
            activeProps={{ className: isExclusive ? 'text-[#B08B40] font-bold' : 'nav-link-custom-active font-bold' }}
          >
            Exclusive
          </Link>
          <Link
            to="/"
            hash="story"
            onClick={() => setMobileNavOpen(false)}
            className={`text-sm font-semibold tracking-[0.2em] uppercase hover:text-[#B08B40] transition-colors duration-300 no-underline py-2 border-b border-stone-200/10 ${isExclusive ? 'text-[#E5D5B8]' : 'nav-link-custom'
              }`}
          >
            About
          </Link>
          <Link
            to="/"
            hash="contact"
            onClick={() => setMobileNavOpen(false)}
            className={`text-sm font-semibold tracking-[0.2em] uppercase hover:text-[#B08B40] transition-colors duration-300 no-underline py-2 border-b border-stone-200/10 ${isExclusive ? 'text-[#E5D5B8]' : 'nav-link-custom'
              }`}
          >
            Contact
          </Link>
        </div>

        {/* Drawer Footer info */}
        <div className="mt-auto pt-6 text-center text-[10px] tracking-[0.1em] uppercase text-stone-400">
          © {new Date().getFullYear()} LakshKriti
        </div>
      </div>
    </header>

  )
}
