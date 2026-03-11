const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const initDatabase = async () => {
  console.log('Supabase client initialized');
  return true;
};

const query = async (sql, params = []) => {
  throw new Error('Use Supabase client methods instead of raw SQL');
};

const run = async (sql, params = []) => {
  throw new Error('Use Supabase client methods instead of raw SQL');
};

const get = async (sql, params = []) => {
  throw new Error('Use Supabase client methods instead of raw SQL');
};

module.exports = {
  supabase,
  initDatabase,
  query,
  run,
  get
};
