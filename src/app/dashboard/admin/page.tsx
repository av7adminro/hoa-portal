"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AuthService } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import type { User } from '../../../lib/supabase';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    apartment_number: '',
    role: 'tenant'
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPayments: 0,
    pendingPayments: 0,
    totalDocuments: 0
  });
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    const result = await AuthService.getCurrentUser();
    if (!result.success || result.profile?.role !== 'admin') {
      router.push('/login');
      return;
    }
    setUser(result.profile);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    checkAuth();
    loadStats();
  }, [checkAuth]);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

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

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await fetch('/api/users');
      const result = await response.json();
      if (result.success) {
        setUsers(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const result = await response.json();
      if (result.success) {
        setUsers(prev => [result.data, ...prev]);
        setNewUser({ email: '', password: '', full_name: '', apartment_number: '', role: 'tenant' });
        setShowAddForm(false);
      } else {
        alert(result.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Failed to add user:', error);
      alert('Failed to create user');
    }
  };

  const handleEditUser = async (userId: string, updatedData: Partial<User>) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      const result = await response.json();
      if (result.success) {
        setUsers(prev => prev.map(u => u.id === userId ? result.data : u));
        setEditingUser(null);
      } else {
        alert(result.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        setUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        alert(result.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
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
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-white text-sm">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Adauga utilizator nou', icon: '👤', action: 'Creeaza cont', color: 'from-blue-500/10 to-cyan-500/10', border: 'border-blue-500/20', tab: 'users' },
          { title: 'Trimite notificare', icon: '📢', action: 'Compune mesaj', color: 'from-purple-500/10 to-pink-500/10', border: 'border-purple-500/20', link: '/notifications' },
          { title: 'Genereaza raport', icon: '📊', action: 'Exporta date', color: 'from-green-500/10 to-emerald-500/10', border: 'border-green-500/20', tab: 'reports' },
          { title: 'Vezi documente', icon: '📄', action: 'Deschide', link: '/documents', color: 'from-indigo-500/10 to-blue-500/10', border: 'border-indigo-500/20' },
          { title: 'Solicitări mentenanță', icon: '🔧', action: 'Gestionează', link: '/maintenance', color: 'from-orange-500/10 to-red-500/10', border: 'border-orange-500/20' }
        ].map((action, index) => (
          <div
            key={index}
            onClick={() => {
              if (action.link) {
                router.push(action.link);
              } else if (action.tab) {
                setActiveTab(action.tab);
              }
            }}
            className={`backdrop-blur-2xl bg-gradient-to-br ${action.color} rounded-2xl p-6 border ${action.border} hover:border-white/30 transition-all duration-300 hover:bg-white/20 group cursor-pointer transform hover:scale-105 shadow-lg hover:shadow-2xl ${action.tab && activeTab === action.tab ? 'ring-2 ring-blue-500' : ''}`}
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
        <h3 className="text-xl font-bold text-white mb-6">Activitati recente</h3>
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
                <p className="text-white">
                  <span className="font-medium">{activity.user}</span>
                  <span className="text-white"> {activity.action}</span>
                </p>
                <p className="text-white text-sm">{activity.time} in urma</p>
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
        <h3 className="text-xl font-bold text-white">Gestionare utilizatori</h3>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:scale-105 transition-all duration-300"
        >
          Adauga utilizator
        </button>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/20">
          <h4 className="text-lg font-bold text-white mb-4">Adauga utilizator nou</h4>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/60"
              required
            />
            <input
              type="password"
              placeholder="Parola"
              value={newUser.password}
              onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/60"
              required
            />
            <input
              type="text"
              placeholder="Nume complet"
              value={newUser.full_name}
              onChange={(e) => setNewUser(prev => ({ ...prev, full_name: e.target.value }))}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/60"
              required
            />
            <input
              type="text"
              placeholder="Apartament"
              value={newUser.apartment_number}
              onChange={(e) => setNewUser(prev => ({ ...prev, apartment_number: e.target.value }))}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/60"
              required
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
            >
              <option value="tenant">Locatar</option>
              <option value="admin">Administrator</option>
            </select>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Salveaza
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Anuleaza
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      {usersLoading ? (
        <div className="text-center text-white py-8">Se incarca utilizatorii...</div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{user.full_name?.charAt(0) || '?'}</span>
                </div>
                <div>
                  <p className="text-white font-medium">{user.full_name} - Ap. {user.apartment_number}</p>
                  <p className="text-white text-sm">{user.role === 'admin' ? 'Administrator' : 'Locatar'} • {user.email}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setEditingUser(user)}
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
                >
                  Editeaza
                </button>
                <button 
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-red-400 hover:text-red-300 transition-colors duration-300"
                >
                  Sterge
                </button>
              </div>
            </div>
          ))}
          {users.length === 0 && !usersLoading && (
            <div className="text-center text-white/60 py-8">Nu sunt utilizatori înregistrați</div>
          )}
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl border border-white/20 max-w-md w-full mx-4">
            <h4 className="text-lg font-bold text-white mb-4">Editeaza utilizator</h4>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleEditUser(editingUser.id, {
                full_name: formData.get('full_name') as string,
                apartment_number: formData.get('apartment_number') as string,
                role: formData.get('role') as 'admin' | 'tenant',
                password: formData.get('password') as string
              });
            }} className="space-y-4">
              <input
                name="full_name"
                type="text"
                placeholder="Nume complet"
                defaultValue={editingUser.full_name}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/60"
                required
              />
              <input
                name="apartment_number"
                type="text"
                placeholder="Apartament"
                defaultValue={editingUser.apartment_number}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/60"
                required
              />
              <select
                name="role"
                defaultValue={editingUser.role}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
              >
                <option value="tenant">Locatar</option>
                <option value="admin">Administrator</option>
              </select>
              <input
                name="password"
                type="password"
                placeholder="Parola noua (lasa gol pentru a pastra parola actuala)"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/60"
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Salveaza
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Anuleaza
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
            <h3 className="text-xl font-bold text-white mb-6">Gestionare documente</h3>
            <p className="text-white mb-6">Administrează toate documentele asociației</p>
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
            <h3 className="text-xl font-bold text-white mb-6">Gestionare plăți</h3>
            <p className="text-white mb-6">Administrează toate plățile și facturile asociației</p>
            <Link
              href="/payments"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-medium hover:scale-105 transition-all duration-300"
            >
              <span className="mr-2">💰</span>
              Vezi toate plățile →
            </Link>
          </div>
        );
      case 'notifications':
        return (
          <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">Gestionare notificări</h3>
            <p className="text-white mb-6">Trimite și administrează notificările pentru locatari</p>
            <Link
              href="/notifications"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:scale-105 transition-all duration-300"
            >
              <span className="mr-2">🔔</span>
              Vezi toate notificările →
            </Link>
          </div>
        );
      case 'reports':
        return (
          <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">Rapoarte si statistici</h3>
            <p className="text-white">Sectiunea pentru rapoarte va fi implementata aici.</p>
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
                Dashboard <span className="text-blue-400">Admin</span>
              </h1>
              <p className="text-white mt-1">Administreaza asociația de proprietari</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-white">Bun venit,</p>
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