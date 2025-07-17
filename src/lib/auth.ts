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

export class AuthService {
  // Login function
  static async login(credentials: LoginCredentials) {
    try {
      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (authError) {
        return {
          success: false,
          error: authError.message
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'Login failed'
        };
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        return {
          success: false,
          error: 'Failed to load user profile'
        };
      }

      return {
        success: true,
        user: { id: authData.user.id, email: authData.user.email },
        profile: profile as User
      };

    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }
    }
  }

  // Register function (for admins to create tenant accounts)
  static async register(userData: RegisterData) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
            apartment_number: userData.apartment_number,
            role: 'tenant'
          }
        }
      });

      if (authError) {
        return {
          success: false,
          error: authError.message
        };
      }

      return {
        success: true,
        user: authData.user,
        message: 'User created successfully'
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      }
    }
  }

  // Logout function
  static async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed'
      }
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return { success: false, user: null };
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        return {
          success: false,
          error: 'Failed to load user profile'
        };
      }

      return {
        success: true,
        user: { id: user.id, email: user.email },
        profile: profile as User
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get current user'
      }
    }
  }

  // Reset password
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return { 
        success: true,
        message: 'Password reset email sent to ' + email
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Password reset failed'
      }
    }
  }
}