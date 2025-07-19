"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Pre-generated particles to avoid hydration mismatch
  const particles = [
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
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Floating geometric shapes - Fixed positions */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((particle, i) => (
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
      <nav className={`relative z-50 backdrop-blur-xl bg-black/20 border-b border-white/20 sticky top-0 transition-all duration-300 ${
        scrollY > 50 ? 'bg-black/30' : 'bg-black/20'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">AP</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-white bg-clip-text text-transparent">
                Asociatia Proprietari
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              <Link 
                href="/" 
                className={`font-medium transition-colors ${
                  pathname === '/' ? 'text-blue-400' : 'text-white hover:text-blue-400'
                }`}
              >
                Acasa
              </Link>
              <Link 
                href="/despre" 
                className={`font-medium transition-colors ${
                  pathname === '/despre' ? 'text-blue-400' : 'text-white hover:text-blue-400'
                }`}
              >
                Despre
              </Link>
              <Link 
                href="/contact" 
                className={`font-medium transition-colors ${
                  pathname === '/contact' ? 'text-blue-400' : 'text-white hover:text-blue-400'
                }`}
              >
                Contact
              </Link>
            </div>
            
            {/* Desktop Login Button */}
            <Link 
              href="/login"
              className="hidden md:block bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Conecteaza-te
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg backdrop-blur-sm bg-white/20 hover:bg-white/30 transition-all duration-300"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden backdrop-blur-xl bg-white/20 border-t border-white/20">
            <div className="px-6 py-4 space-y-4">
              <Link 
                href="/" 
                className={`block py-2 font-medium transition-colors ${
                  pathname === '/' ? 'text-blue-600' : 'text-white hover:text-blue-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Acasa
              </Link>
              <Link 
                href="/despre" 
                className={`block py-2 font-medium transition-colors ${
                  pathname === '/despre' ? 'text-blue-600' : 'text-white hover:text-blue-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Despre
              </Link>
              <Link 
                href="/contact" 
                className={`block py-2 font-medium transition-colors ${
                  pathname === '/contact' ? 'text-blue-600' : 'text-white hover:text-blue-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                href="/login" 
                className="block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-medium text-center shadow-lg transition-all duration-300 hover:scale-105"
                onClick={() => setIsMenuOpen(false)}
              >
                Conecteaza-te
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="backdrop-blur-2xl bg-gradient-to-br from-white/20 to-white/10 rounded-3xl p-12 border border-white/20 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Logo & Description */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">AP</span>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-white to-white bg-clip-text text-transparent">
                    Asociatia Proprietari
                  </span>
                </div>
                <p className="text-white max-w-md">
                  Transformam viata la bloc prin tehnologie avansata si design inteligent. 
                  Experienta moderna pentru asociatii de proprietari.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Navigare</h3>
                <div className="space-y-2">
                  <Link href="/" className="block text-white hover:text-blue-600 transition-colors">
                    Acasa
                  </Link>
                  <Link href="/despre" className="block text-white hover:text-blue-600 transition-colors">
                    Despre
                  </Link>
                  <Link href="/contact" className="block text-white hover:text-blue-600 transition-colors">
                    Contact
                  </Link>
                  <Link href="/login" className="block text-white hover:text-blue-600 transition-colors">
                    Conecteaza-te
                  </Link>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
                <div className="space-y-2 text-white">
                  <p>contact@asociatia.ro</p>
                  <p>+40 21 123 456</p>
                  <p>Bucuresti, Romania</p>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-white/20 pt-8 text-center">
              <p className="text-white">
                © {new Date().getFullYear()} Asociatia de Proprietari. Toate drepturile rezervate.
                Construit cu ❤️ pentru comunitate.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}