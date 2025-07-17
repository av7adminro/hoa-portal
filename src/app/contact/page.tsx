"use client";

import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    apartment: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      // Reset form on success
      setFormData({
        name: '',
        email: '',
        apartment: '',
        subject: '',
        message: ''
      });
      
      alert('Mesajul a fost trimis cu succes! Vă vom răspunde în cel mai scurt timp.');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Eroare la trimiterea mesajului. Vă rugăm să încercați din nou.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="backdrop-blur-2xl bg-white/10 rounded-3xl p-12 border border-white/20 shadow-2xl">
              <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Contacteaza
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Administrația
                </span>
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8 rounded-full"></div>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Suntem aici pentru tine! Contacteaza-ne pentru orice intrebare, sugestie sau problema.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Informatii Contact
                </h2>
              </div>
              
              <div className="space-y-6">
                {[
                  {
                    icon: "📍",
                    title: "Adresa",
                    info: "Strada Exemplu nr. 123, Sector 1, Bucuresti",
                    subinfo: "Bloc A, Scara 1, Et. Parter",
                    gradient: "from-blue-500/10 to-cyan-500/10",
                    border: "border-blue-500/20"
                  },
                  {
                    icon: "📞",
                    title: "Telefon",
                    info: "+40 21 123 456 789",
                    subinfo: "Program: Luni - Vineri, 9:00 - 17:00",
                    gradient: "from-green-500/10 to-emerald-500/10",
                    border: "border-green-500/20"
                  },
                  {
                    icon: "✉️",
                    title: "Email",
                    info: "contact@asociatia647.ro",
                    subinfo: "Raspundem in maxim 24 de ore",
                    gradient: "from-purple-500/10 to-pink-500/10",
                    border: "border-purple-500/20"
                  },
                  {
                    icon: "🕒",
                    title: "Program audiențe",
                    info: "Marti si Joi: 16:00 - 18:00",
                    subinfo: "Sambata: 10:00 - 12:00",
                    gradient: "from-orange-500/10 to-red-500/10",
                    border: "border-orange-500/20"
                  }
                ].map((contact, index) => (
                  <div
                    key={index}
                    className={`backdrop-blur-2xl bg-gradient-to-br ${contact.gradient} rounded-2xl p-6 border ${contact.border} hover:border-white/30 transition-all duration-300 hover:bg-white/20 group transform hover:scale-105 shadow-lg hover:shadow-2xl`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                        {contact.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors duration-300">
                          {contact.title}
                        </h3>
                        <p className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-300">
                          {contact.info}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          {contact.subinfo}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Emergency Contact */}
              <div className="backdrop-blur-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl p-6 border border-red-500/20 shadow-2xl">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">🚨</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      Urgențe <span className="text-red-600">24/7</span>
                    </h3>
                    <p className="text-gray-700 font-medium">
                      +40 21 987 654 321
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Pentru avarii, incendii sau situații de urgență
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="backdrop-blur-2xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Trimite-ne un Mesaj
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Numele complet
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300"
                      placeholder="Introduceti numele"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300"
                      placeholder="email@exemplu.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Apartament
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleChange}
                      className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300"
                      placeholder="ex: Ap. 15, Sc. A, Et. 3"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Subiect
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300"
                      required
                    >
                      <option value="">Selecteaza categoria</option>
                      <option value="facturi">Facturi si plati</option>
                      <option value="mentenanta">Mentenanta</option>
                      <option value="reclamatie">Reclamatie</option>
                      <option value="sugestie">Sugestie</option>
                      <option value="altele">Altele</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Mesaj
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300 resize-none"
                    placeholder="Descrie problema sau intrebarea ta..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Se trimite...</span>
                    </div>
                  ) : (
                    'Trimite Mesajul'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Intrebari
              </span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}Frecvente
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Gaseste rapid raspunsuri la intrebarile cele mai comune
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: "Cum pot plati intretinerea online?",
                answer: "Accesezi contul tau, sectiunea 'Plati' si selectezi factura pe care vrei sa o platesti. Poti plati cu cardul direct in platforma.",
                gradient: "from-blue-500/10 to-cyan-500/10",
                border: "border-blue-500/20"
              },
              {
                question: "Unde gasesc indexul de apa?",
                answer: "In sectiunea 'Index Apa' din contul tau. Poti trimite indexul lunar si sa vezi istoricul consumului.",
                gradient: "from-green-500/10 to-emerald-500/10",
                border: "border-green-500/20"
              },
              {
                question: "Cum raportez o problema tehnica?",
                answer: "Foloseste formularul de contact de mai sus, selecteaza categoria 'Mentenanta' si descrie problema.",
                gradient: "from-purple-500/10 to-pink-500/10",
                border: "border-purple-500/20"
              },
              {
                question: "Pot vedea toate facturile mele?",
                answer: "Da, in sectiunea 'Documente' ai acces la toate facturile, PV-urile si documentele importante.",
                gradient: "from-orange-500/10 to-red-500/10",
                border: "border-orange-500/20"
              },
              {
                question: "Ce fac daca am uitat parola?",
                answer: "Pe pagina de login, click pe 'Am uitat parola' si urmeaza instructiunile primite pe email.",
                gradient: "from-indigo-500/10 to-blue-500/10",
                border: "border-indigo-500/20"
              },
              {
                question: "Cum ma inregistrez pe platforma?",
                answer: "Contacteaza administratorul pentru a primi datele de acces. Fiecare apartament are un cont unic.",
                gradient: "from-teal-500/10 to-green-500/10",
                border: "border-teal-500/20"
              }
            ].map((faq, index) => (
              <div
                key={index}
                className={`backdrop-blur-2xl bg-gradient-to-br ${faq.gradient} rounded-2xl p-6 border ${faq.border} hover:border-white/30 transition-all duration-300 hover:bg-white/20 group transform hover:scale-105 shadow-lg hover:shadow-2xl`}
              >
                <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  {faq.question}
                </h3>
                <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section (Optional) */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="backdrop-blur-2xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Locatia Noastra
            </h2>
            <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl h-64 flex items-center justify-center">
              <p className="text-gray-600 font-medium">
                Aici va fi integrata harta Google Maps
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}