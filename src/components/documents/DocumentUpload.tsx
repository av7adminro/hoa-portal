"use client";

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadFile } from '../../utils/storage';

interface DocumentUploadProps {
  onUploadComplete?: () => void;
}

export default function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !title || !category) {
      setError('Te rugam sa completezi toate campurile obligatorii');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setError('Trebuie sa fii autentificat pentru a incarca documente');
        return;
      }

      // Generate unique file path
      const timestamp = Date.now();
      const fileName = `${timestamp}-${selectedFile.name}`;
      const filePath = `documents/${user.id}/${fileName}`;
      
      // Upload file to storage
      const { error: uploadError } = await uploadFile(selectedFile, filePath);
      
      if (uploadError) {
        setError('Eroare la incarcarea fisierului: ' + (uploadError instanceof Error ? uploadError.message : 'Unknown error'));
        return;
      }
      
      // Save document metadata to database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          title,
          description,
          category,
          file_path: filePath,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          uploaded_by: user.id,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        setError('Eroare la salvarea documentului: ' + dbError.message);
        return;
      }

      // Reset form
      setSelectedFile(null);
      setTitle('');
      setDescription('');
      setCategory('');
      
      if (onUploadComplete) {
        onUploadComplete();
      }

      alert('Document incarcat cu succes!');
    } catch (error) {
      setError('Eroare necunoscuta: ' + (error instanceof Error ? error.message : 'Eroare'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-6">Incarca Document Nou</h3>
      
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-white font-medium mb-2">
            Titlu document *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white placeholder-white focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300"
            placeholder="Introduceti titlul documentului"
            required
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            Categorie *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300"
            required
          >
            <option value="">Selecteaza categoria</option>
            <option value="facturi">Facturi</option>
            <option value="procese-verbale">Procese Verbale</option>
            <option value="regulamente">Regulamente</option>
            <option value="contracte">Contracte</option>
            <option value="corespondenta">Corespondenta</option>
            <option value="altele">Altele</option>
          </select>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            Descriere
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white placeholder-white focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300 h-24"
            placeholder="Descriere optionala a documentului"
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            Fisier *
          </label>
          <input
            type="file"
            onChange={handleFileSelect}
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:bg-white/30 transition-all duration-300"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            required
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-white">
              Fisier selectat: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Se incarca...' : 'Incarca Document'}
        </button>
      </form>
    </div>
  );
}