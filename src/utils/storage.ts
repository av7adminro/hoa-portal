import { supabase } from '@/lib/supabase';

const STORAGE_BUCKET = 'documents';

export async function createStorageBucketIfNotExists() {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);

    if (!bucketExists) {
      // Create the bucket with public access for authenticated users
      const { error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: false, // Only authenticated users can access
        fileSizeLimit: 10485760, // 10MB limit
        allowedMimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'image/jpeg',
          'image/png',
          'image/gif'
        ]
      });

      if (createError) {
        console.error('Error creating bucket:', createError);
        return false;
      }

      console.log('Storage bucket created successfully');
    }

    return true;
  } catch (error) {
    console.error('Error in storage setup:', error);
    return false;
  }
}

export async function uploadFile(file: File, path: string) {
  try {
    // First check if bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError || !buckets?.some(b => b.name === STORAGE_BUCKET)) {
      return { 
        error: new Error('Storage bucket not found. Please contact administrator to set up storage.') 
      };
    }

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return { error };
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path);

    return { data: { ...data, publicUrl } };
  } catch (error) {
    console.error('Upload exception:', error);
    return { error };
  }
}

export async function deleteFile(path: string) {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return { error };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete exception:', error);
    return { error };
  }
}

export async function downloadFile(path: string) {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(path);

    if (error) {
      console.error('Download error:', error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error('Download exception:', error);
    return { error };
  }
}

export function getFileUrl(path: string) {
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path);
  
  return data.publicUrl;
}