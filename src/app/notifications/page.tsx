"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthService } from '../../lib/auth';
import type { User } from '../../lib/supabase';
import NotificationForm from '../../components/notifications/NotificationForm';
import NotificationsList from '../../components/notifications/NotificationsList';

export default function NotificationsPage() {
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

  const handleNotificationComplete = () => {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 backdrop-blur-2xl bg-black/20 border-b border-white/20 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/locatar'}>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer">
                  <span className="text-white font-bold text-lg">←</span>
                </div>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  <span className="text-blue-400">🔔</span> Notificări
                </h1>
                <p className="text-white mt-1">Anunțuri și mesaje importante</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-white">{user?.role === 'admin' ? 'Administrator' : 'Locatar'}</p>
                <p className="font-medium text-white">{user?.full_name}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notification Form - Only for admins */}
          {user?.role === 'admin' && (
            <div className="lg:col-span-1">
              <div className="sticky top-32">
                <NotificationForm onNotificationComplete={handleNotificationComplete} />
              </div>
            </div>
          )}
          
          {/* Notifications List */}
          <div className={user?.role === 'admin' ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <NotificationsList refreshTrigger={refreshTrigger} userRole={user?.role} userId={user?.id} />
          </div>
        </div>
      </div>
    </div>
  );
}