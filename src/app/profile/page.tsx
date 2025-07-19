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
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState({
    full_name: '',
    apartment_number: '',
    phone: '',
    email: '',
    persons_in_care: 1,
    
    // Contact information
    emergency_phone: '',
    alternative_email: '',
    
    // Apartment information
    apartment_area: 0,
    room_count: 1,
    floor_number: 1,
    parking_spots: 0,
    parking_location: '',
    
    // Family information
    adults_count: 1,
    children_count: 0,
    pets_info: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    
    // Notification preferences
    email_notifications: true,
    sms_notifications: false,
    notification_types: 'all',
    
    // Property information
    property_type: 'owner' as 'owner' | 'tenant',
    move_in_date: '',
    special_notes: ''
  });
  const [pets, setPets] = useState<Array<{type: string, name: string, breed?: string}>>([]);
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
      persons_in_care: result.profile.persons_in_care || 1,
      
      // Contact information
      emergency_phone: result.profile.emergency_phone || '',
      alternative_email: result.profile.alternative_email || '',
      
      // Apartment information
      apartment_area: result.profile.apartment_area || 0,
      room_count: result.profile.room_count || 1,
      floor_number: result.profile.floor_number || 1,
      parking_spots: result.profile.parking_spots || 0,
      parking_location: result.profile.parking_location || '',
      
      // Family information
      adults_count: result.profile.adults_count || 1,
      children_count: result.profile.children_count || 0,
      pets_info: result.profile.pets_info || '',
      emergency_contact_name: result.profile.emergency_contact_name || '',
      emergency_contact_phone: result.profile.emergency_contact_phone || '',
      
      // Notification preferences
      email_notifications: result.profile.email_notifications ?? true,
      sms_notifications: result.profile.sms_notifications ?? false,
      notification_types: result.profile.notification_types || 'all',
      
      // Property information
      property_type: result.profile.property_type || 'owner',
      move_in_date: result.profile.move_in_date || '',
      special_notes: result.profile.special_notes || ''
    });
    setProfilePicture(result.profile.profile_picture || null);
    
    // Parse pets info
    if (result.profile.pets_info) {
      try {
        setPets(JSON.parse(result.profile.pets_info));
      } catch (e) {
        setPets([]);
      }
    }
    setLoading(false);
  };

  const addPet = () => {
    setPets([...pets, { type: '', name: '', breed: '' }]);
  };

  const removePet = (index: number) => {
    setPets(pets.filter((_, i) => i !== index));
  };

  const updatePet = (index: number, field: string, value: string) => {
    const updatedPets = pets.map((pet, i) => 
      i === index ? { ...pet, [field]: value } : pet
    );
    setPets(updatedPets);
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        setMessage('Eroare la încărcarea pozei');
        return;
      }

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
      const updateData = {
        ...profileData,
        profile_picture: profilePicture,
        pets_info: JSON.stringify(pets.filter(pet => pet.name.trim() !== '')),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

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

  const tabs = [
    { id: 'personal', label: 'Date personale', icon: '👤' },
    { id: 'contact', label: 'Contact', icon: '📞' },
    { id: 'apartment', label: 'Apartament', icon: '🏠' },
    { id: 'family', label: 'Familie', icon: '👥' },
    { id: 'notifications', label: 'Notificări', icon: '🔔' },
    { id: 'property', label: 'Proprietate', icon: '🏢' }
  ];

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

  const renderPersonalTab = () => (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl text-white font-bold">
                {profileData.full_name.charAt(0) || '?'}
              </span>
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 cursor-pointer transition-colors">
            <input type="file" accept="image/*" onChange={handleProfilePictureUpload} className="hidden" />
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </label>
        </div>
        <p className="text-white/60 text-sm mt-2">Click pe icon pentru a schimba poza</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white font-medium mb-2">Nume complet</label>
          <input
            type="text"
            value={profileData.full_name}
            onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
            required
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">Număr apartament</label>
          <input
            type="text"
            value={profileData.apartment_number}
            onChange={(e) => setProfileData(prev => ({ ...prev, apartment_number: e.target.value }))}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
            required
            disabled={user?.role !== 'admin'}
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">Persoane în întreținere</label>
          <input
            type="number"
            min="1"
            value={profileData.persons_in_care}
            onChange={(e) => setProfileData(prev => ({ ...prev, persons_in_care: parseInt(e.target.value) || 1 }))}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
          />
        </div>
      </div>
    </div>
  );

  const renderContactTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-white font-medium mb-2">Email principal</label>
        <input
          type="email"
          value={profileData.email}
          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
          required
        />
      </div>

      <div>
        <label className="block text-white font-medium mb-2">Email alternativ</label>
        <input
          type="email"
          value={profileData.alternative_email}
          onChange={(e) => setProfileData(prev => ({ ...prev, alternative_email: e.target.value }))}
          className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
          placeholder="pentru familie/parteneri"
        />
      </div>

      <div>
        <label className="block text-white font-medium mb-2">Telefon principal</label>
        <input
          type="tel"
          value={profileData.phone}
          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
          className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
          placeholder="07XX XXX XXX"
        />
      </div>

      <div>
        <label className="block text-white font-medium mb-2">Telefon de urgență</label>
        <input
          type="tel"
          value={profileData.emergency_phone}
          onChange={(e) => setProfileData(prev => ({ ...prev, emergency_phone: e.target.value }))}
          className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
          placeholder="07XX XXX XXX"
        />
      </div>
    </div>
  );

  const renderApartmentTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-white font-medium mb-2">Suprafață (mp)</label>
        <input
          type="number"
          min="0"
          step="0.1"
          value={profileData.apartment_area}
          onChange={(e) => setProfileData(prev => ({ ...prev, apartment_area: parseFloat(e.target.value) || 0 }))}
          className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
        />
      </div>

      <div>
        <label className="block text-white font-medium mb-2">Numărul de camere</label>
        <input
          type="number"
          min="1"
          value={profileData.room_count}
          onChange={(e) => setProfileData(prev => ({ ...prev, room_count: parseInt(e.target.value) || 1 }))}
          className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
        />
      </div>

      <div>
        <label className="block text-white font-medium mb-2">Etaj</label>
        <input
          type="number"
          min="0"
          value={profileData.floor_number}
          onChange={(e) => setProfileData(prev => ({ ...prev, floor_number: parseInt(e.target.value) || 1 }))}
          className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
        />
      </div>

      <div>
        <label className="block text-white font-medium mb-2">Locuri de parcare</label>
        <input
          type="number"
          min="0"
          value={profileData.parking_spots}
          onChange={(e) => setProfileData(prev => ({ ...prev, parking_spots: parseInt(e.target.value) || 0 }))}
          className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-white font-medium mb-2">Locația parcării</label>
        <input
          type="text"
          value={profileData.parking_location}
          onChange={(e) => setProfileData(prev => ({ ...prev, parking_location: e.target.value }))}
          className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
          placeholder="ex: Subsolul 1, locul 15"
        />
      </div>
    </div>
  );

  const renderFamilyTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white font-medium mb-2">Numărul de adulți</label>
          <input
            type="number"
            min="1"
            value={profileData.adults_count}
            onChange={(e) => setProfileData(prev => ({ ...prev, adults_count: parseInt(e.target.value) || 1 }))}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">Numărul de copii</label>
          <input
            type="number"
            min="0"
            value={profileData.children_count}
            onChange={(e) => setProfileData(prev => ({ ...prev, children_count: parseInt(e.target.value) || 0 }))}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">Contact de urgență</label>
          <input
            type="text"
            value={profileData.emergency_contact_name}
            onChange={(e) => setProfileData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
            placeholder="Nume complet"
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">Telefon contact urgență</label>
          <input
            type="tel"
            value={profileData.emergency_contact_phone}
            onChange={(e) => setProfileData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
            placeholder="07XX XXX XXX"
          />
        </div>
      </div>

      {/* Pets Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Animale de companie</h3>
          <button
            type="button"
            onClick={addPet}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            + Adaugă animal
          </button>
        </div>
        
        {pets.map((pet, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-white/5 rounded-xl">
            <input
              type="text"
              placeholder="Tip (câine, pisică, etc.)"
              value={pet.type}
              onChange={(e) => updatePet(index, 'type', e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Nume"
              value={pet.name}
              onChange={(e) => updatePet(index, 'name', e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Rasă (opțional)"
              value={pet.breed || ''}
              onChange={(e) => updatePet(index, 'breed', e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => removePet(index)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="email_notifications"
            checked={profileData.email_notifications}
            onChange={(e) => setProfileData(prev => ({ ...prev, email_notifications: e.target.checked }))}
            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="email_notifications" className="text-white font-medium">
            Notificări prin email
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="sms_notifications"
            checked={profileData.sms_notifications}
            onChange={(e) => setProfileData(prev => ({ ...prev, sms_notifications: e.target.checked }))}
            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="sms_notifications" className="text-white font-medium">
            Notificări prin SMS
          </label>
        </div>
      </div>

      <div>
        <label className="block text-white font-medium mb-2">Tipuri de notificări</label>
        <select
          value={profileData.notification_types}
          onChange={(e) => setProfileData(prev => ({ ...prev, notification_types: e.target.value }))}
          className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">Toate notificările</option>
          <option value="urgent">Doar urgențe</option>
          <option value="bills">Facturi și plăți</option>
          <option value="announcements">Anunțuri generale</option>
        </select>
      </div>
    </div>
  );

  const renderPropertyTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white font-medium mb-2">Tipul proprietății</label>
          <select
            value={profileData.property_type}
            onChange={(e) => setProfileData(prev => ({ ...prev, property_type: e.target.value as 'owner' | 'tenant' }))}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
          >
            <option value="owner">Proprietar</option>
            <option value="tenant">Chiriaș</option>
          </select>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">Data mutării</label>
          <input
            type="date"
            value={profileData.move_in_date}
            onChange={(e) => setProfileData(prev => ({ ...prev, move_in_date: e.target.value }))}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-white font-medium mb-2">Observații speciale</label>
        <textarea
          value={profileData.special_notes}
          onChange={(e) => setProfileData(prev => ({ ...prev, special_notes: e.target.value }))}
          rows={4}
          className="w-full px-4 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-300"
          placeholder="Informații despre accesibilitate, alergii, sau alte observații importante"
        />
      </div>
    </div>
  );

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

      {/* Profile Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-xl text-center ${
            message.includes('succes') 
              ? 'bg-green-500/20 border border-green-500/30 text-green-100' 
              : 'bg-red-500/20 border border-red-500/30 text-red-100'
          }`}>
            {message}
          </div>
        )}

        <div className="backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/20 overflow-hidden">
          {/* Tabs */}
          <div className="flex flex-wrap border-b border-white/20">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-blue-500/20 text-white border-b-2 border-blue-500'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:block">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <form onSubmit={handleSubmit} className="p-8">
            {activeTab === 'personal' && renderPersonalTab()}
            {activeTab === 'contact' && renderContactTab()}
            {activeTab === 'apartment' && renderApartmentTab()}
            {activeTab === 'family' && renderFamilyTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
            {activeTab === 'property' && renderPropertyTab()}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-8 mt-8 border-t border-white/20">
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