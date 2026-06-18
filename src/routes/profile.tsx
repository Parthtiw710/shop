import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { User, Mail, MapPin, Phone, Shield, Edit, LogOut } from 'lucide-react'

export const Route = createFileRoute('/profile')({
  component: ProfileComponent,
})

function ProfileComponent() {
  const navigate = useNavigate()
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
        navigate({ to: '/' }) // Redirect if not authenticated
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
        navigate({ to: '/' })
      }
    })

    return () => subscription.unsubscribe()
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
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate({ to: '/' })
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FDFBF7]">
        <div className="w-10 h-10 border-2 border-[#B08B40] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!session || !profile) return null

  return (
    <div className="min-h-[85vh] bg-[#FDFBF7] text-[#1F1A16] py-16 px-6 md:px-12 flex items-center justify-center font-sans select-none">
      <div className="w-full max-w-lg bg-white border border-[#E6DFD5]/40 rounded-2xl p-8 md:p-10 shadow-sm relative overflow-hidden">
        {/* Subtle Brand Line */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-[#B08B40]"></div>

        <div className="text-center mb-8">
          <span className="font-serif italic text-xs tracking-[0.25em] uppercase text-[#B08B40] mb-2 block">
            — Account Details
          </span>
          <h1 className="font-serif text-3xl font-light tracking-wide uppercase text-[#1F1A16]">
            MY PROFILE
          </h1>
        </div>

        <div className="flex flex-col gap-6">
          {/* Avatar and Role */}
          <div className="flex flex-col items-center gap-3 pb-6 border-b border-[#E6DFD5]/40">
            <div className="w-20 h-20 rounded-full bg-[#B08B40] text-white flex items-center justify-center font-bold text-3xl shadow-md uppercase">
              {profile.full_name ? profile.full_name.slice(0, 2) : (profile.email?.slice(0, 2) || 'U')}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#FDFBF7] border border-[#E6DFD5] rounded-full text-xs font-semibold text-[#B08B40] tracking-wider uppercase">
              <Shield className="w-3.5 h-3.5" />
              <span>Role: {profile.is_admin ? 'Admin' : 'User'}</span>
            </div>
          </div>

          {/* Details list */}
          <div className="flex flex-col gap-4.5">
            {/* Full Name */}
            <div className="flex items-start gap-4">
              <User className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Full Name</p>
                <p className="text-sm font-semibold text-stone-800">{profile.full_name || 'Not provided'}</p>
              </div>
            </div>

            {/* Email Address */}
            <div className="flex items-start gap-4">
              <Mail className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Email Address</p>
                <p className="text-sm font-semibold text-stone-800">{profile.email || 'Not provided'}</p>
              </div>
            </div>

            {/* Mobile Number */}
            <div className="flex items-start gap-4">
              <Phone className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Mobile Number</p>
                <p className="text-sm font-semibold text-stone-800">{profile.phone || 'Not provided'}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="flex items-start gap-4">
              <MapPin className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Shipping Address</p>
                <p className="text-sm font-semibold text-stone-850 leading-relaxed max-w-sm">
                  {profile.shipping_address || 'Not provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-[#E6DFD5]/40">
            <Link
              to="/login"
              className="w-full py-4 bg-[#B08B40] hover:bg-[#96722D] text-white font-semibold text-sm tracking-widest uppercase rounded-xl transition-all duration-300 shadow-sm flex items-center justify-center gap-2 no-underline"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Info</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full py-4 border border-stone-200 hover:border-rose-300 hover:bg-rose-50/50 text-stone-600 hover:text-rose-700 font-semibold text-sm tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer bg-transparent"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
