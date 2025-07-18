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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute inset-0 pointer-events-none">
          {[
            { left: 15, top: 25, delay: 0.5, duration: 12 },
            { left: 85, top: 70, delay: 1.2, duration: 15 },
            { left: 45, top: 15, delay: 2.1, duration: 18 },
            { left: 70, top: 90, delay: 0.8, duration: 14 },
            { left: 25, top: 50, delay: 1.7, duration: 16 },
            { left: 90, top: 30, delay: 2.5, duration: 13 },
            { left: 10, top: 80, delay: 1.1, duration: 17 },
            { left: 60, top: 40, delay: 3.2, duration: 11 },
            { left: 35, top: 75, delay: 0.3, duration: 19 },
            { left: 80, top: 20, delay: 2.8, duration: 12 },
            { left: 55, top: 65, delay: 1.5, duration: 14 },
            { left: 20, top: 35, delay: 3.5, duration: 16 },
            { left: 75, top: 85, delay: 0.7, duration: 18 },
            { left: 40, top: 10, delay: 2.2, duration: 13 },
            { left: 95, top: 55, delay: 1.8, duration: 15 },
            { left: 5, top: 45, delay: 3.1, duration: 17 },
            { left: 65, top: 95, delay: 0.4, duration: 11 },
            { left: 30, top: 60, delay: 2.7, duration: 19 },
            { left: 85, top: 25, delay: 1.3, duration: 14 },
            { left: 15, top: 75, delay: 3.4, duration: 16 }
          ].map((particle, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-gradient-to-br from-blue-400/40 to-purple-400/40 rounded-full animate-float"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 backdrop-blur-xl bg-black/20 border-b border-white/20 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">AP</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-white bg-clip-text text-transparent">
                Asociatia Proprietari
              </span>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <Link href="/" className="text-white hover:text-blue-400 font-medium transition-colors">
                Acasa
              </Link>
              <Link href="/despre" className="text-white hover:text-blue-400 font-medium transition-colors">
                Despre
              </Link>
              <Link href="/contact" className="text-white hover:text-blue-400 font-medium transition-colors">
                Contact
              </Link>
            </div>
            
            <Link 
              href="/"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Inapoi acasa
            </Link>
          </div>
        </div>
      </nav>

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