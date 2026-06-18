import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { User, Mail, MapPin, Phone, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/login')({
  component: LoginComponent
})

function LoginComponent() {
  const navigate = useNavigate()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Profile fields
  const [fullName, setFullName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [address, setAddress] = useState('')
  const [profileEmail, setProfileEmail] = useState('')

  // Autocomplete states
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [autocompleteLoading, setAutocompleteLoading] = useState(false)
  const autocompleteRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user.id, session.user.email || '')
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user.id, session.user.email || '')
      } else {
        setFullName('')
        setProfilePhone('')
        setAddress('')
        setProfileEmail('')
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Close suggestions dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Debounce and fetch address suggestions
  useEffect(() => {
    if (address.length < 3) {
      setAddressSuggestions([])
      return
    }

    const isExactMatch = addressSuggestions.some(s => s.display_name === address)
    if (isExactMatch) return

    const delayDebounce = setTimeout(async () => {
      setAutocompleteLoading(true)
      try {
        const res = await fetch(`/api/address/autocomplete?query=${encodeURIComponent(address)}`)
        const data = await res.json()
        if (res.ok) {
          setAddressSuggestions(data)
          setShowSuggestions(true)
        }
      } catch (e) {
        console.error('Autocomplete fetch error:', e)
      } finally {
        setAutocompleteLoading(false)
      }
    }, 450)

    return () => clearTimeout(delayDebounce)
  }, [address])

  // Fetch profile
  const fetchProfile = async (userId: string, userEmail: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error.message)
      }

      setProfileEmail(userEmail)

      if (data) {
        setFullName(data.full_name || '')
        setProfilePhone(data.phone || '')
        setAddress(data.shipping_address || '')
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Update profile via server-side API and redirect to Home
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    setProfileLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          fullName,
          phone: profilePhone,
          address,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Failed to save profile.')

      setMessage({ type: 'success', text: 'Profile saved successfully! Redirecting...' })
      
      // Delay redirect slightly to show success checkmark
      setTimeout(() => {
        navigate({ to: '/' })
      }, 1000)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save profile.' })
    } finally {
      setProfileLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FDFBF7]">
        <div className="w-10 h-10 border-2 border-[#B08B40] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-[85vh] bg-[#FDFBF7] text-[#1F1A16] py-16 px-6 md:px-12 flex items-center justify-center select-none font-sans">
      <div className="w-full max-w-md bg-white border border-[#E6DFD5]/40 rounded-2xl p-8 md:p-10 shadow-sm relative overflow-hidden">
        {/* Subtle Brand Line */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-[#B08B40]"></div>

        {/* Message Banner */}
        {message && (
          <div
            className={`flex items-start gap-3 p-4 rounded-lg text-sm mb-6 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                : 'bg-rose-50 text-rose-800 border border-rose-100'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
            )}
            <span className="leading-snug">{message.text}</span>
          </div>
        )}

        {!session ? (
          /* ================= UNAUTHENTICATED INSTRUCTION VIEW ================= */
          <div className="flex flex-col text-center py-6">
            <span className="font-serif italic text-xs tracking-[0.25em] uppercase text-[#B08B40] mb-2 block">
              — Account Required
            </span>
            <h1 className="font-serif text-2xl font-light tracking-wide uppercase text-[#1F1A16] mb-6">
              SIGN IN TO LAKSHKRITI
            </h1>
            <div className="p-5 border border-amber-200/50 bg-amber-50/30 rounded-xl mb-4 text-left">
              <p className="text-xs text-amber-800/90 leading-relaxed font-semibold uppercase tracking-wider mb-2">
                Action Required
              </p>
              <p className="text-sm text-stone-600 leading-relaxed">
                Please click the **User Profile** icon at the top right of the navigation header to sign in with Google. 
              </p>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Once you log in, you will be redirected here to fill out your details.
            </p>
          </div>
        ) : (
          /* ================= PROFILE SETUP FORM ================= */
          <div className="flex flex-col">
            <div className="text-center mb-8">
              <span className="font-serif italic text-xs tracking-[0.25em] uppercase text-[#B08B40] mb-2 block">
                — Setup
              </span>
              <h1 className="font-serif text-2xl font-light tracking-wide uppercase text-[#1F1A16]">
                COMPLETE YOUR PROFILE
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                Please provide your contact and shipping information.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fullName" className="text-xs uppercase tracking-widest font-semibold text-[#B08B40]">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    id="fullName"
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full py-3.5 pl-12 pr-4 bg-stone-50/50 border border-stone-200 focus:border-[#B08B40] rounded-xl text-sm outline-none transition-colors duration-300"
                  />
                </div>
              </div>

              {/* Email (Read-Only) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-semibold text-stone-400">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                  <input
                    type="email"
                    disabled
                    value={profileEmail}
                    className="w-full py-3.5 pl-12 pr-4 bg-stone-100 border border-stone-200 rounded-xl text-sm text-stone-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="phone" className="text-xs uppercase tracking-widest font-semibold text-[#B08B40]">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    id="phone"
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full py-3.5 pl-12 pr-4 bg-stone-50/50 border border-stone-200 focus:border-[#B08B40] rounded-xl text-sm outline-none transition-colors duration-300"
                  />
                </div>
              </div>

              {/* Shipping Address with Autocomplete */}
              <div className="flex flex-col gap-1.5 relative" ref={autocompleteRef}>
                <label htmlFor="address" className="text-xs uppercase tracking-widest font-semibold text-[#B08B40]">
                  Shipping Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-4 h-4 text-stone-400" />
                  <textarea
                    id="address"
                    required
                    rows={3}
                    placeholder="Enter complete shipping address..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full py-3.5 pl-12 pr-10 bg-stone-50/50 border border-stone-200 focus:border-[#B08B40] rounded-xl text-sm outline-none transition-colors duration-300 resize-none font-sans"
                  />
                  {autocompleteLoading && (
                    <Loader2 className="absolute right-4 top-4 w-4 h-4 animate-spin text-stone-400" />
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {showSuggestions && addressSuggestions.length > 0 && (
                  <div className="absolute top-[100%] left-0 w-full bg-white border border-[#E6DFD5] rounded-xl shadow-lg mt-1 z-50 overflow-hidden max-h-56 overflow-y-auto">
                    {addressSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAddress(suggestion.display_name)
                          setShowSuggestions(false)
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-[#FDFBF7] hover:text-[#B08B40] transition-colors duration-200 text-xs text-stone-700 border-b border-[#E6DFD5]/40 font-medium"
                      >
                        {suggestion.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full py-4 bg-[#B08B40] hover:bg-[#96722D] text-white font-semibold text-sm tracking-widest uppercase rounded-xl transition-all duration-300 cursor-pointer shadow-sm disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              >
                {profileLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Complete Profile & Continue</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
