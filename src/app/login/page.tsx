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
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResetMessage('');

    try {
      const result = await AuthService.resetPassword(resetEmail);
      
      if (result.success) {
        setResetMessage(result.message || 'Email de resetare trimis cu succes!');
        setResetEmail('');
        setTimeout(() => {
          setShowResetPassword(false);
          setResetMessage('');
        }, 5000);
      } else {
        setError(result.error || 'Eroare la trimiterea email-ului');
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Eroare la resetarea parolei');
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
      <div className="relative z-10 backdrop-blur-2xl bg-black/20 border-b border-white/20 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">AP</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Asociația <span className="text-blue-400">Proprietari</span>
                </h1>
                <p className="text-white mt-1">Conectează-te la contul tău</p>
              </div>
            </div>
            <Link 
              href="/"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-300 hover:scale-105"
            >
              Înapoi acasă
            </Link>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="max-w-md w-full">
            <div className="backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Conectare
                </h2>
                <p className="text-white">
                  Accesează contul tău de asociație
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
                    className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
                    placeholder="Introduceți email-ul"
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
                    className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
                    placeholder="Introduceți parola"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-xl font-medium shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Se conectează...' : 'Conectează-te'}
                </button>
              </form>

              {!showResetPassword && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowResetPassword(true)}
                    className="text-blue-400 hover:text-blue-300 transition-colors duration-300 text-sm"
                  >
                    Ai uitat parola?
                  </button>
                </div>
              )}

              {showResetPassword && (
                <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/20">
                  <h3 className="text-white font-medium mb-4">Resetare parolă</h3>
                  
                  {resetMessage && (
                    <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-100 text-sm">
                      {resetMessage}
                    </div>
                  )}
                  
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
                      placeholder="Introduceți email-ul pentru resetare"
                      required
                    />
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Se trimite...' : 'Trimite email'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowResetPassword(false);
                          setResetEmail('');
                          setError('');
                        }}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition-colors"
                      >
                        Anulează
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-white/20">
                <h3 className="text-white font-medium mb-4 text-center">
                  Conturi demo disponibile:
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
                    <p className="text-white font-medium mb-1">Administrator</p>
                    <p className="text-white/80">Email: admin@asociatia.ro</p>
                    <p className="text-white/80">Parola: admin123</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
                    <p className="text-white font-medium mb-1">Locatar</p>
                    <p className="text-white/80">Email: locatar@asociatia.ro</p>
                    <p className="text-white/80">Parola: locatar123</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}