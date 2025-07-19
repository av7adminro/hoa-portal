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
  phone?: string
  persons_in_care?: number
  profile_picture?: string
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
  category: 'monthly_fee' | 'utilities' | 'maintenance' | 'other'
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  due_date: string
  paid_date?: string
  payment_method?: 'cash' | 'bank_transfer' | 'card' | 'other'
  transaction_id?: string
  invoice_url?: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  target_audience: 'all' | 'admins' | 'tenants' | 'specific'
  target_users?: string[]
  created_by?: string
  read_by: string[]
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface MaintenanceRequest {
  id: string
  user_id: string
  title: string
  description: string
  category: 'plumbing' | 'electrical' | 'heating' | 'cleaning' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  assigned_to?: string
  location: string
  estimated_cost?: number
  actual_cost?: number
  completion_date?: string
  created_at: string
  updated_at: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  author_id?: string
  category: 'general' | 'maintenance' | 'event' | 'urgent'
  priority: 'low' | 'normal' | 'high'
  target_audience: 'all' | 'tenants' | 'owners'
  publish_date: string
  expires_at?: string
  is_published: boolean
  views_count: number
  created_at: string
  updated_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  apartment: string
  subject: string
  message: string
  status: 'new' | 'in_progress' | 'resolved' | 'closed'
  response?: string
  responded_by?: string
  responded_at?: string
  created_at: string
  updated_at: string
}