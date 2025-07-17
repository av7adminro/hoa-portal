const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabaseStructure() {
  console.log('🔍 Checking current database structure in Supabase...');
  console.log('URL:', supabaseUrl);
  console.log('='.repeat(60));

  // List of tables to check
  const tablesToCheck = [
    'profiles',
    'documents', 
    'water_indices',
    'payments',
    'notifications',
    'associations',
    'buildings',
    'apartments',
    'residents',
    'maintenance_requests',
    'expenses',
    'meetings',
    'votes'
  ];

  const existingTables = [];
  const missingTables = [];

  for (const tableName of tablesToCheck) {
    console.log(`\n📊 Checking table: ${tableName}`);
    
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table '${tableName}' does not exist or no access`);
        console.log(`   Error: ${error.message}`);
        missingTables.push(tableName);
      } else {
        console.log(`✅ Table '${tableName}' exists`);
        console.log(`   Sample data count: ${data.length}`);
        existingTables.push(tableName);
        
        // If table exists, get its structure
        if (data.length > 0) {
          console.log(`   Sample columns: ${Object.keys(data[0]).join(', ')}`);
        }
      }
    } catch (err) {
      console.log(`❌ Exception checking '${tableName}': ${err.message}`);
      missingTables.push(tableName);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 DATABASE STRUCTURE SUMMARY:');
  console.log('='.repeat(60));
  
  console.log(`\n✅ EXISTING TABLES (${existingTables.length}):`);
  existingTables.forEach(table => {
    console.log(`   - ${table}`);
  });
  
  console.log(`\n❌ MISSING TABLES (${missingTables.length}):`);
  missingTables.forEach(table => {
    console.log(`   - ${table}`);
  });

  // Check if we can access some system tables for more info
  console.log('\n🔍 Checking system information...');
  
  try {
    // Try to get table info from information_schema
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info')
      .limit(10);
    
    if (tableError) {
      console.log('❌ Cannot access table information:', tableError.message);
    } else {
      console.log('✅ Table information accessible');
    }
  } catch (err) {
    console.log('❌ System info check failed:', err.message);
  }

  console.log('\n🎯 Structure check completed!');
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (missingTables.length > 0) {
    console.log('   - Update supabase-setup.sql to create missing tables');
    console.log('   - Run the updated SQL script in Supabase SQL Editor');
  } else {
    console.log('   - All required tables exist');
    console.log('   - Check if user profiles need to be created');
  }
}

checkDatabaseStructure().catch(console.error);