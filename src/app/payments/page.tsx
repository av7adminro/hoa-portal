"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthService } from '../../lib/auth';
import type { User } from '../../lib/supabase';
import PaymentForm from '../../components/payments/PaymentForm';
import PaymentsList from '../../components/payments/PaymentsList';

export default function PaymentsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    const result = await AuthService.getCurrentUser();
    if (!result.success || !result.profile) {
      router.push('/login');
      return;
    }
    setUser(result.profile);
  }, [router]);

  const handleLogout = async () => {
    await AuthService.logout();
    router.push('/login');
  };

  const handlePaymentComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/locatar'}>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer">
                  <span className="text-white font-bold text-lg">←</span>
                </div>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  <span className="text-yellow-300">💰</span> Plăți
                </h1>
                <p className="text-white/80 mt-1">Gestionarea plăților și facturilor</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-white/60">{user?.role === 'admin' ? 'Administrator' : 'Locatar'}</p>
                <p className="font-medium text-white">{user?.full_name}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <span className="text-white font-bold">⚡</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form - Only for admins */}
          {user?.role === 'admin' && (
            <div className="lg:col-span-1">
              <div className="sticky top-32">
                <PaymentForm onPaymentComplete={handlePaymentComplete} />
              </div>
            </div>
          )}
          
          {/* Payments List */}
          <div className={user?.role === 'admin' ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <PaymentsList refreshTrigger={refreshTrigger} userRole={user?.role} />
          </div>
        </div>
      </div>
    </div>
  );
}