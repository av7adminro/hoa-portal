// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface User {
  id: string
  email: string
  full_name: string
  apartment_number: string
  role: 'admin' | 'tenant'
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  user_id: string
  title: string
  file_url: string
  file_type: string
  category: 'invoice' | 'document' | 'announcement'
  created_at: string
  updated_at: string
}

export interface WaterIndex {
  id: string
  user_id: string
  month: string
  year: number
  index_value: number
  consumption: number
  created_at: string
}

export interface Payment {
  id: string
  user_id: string
  amount: number
  description: string
  status: 'pending' | 'paid' | 'failed'
  due_date: string
  paid_at?: string
  created_at: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  target_users: string[] // array of user IDs
  created_at: string
  read_by: string[] // array of user IDs who read it
}