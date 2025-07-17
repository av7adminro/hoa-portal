// src/lib/auth.ts
import { supabase } from './supabase'
import type { User } from './supabase'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
  apartment_number: string
}

// Demo users pentru testare
const DEMO_USERS = {
  'admin@asociatia.ro': { 
    password: 'admin123', 
    role: 'admin' as const, 
    full_name: 'Administrator Demo',
    apartment_number: 'Admin'
  },
  'locatar@asociatia.ro': { 
    password: 'locatar123', 
    role: 'tenant' as const,
    full_name: 'Ion Popescu', 
    apartment_number: 'Ap. 15'
  }
};

export class AuthService {
  // Login function
  static async login(credentials: LoginCredentials) {
    try {
      // Check demo users first
      const demoUser = DEMO_USERS[credentials.email as keyof typeof DEMO_USERS];
      if (demoUser && demoUser.password === credentials.password) {
        // Simulate successful login
        const userId = credentials.email === 'admin@asociatia.ro' ? 'admin-123' : 'tenant-456';
        
        // Store user in localStorage
        localStorage.setItem('currentUser', JSON.stringify({
          id: userId,
          email: credentials.email,
          ...demoUser
        }));
        
        return {
          success: true,
          user: { id: userId, email: credentials.email },
          profile: {
            id: userId,
            email: credentials.email,
            full_name: demoUser.full_name,
            apartment_number: demoUser.apartment_number,
            role: demoUser.role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as User
        };
      }

      // If not demo user, return error
      return {
        success: false,
        error: 'Email sau parola incorecte'
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Login failed'
      }
    }
  }

  // Register function (for admins to create tenant accounts)
  static async register(userData: RegisterData) {
    // Demo implementation
    return {
      success: false,
      error: 'Registration is disabled in demo mode'
    };
  }

  // Logout function
  static async logout() {
    try {
      localStorage.removeItem('currentUser');
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Logout failed'
      }
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const storedUser = localStorage.getItem('currentUser');
      
      if (!storedUser) {
        return { success: false, user: null };
      }

      const userData = JSON.parse(storedUser);
      
      return {
        success: true,
        user: { id: userData.id, email: userData.email },
        profile: userData as User
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get current user'
      }
    }
  }

  // Reset password
  static async resetPassword(email: string) {
    // Demo implementation
    return { 
      success: true,
      message: 'Demo mode: Password reset email would be sent to ' + email
    };
  }
}