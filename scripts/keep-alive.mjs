import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables for local testing
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  console.log('Ensure these are set in your Render dashboard or GitHub Secrets.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function keepAlive() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🚀 Starting Supabase Keep-Alive Ping...`);
  
  try {
    /**
     * APPROACH: 
     * We perform a simple read operation on the 'profiles' table.
     * This registers activity in the Supabase database.
     * 
     * FALLBACK/WRITE APPROACH (Uncomment if needed):
     * If simple reads don't stop the pausing, you can perform a small write:
     * await supabase.from('keep_alive').insert([{ last_ping: new Date() }]);
     */
    
    const { data, error, count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    if (error) throw error;

    console.log('✅ Ping Success: Database is active.');
    console.log(`📊 Current profile count: ${count}`);
    
  } catch (err) {
    console.error('❌ Ping Failed:', err.message);
    
    // Suggest common fixes
    if (err.message.includes('fetch')) {
      console.log('👉 Tip: Check your internet connection or SUPABASE_URL.');
    } else if (err.message.includes('JWT')) {
      console.log('👉 Tip: Check if your SUPABASE_SERVICE_ROLE_KEY is correct.');
    }
    
    process.exit(1);
  }
}

keepAlive();
