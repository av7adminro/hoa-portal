"use client";

import React, { useState, useEffect } from 'react';
import { AuthService } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { User } from '../../lib/supabase';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [profileData, setProfileData] = useState({
    full_name: '',
    apartment_number: '',
    phone: '',
    email: '',
    persons_in_care: 1
  });
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const result = await AuthService.getCurrentUser();
    if (!result.success || !result.profile) {
      router.push('/login');
      return;
    }
    
    setUser(result.profile);
    setProfileData({
      full_name: result.profile.full_name || '',
      apartment_number: result.profile.apartment_number || '',
      phone: result.profile.phone || '',
      email: result.profile.email || result.user?.email || '',
      persons_in_care: result.profile.persons_in_care || 1
    });
    setProfilePicture(result.profile.profile_picture || null);
    setLoading(false);
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        setMessage('Eroare la încărcarea pozei');
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setProfilePicture(publicUrl);
      setMessage('Poză încărcată cu succes');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setMessage('Eroare la încărcarea pozei');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage('');

    try {
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          apartment_number: profileData.apartment_number,
          phone: profileData.phone,
          email: profileData.email,
          persons_in_care: profileData.persons_in_care,
          profile_picture: profilePicture,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Update email in auth if changed
      if (profileData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileData.email
        });
        
        if (emailError) {
          setMessage('Profilul a fost actualizat, dar email-ul nu a putut fi schimbat');
        } else {
          setMessage('Profil actualizat cu succes! Verificați email-ul pentru confirmare.');
        }
      } else {
        setMessage('Profil actualizat cu succes!');
      }

      // Refresh user data
      setTimeout(() => {
        checkAuth();
        setMessage('');
      }, 3000);

    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Eroare la actualizarea profilului');
    } finally {
      setSaving(false);
    }
  };

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
                Profilul <span className="text-blue-400">Meu</span>
              </h1>
              <p className="text-white mt-1">Actualizează informațiile personale</p>
            </div>
            <Link 
              href={user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/locatar'}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-300 hover:scale-105"
            >
              Înapoi la dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/20">
          
          {message && (
            <div className={`mb-6 p-4 rounded-xl text-center ${
              message.includes('succes') 
                ? 'bg-green-500/20 border border-green-500/30 text-green-100' 
                : 'bg-red-500/20 border border-red-500/30 text-red-100'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl text-white font-bold">
                      {profileData.full_name.charAt(0) || '?'}
                    </span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 cursor-pointer transition-colors">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                  />
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </label>
              </div>
              <p className="text-white/60 text-sm mt-2">Click pe icon pentru a schimba poza</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Nume complet
                </label>
                <input
                  type="text"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
                  required
                />
              </div>

              {/* Apartment Number */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Număr apartament
                </label>
                <input
                  type="text"
                  value={profileData.apartment_number}
                  onChange={(e) => setProfileData(prev => ({ ...prev, apartment_number: e.target.value }))}
                  className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
                  required
                  disabled={user?.role !== 'admin'}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
                  required
                />
                <p className="text-white/60 text-sm mt-1">
                  Dacă schimbați email-ul, veți primi un email de confirmare
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Număr de telefon
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
                  placeholder="07XX XXX XXX"
                />
              </div>

              {/* Persons in Care */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Persoane în întreținere
                </label>
                <input
                  type="number"
                  min="1"
                  value={profileData.persons_in_care}
                  onChange={(e) => setProfileData(prev => ({ ...prev, persons_in_care: parseInt(e.target.value) || 1 }))}
                  className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
                />
                <p className="text-white/60 text-sm mt-1">
                  Numărul de persoane care locuiesc în apartament
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Link
                href={user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/locatar'}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
              >
                Anulează
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Se salvează...' : 'Salvează modificările'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}