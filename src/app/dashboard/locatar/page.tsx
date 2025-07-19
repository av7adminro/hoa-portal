"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { AuthService } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { User } from '../../../lib/supabase';

export default function TenantDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [waterIndex, setWaterIndex] = useState('');
  const [indexLoading, setIndexLoading] = useState(false);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    const result = await AuthService.getCurrentUser();
    if (!result.success || result.profile?.role !== 'tenant') {
      router.push('/login');
      return;
    }
    setUser(result.profile);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    await AuthService.logout();
    router.push('/login');
  };

  const handleWaterIndexSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIndexLoading(true);
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const currentDate = new Date();
      const month = currentDate.toLocaleString('default', { month: 'long' });
      const year = currentDate.getFullYear();
      
      const { error } = await supabase
        .from('water_indices')
        .insert([
          {
            user_id: user.id,
            month: month,
            year: year,
            index_value: parseInt(waterIndex),
            consumption: 0 // Will be calculated based on previous index
          }
        ]);

      if (error) throw error;
      
      setWaterIndex('');
      alert('Index trimis cu succes!');
    } catch (error: unknown) {
      alert('Eroare la trimiterea indexului: ' + (error instanceof Error ? error.message : 'Eroare necunoscuta'));
    } finally {
      setIndexLoading(false);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Prezentare generala', icon: '🏠' },
    { id: 'payments', label: 'Plati', icon: '💳' },
    { id: 'water-index', label: 'Index apa', icon: '💧' },
    { id: 'documents', label: 'Documente', icon: '📄' },
    { id: 'notifications', label: 'Notificari', icon: '🔔' },
    { id: 'support', label: 'Suport', icon: '💬' }
  ];


  const waterIndexHistory = [
    { month: 'Aprilie 2024', index: '1250', consumption: '45L', status: 'Trimis' },
    { month: 'Martie 2024', index: '1205', consumption: '42L', status: 'Trimis' },
    { month: 'Februarie 2024', index: '1163', consumption: '38L', status: 'Trimis' }
  ];

  // Example documents data (for future use)
  // const _documents = [
  //   { name: 'Factura Mai 2024', type: 'Factura', date: '2024-05-01', size: '245 KB' },
  //   { name: 'PV Adunare Generala', type: 'Document', date: '2024-04-15', size: '1.2 MB' },
  //   { name: 'Regulament intern', type: 'Document', date: '2024-03-10', size: '890 KB' }
  // ];

  // Example notifications data (for future use)
  // const notifications = [
  //   { title: 'Factura pentru mai 2024 este disponibila', time: '2 ore', type: 'billing', icon: '💳' },
  //   { title: 'Amintire: Trimiteti indexul de apa', time: '1 zi', type: 'reminder', icon: '⏰' },
  //   { title: 'Adunarea generala - 15 mai 2024', time: '3 zile', type: 'meeting', icon: '📅' }
  // ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="backdrop-blur-2xl bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-2xl p-6 border border-red-500/20 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm">Sold curent</p>
              <p className="text-2xl font-bold text-white">€241.80</p>
              <p className="text-red-600 text-sm font-medium">Neachitat</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">💳</span>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-blue-500/20 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm">Consum apa</p>
              <p className="text-2xl font-bold text-white">45L</p>
              <p className="text-green-600 text-sm font-medium">Luna aceasta</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">💧</span>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm">Notificari</p>
              <p className="text-2xl font-bold text-white">3</p>
              <p className="text-blue-600 text-sm font-medium">Necitite</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">🔔</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Plateste factura', icon: '💰', action: 'Plateste acum', color: 'from-green-500/10 to-emerald-500/10', border: 'border-green-500/20', link: '/payments' },
          { title: 'Trimite index apa', icon: '📊', action: 'Trimite index', color: 'from-blue-500/10 to-cyan-500/10', border: 'border-blue-500/20' },
          { title: 'Descarca documente', icon: '📥', action: 'Vezi documente', color: 'from-purple-500/10 to-pink-500/10', border: 'border-purple-500/20', link: '/documents' },
          { title: 'Solicitare mentenanță', icon: '🔧', action: 'Creează solicitare', color: 'from-orange-500/10 to-red-500/10', border: 'border-orange-500/20', link: '/maintenance' }
        ].map((action, index) => (
          <div
            key={index}
            onClick={() => {
              if (action.link) {
                router.push(action.link);
              } else if (action.title === 'Trimite index apa') {
                setActiveTab('water-index');
              }
            }}
            className={`backdrop-blur-2xl bg-gradient-to-br ${action.color} rounded-2xl p-6 border ${action.border} hover:border-white/30 transition-all duration-300 hover:bg-white/20 group cursor-pointer transform hover:scale-105 shadow-lg hover:shadow-2xl`}
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
              {action.icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">
              {action.title}
            </h3>
            <button className="text-blue-600 hover:text-blue-700 transition-colors duration-300">
              {action.action} →
            </button>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Activitate recenta</h3>
        <div className="space-y-4">
          {[
            { action: 'Factura mai 2024 generata', time: '2 ore', icon: '📄' },
            { action: 'Index apa aprilie trimis', time: '5 zile', icon: '💧' },
            { action: 'Plata martie procesata', time: '1 saptamana', icon: '✅' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
              <div className="text-2xl">{activity.icon}</div>
              <div className="flex-1">
                <p className="text-white">{activity.action}</p>
                <p className="text-white text-sm">{activity.time} in urma</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );


  const renderWaterIndex = () => (
    <div className="space-y-6">
      {/* Submit New Index */}
      <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Trimite index apa</h3>
        <form onSubmit={handleWaterIndexSubmit} className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">
              Index curent
            </label>
            <input
              type="number"
              value={waterIndex}
              onChange={(e) => setWaterIndex(e.target.value)}
              className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white placeholder-white focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300"
              placeholder="Introduceti valoarea indexului"
              required
            />
          </div>
          <button
            type="submit"
            disabled={indexLoading}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all duration-300 disabled:opacity-50"
          >
            {indexLoading ? 'Se trimite...' : 'Trimite index'}
          </button>
        </form>
      </div>

      {/* Index History */}
      <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Istoric index</h3>
        <div className="space-y-4">
          {waterIndexHistory.map((entry, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">💧</span>
                </div>
                <div>
                  <p className="text-white font-medium">{entry.month}</p>
                  <p className="text-white text-sm">Index: {entry.index}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">{entry.consumption}</p>
                <p className="text-green-600 text-sm font-medium">{entry.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'payments':
        return (
          <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">Plățile mele</h3>
            <p className="text-white mb-6">Vezi și gestionează toate plățile tale</p>
            <Link
              href="/payments"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-medium hover:scale-105 transition-all duration-300"
            >
              <span className="mr-2">💰</span>
              Vezi plățile →
            </Link>
          </div>
        );
      case 'water-index':
        return renderWaterIndex();
      case 'documents':
        return (
          <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">Documentele mele</h3>
            <p className="text-white mb-6">Accesează toate documentele asociației</p>
            <Link
              href="/documents"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium hover:scale-105 transition-all duration-300"
            >
              <span className="mr-2">📄</span>
              Vezi documentele →
            </Link>
          </div>
        );
      case 'notifications':
        return (
          <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">Notificarile mele</h3>
            <p className="text-white mb-6">Gestionează toate notificările și alertele importante</p>
            <Link
              href="/notifications"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-medium hover:scale-105 transition-all duration-300"
            >
              <span className="mr-2">🔔</span>
              Vezi notificările →
            </Link>
          </div>
        );
      case 'support':
        return (
          <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">Suport si ajutor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">📞</span>
                    <h4 className="text-white font-medium">Telefon</h4>
                  </div>
                  <p className="text-white">+40 21 123 456 789</p>
                  <p className="text-white text-sm">Luni - Vineri: 9:00 - 17:00</p>
                </div>
                
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">✉️</span>
                    <h4 className="text-white font-medium">Email</h4>
                  </div>
                  <p className="text-white">suport@asociatia647.ro</p>
                  <p className="text-white text-sm">Raspundem in 24 ore</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-4">Intrebari frecvente</h4>
                <div className="space-y-3">
                  {[
                    'Cum platesc factura online?',
                    'Unde trimit indexul de apa?',
                    'Cum descarc documentele?'
                  ].map((question, index) => (
                    <div key={index} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer">
                      <p className="text-white text-sm">{question}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Se incarca...</p>
        </div>
      </div>
    );
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
            <div>
              <h1 className="text-3xl font-bold text-white">
                Buna ziua, <span className="text-blue-400">{user?.full_name?.split(' ')[0]}!</span>
              </h1>
              <p className="text-white mt-1">Apartament {user?.apartment_number}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-white">Locatar</p>
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20 sticky top-32">
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'text-white hover:text-white hover:bg-white/20'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}