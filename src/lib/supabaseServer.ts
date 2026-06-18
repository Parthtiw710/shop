import { createClient } from '@supabase/supabase-js'

// Nitro runs on Node.js — process.env is the only way to read server-side vars.
// import.meta.env and globalThis tricks only work in Cloudflare Workers (workerd).
const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    '[supabaseServer] Missing env vars: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Check your .env file.'
  )
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
})

export enum LoginStatus {
  ACTIVE = 'active',
  INCOMPLETE = 'incomplete',
  NOT_FOUND = 'not_found',
  NO_PHONE = 'no_phone',
}

export async function checkUserStatus(params: { email?: string; userId?: string }) {
  const { email, userId } = params
  
  let query = supabaseServer.from('profiles').select('*')
  
  if (email) {
    query = query.eq('email', email)
  } else if (userId) {
    query = query.eq('id', userId)
  } else {
    throw new Error('Either email or userId must be provided')
  }

  const { data: profile, error } = await query.single()

  if (error || !profile) {
    return { status: LoginStatus.NOT_FOUND, profile: null }
  }

  return { status: LoginStatus.ACTIVE, profile }
}

export async function ensureProfile(userId: string, email?: string, phoneNumber?: string) {
  const payload: any = {
    id: userId,
  }
  
  if (email) payload.email = email
  if (phoneNumber) payload.phone = phoneNumber

  const { error } = await supabaseServer.from('profiles').upsert(payload)
  
  if (error) {
    console.error('Error ensuring profile:', error.message)
    throw error
  }
}
