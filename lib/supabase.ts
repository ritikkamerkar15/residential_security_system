import { createClient } from '@supabase/supabase-js'

// Create the Supabase client using environment variables
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Check if Supabase is properly configured
export const isSupabaseAvailable = () => {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

// Test connection by querying a real table
export const testSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('residents').select('*').limit(1)
    if (error) {
      console.error("❌ Supabase error:", error.message)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err: any) {
    console.error("❌ Supabase connection failed:", err.message)
    return { success: false, error: err.message }
  }
}

// Safe connection test that catches unexpected errors
export const safeConnectionTest = async () => {
  try {
    return await testSupabaseConnection()
  } catch {
    return { success: false, error: 'Unknown error during safe connection test' }
  }
}

// --- TYPES (copied from your original file for consistency) ---

export interface Resident {
  flat_number: string
  name: string
  phone_number: string
  password: string
  created_at?: string
  updated_at?: string
  family_members?: FamilyMember[]
  temporary_guests?: TemporaryGuest[]
}

export interface FamilyMember {
  id: string
  flat_number: string
  name: string
  phone_number?: string
  relation: string
  age?: number
  identity_proof?: string
  profile_photo?: string
  created_at?: string
}

export interface TemporaryGuest {
  id: string
  flat_number: string
  name: string
  phone_number: string
  check_in: string
  check_out: string
  created_at?: string
}

export interface VisitorRequest {
  id: string
  visitor_name: string
  phone_number: string
  purpose_of_visit: string
  flat_number: string
  resident_name?: string
  visitor_photo?: string
  id_proof?: string
  status: "pending" | "approved" | "rejected" | "left-at-gate"
  checked_by: string
  created_at: string
  updated_at?: string
}

export interface Guard {
  id: string
  employee_id: string
  name: string
  shift: "morning" | "evening" | "night"
  phone_number: string
  password: string
  status: "on-duty" | "off-duty"
  check_in_time?: string
  created_at?: string
  updated_at?: string
}

export interface Admin {
  id: string
  admin_id: string
  name: string
  password: string
  created_at?: string
}
