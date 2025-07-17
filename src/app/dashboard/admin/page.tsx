"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthService } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPayments: 0,
    pendingPayments: 0,
    totalDocuments: 0
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadStats();
  }, []);

  const checkAuth = async () => {
    const result = await AuthService.getCurrentUser();
    if (!result.success || result.profile?.role !== 'admin') {
      router.push('/login');
      return;
    }
    setUser(result.profile);
    setLoading(false);
  };

  const loadStats = async () => {
    try {
      // Get total users
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get total payments
      const { count: paymentsCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true });

      // Get pending payments
      const { count: pendingCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get total documents
      const { count: documentsCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: usersCount || 0,
        totalPayments: paymentsCount || 0,
        pendingPayments: pendingCount || 0,
        totalDocuments: documentsCount || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = async () => {
    await AuthService.logout();
    router.push('/login');
  };

  const menuItems = [
    { id: 'overview', label: 'Prezentare generala', icon: '📊' },
    { id: 'users', label: 'Utilizatori', icon: '👥' },
    { id: 'documents', label: 'Documente', icon: '📄' },
    { id: 'payments', label: 'Plati', icon: '💳' },
    { id: 'notifications', label: 'Notificari', icon: '🔔' },
    { id: 'reports', label: 'Rapoarte', icon: '📈' }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Utilizatori activi', value: stats.totalUsers, change: '+12%', color: 'from-blue-500 to-cyan-500', icon: '👥' },
          { title: 'Plati totale', value: `€${stats.totalPayments * 245}`, change: '+8%', color: 'from-green-500 to-emerald-500', icon: '💰' },
          { title: 'Plati in asteptare', value: stats.pendingPayments, change: '-5%', color: 'from-orange-500 to-red-500', icon: '⏳' },
          { title: 'Documente', value: stats.totalDocuments, change: '+23%', color: 'from-purple-500 to-pink-500', icon: '📄' }
        ].map((stat, index) => (
          <div
            key={index}
            className="backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 group transform hover:scale-105 shadow-lg hover:shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
              <span className="text-green-400 text-sm font-medium">{stat.change}</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
            <div className="text-gray-600 text-sm">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Adauga utilizator nou', icon: '👤', action: 'Creeaza cont', color: 'from-blue-500/10 to-cyan-500/10', border: 'border-blue-500/20' },
          { title: 'Trimite notificare', icon: '📢', action: 'Compune mesaj', color: 'from-purple-500/10 to-pink-500/10', border: 'border-purple-500/20' },
          { title: 'Genereaza raport', icon: '📊', action: 'Exporta date', color: 'from-green-500/10 to-emerald-500/10', border: 'border-green-500/20' },
          { title: 'Vezi documente', icon: '📄', action: 'Deschide', link: '/documents', color: 'from-indigo-500/10 to-blue-500/10', border: 'border-indigo-500/20' }
        ].map((action, index) => (
          <div
            key={index}
            onClick={() => {
              if (action.link) {
                router.push(action.link);
              }
            }}
            className={`backdrop-blur-2xl bg-gradient-to-br ${action.color} rounded-2xl p-6 border ${action.border} hover:border-white/30 transition-all duration-300 hover:bg-white/20 group cursor-pointer transform hover:scale-105 shadow-lg hover:shadow-2xl`}
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
              {action.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
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
        <h3 className="text-xl font-bold text-gray-800 mb-6">Activitati recente</h3>
        <div className="space-y-4">
          {[
            { user: 'Ana Popescu', action: 'a platit factura pentru aprilie', time: '2 min', type: 'payment', icon: '💳' },
            { user: 'Mihai Ionescu', action: 'a trimis indexul de apa', time: '15 min', type: 'index', icon: '💧' },
            { user: 'Elena Dumitrescu', action: 'a descarcat factura', time: '1 ora', type: 'download', icon: '⬇️' },
            { user: 'Radu Marinescu', action: 'a contactat suportul', time: '2 ore', type: 'support', icon: '💬' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{activity.user.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <p className="text-gray-800">
                  <span className="font-medium">{activity.user}</span>
                  <span className="text-gray-600"> {activity.action}</span>
                </p>
                <p className="text-gray-500 text-sm">{activity.time} in urma</p>
              </div>
              <div className="text-2xl opacity-50">
                {activity.icon}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Gestionare utilizatori</h3>
        <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:scale-105 transition-all duration-300">
          Adauga utilizator
        </button>
      </div>
      <div className="space-y-4">
        {['Ana Popescu - Ap. 12', 'Mihai Ionescu - Ap. 25', 'Elena Dumitrescu - Ap. 8'].map((user, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{user.charAt(0)}</span>
              </div>
              <div>
                <p className="text-gray-800 font-medium">{user}</p>
                <p className="text-gray-500 text-sm">Activ</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="text-blue-600 hover:text-blue-700 transition-colors duration-300">Editeaza</button>
              <button className="text-red-600 hover:text-red-700 transition-colors duration-300">Sterge</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUsers();
      case 'documents':
        return (
          <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Gestionare documente</h3>
            <p className="text-gray-600 mb-6">Administrează toate documentele asociației</p>
            <Link
              href="/documents"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:scale-105 transition-all duration-300"
            >
              <span className="mr-2">📄</span>
              Vezi toate documentele →
            </Link>
          </div>
        );
      case 'payments':
        return (
          <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Gestionare plati</h3>
            <p className="text-gray-600">Sectiunea pentru gestionarea platilor va fi implementata aici.</p>
          </div>
        );
      case 'notifications':
        return (
          <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Gestionare notificari</h3>
            <p className="text-gray-600">Sectiunea pentru trimiterea notificarilor va fi implementata aici.</p>
          </div>
        );
      case 'reports':
        return (
          <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Rapoarte si statistici</h3>
            <p className="text-gray-600">Sectiunea pentru rapoarte va fi implementata aici.</p>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Se incarca...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-br from-pink-200/40 to-orange-200/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-gradient-to-br from-green-200/40 to-blue-200/40 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 backdrop-blur-2xl bg-white/10 border-b border-white/20 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Dashboard <span className="text-blue-600">Admin</span>
              </h1>
              <p className="text-gray-600 mt-1">Administreaza asociația de proprietari</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Bun venit,</p>
                <p className="font-medium text-gray-800">{user?.full_name}</p>
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
                        : 'text-gray-700 hover:text-gray-900 hover:bg-white/20'
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