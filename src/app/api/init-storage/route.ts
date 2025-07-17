import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      return NextResponse.json({ error: 'Error listing buckets: ' + listError.message }, { status: 500 });
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'documents');

    if (!bucketExists) {
      // Create the bucket
      const { error: createError } = await supabaseAdmin.storage.createBucket('documents', {
        public: false,
        fileSizeLimit: 10485760, // 10MB
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
        return NextResponse.json({ error: 'Error creating bucket: ' + createError.message }, { status: 500 });
      }

      // Note: RLS policies for storage need to be set up in Supabase dashboard
      // as they cannot be created via the client library
      // Policies needed:
      // - Authenticated users can upload (INSERT)
      // - Authenticated users can view (SELECT)
      // - Users can delete their own files (DELETE)

      return NextResponse.json({ 
        message: 'Storage bucket created successfully!',
        bucket: 'documents',
        note: 'Please set up RLS policies in Supabase dashboard for proper security'
      });
    }

    return NextResponse.json({ 
      message: 'Storage bucket already exists',
      bucket: 'documents'
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Error initializing storage: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 });
  }
}