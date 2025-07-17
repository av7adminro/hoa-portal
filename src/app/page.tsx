"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLoaded(true);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-br from-pink-200/40 to-orange-200/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-gradient-to-br from-green-200/40 to-blue-200/40 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Floating geometric shapes - Fixed positions */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full animate-float"
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
      <nav className="relative z-50 backdrop-blur-xl bg-white/10 border-b border-white/20 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">AP</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Asociatia Proprietari
              </span>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Acasa
              </Link>
              <Link href="/despre" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Despre
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Contact
              </Link>
            </div>
            
            <Link 
              href="/login"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Conecteaza-te
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {/* Hero Card */}
            <div className="backdrop-blur-2xl bg-white/10 rounded-3xl p-12 border border-white/20 shadow-2xl mb-16 hover:bg-white/20 transition-all duration-500">
              <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  SMART
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  LIVING
                </span>
              </h1>
              
              <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8 rounded-full"></div>
              
              <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto mb-12 leading-relaxed">
                Reimaginam viata la bloc prin design inteligent si tehnologie avansata.
                <br />
                <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Experimenteaza viitorul administrarii moderne.
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button 
                  onClick={() => router.push('/login')}
                  className="group relative px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                >
                  <span className="relative z-10">Exploreaza platforma</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                
                <button 
                  onClick={() => router.push('/despre')}
                  className="px-10 py-4 backdrop-blur-sm bg-white/20 hover:bg-white/30 text-gray-800 font-bold text-lg rounded-2xl border border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105"
                >
                  Vezi demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Functionalitati
              </span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}Revolutionare
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descopera instrumentele care vor transforma complet experienta ta de locatar
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🎯",
                title: "Management Inteligent",
                description: "Algoritmi avansati pentru optimizarea costurilor si eficientizarea proceselor administrative.",
                gradient: "from-blue-500/10 to-cyan-500/10",
                border: "border-blue-500/20"
              },
              {
                icon: "🔮",
                title: "Predictive Analytics",
                description: "Analiza predictiva pentru anticiparea problemelor si optimizarea bugetului asociatiei.",
                gradient: "from-purple-500/10 to-pink-500/10",
                border: "border-purple-500/20"
              },
              {
                icon: "⚡",
                title: "Automatizare Completa",
                description: "Procese complet automatizate pentru plati, notificari si gestionarea documentelor.",
                gradient: "from-green-500/10 to-emerald-500/10",
                border: "border-green-500/20"
              },
              {
                icon: "🛡️",
                title: "Securitate Maxima",
                description: "Criptare de nivel militar si protectie multicapa pentru toate datele personale.",
                gradient: "from-red-500/10 to-orange-500/10",
                border: "border-red-500/20"
              },
              {
                icon: "📊",
                title: "Dashboard Avansat",
                description: "Interfata intuitiva cu grafice in timp real si raportari detaliate.",
                gradient: "from-indigo-500/10 to-blue-500/10",
                border: "border-indigo-500/20"
              },
              {
                icon: "🌐",
                title: "Ecosistem Conectat",
                description: "Integrare cu servicii externe si API-uri pentru o experienta unificata.",
                gradient: "from-teal-500/10 to-green-500/10",
                border: "border-teal-500/20"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`group backdrop-blur-2xl bg-gradient-to-br ${feature.gradient} rounded-3xl p-8 border ${feature.border} hover:border-white/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 shadow-lg hover:shadow-2xl`}
              >
                <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="backdrop-blur-2xl bg-gradient-to-br from-white/20 to-white/10 rounded-3xl p-12 border border-white/20 shadow-2xl">
            <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Performanta in Cifre
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              {[
                { number: "15,000+", label: "Utilizatori activi", color: "from-blue-500 to-cyan-500" },
                { number: "99.98%", label: "Disponibilitate", color: "from-green-500 to-emerald-500" },
                { number: "< 2ms", label: "Timp de raspuns", color: "from-purple-500 to-pink-500" },
                { number: "24/7", label: "Suport premium", color: "from-orange-500 to-red-500" }
              ].map((stat, index) => (
                <div key={index} className="group">
                  <div className={`text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300`}>
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="backdrop-blur-2xl bg-gradient-to-br from-white/20 to-white/10 rounded-3xl p-16 border border-white/20 shadow-2xl">
            <h2 className="text-5xl font-bold mb-8">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Pregatit pentru
              </span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}Viitor
              </span>
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                ?
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Fa primul pas catre o asociatie de proprietari inteligenta si eficienta
            </p>
            <button 
              onClick={() => router.push('/login')}
              className="inline-flex items-center px-12 py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              Porneste transformarea
              <svg className="ml-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}