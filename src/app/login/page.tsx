"use client";

import React, { useState, useEffect } from 'react';
import { AuthService } from '../../lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const result = await AuthService.getCurrentUser();
      if (result.success && result.profile) {
        if (result.profile.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard/locatar');
        }
      }
    };
    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await AuthService.login({ email, password });
      
      if (result.success && result.profile) {
        if (result.profile.role === 'admin') {
          router.push('/dashboard/admin');
        } else if (result.profile.role === 'tenant') {
          router.push('/dashboard/locatar');
        }
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 backdrop-blur-2xl bg-black/20 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">AP</span>
              </div>
              <span className="text-2xl font-bold text-white">
                Asociatia Proprietari
              </span>
            </Link>
            <Link href="/" className="text-white hover:text-blue-400 transition-colors">
              Inapoi acasa
            </Link>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen py-20">
        <div className="max-w-md w-full mx-4">
          <div className="backdrop-blur-2xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Conectare
              </h1>
              <p className="text-white">
                Acceseaza contul tau de asociatie
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-100 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white placeholder-white focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300"
                  placeholder="Introduceti email-ul"
                  required
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Parola
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white placeholder-white focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300"
                  placeholder="Introduceti parola"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Se conecteaza...' : 'Conecteaza-te'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/20">
              <h3 className="text-white font-medium mb-4 text-center">
                Conturi demo disponibile:
              </h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-white font-medium">Administrator</p>
                  <p className="text-white">Email: admin@asociatia.ro</p>
                  <p className="text-white">Parola: admin123</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-white font-medium">Locatar</p>
                  <p className="text-white">Email: locatar@asociatia.ro</p>
                  <p className="text-white">Parola: locatar123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}