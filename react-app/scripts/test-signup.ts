
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env manuanlly
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

const supabaseUrl = envVars['VITE_SUPABASE_URL'];
const supabaseKey = envVars['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
    const email = `test.user.${Date.now()}@example.com`;
    const password = 'testpassword123';
    const name = 'Test User';

    console.log(`Attempting signup for ${email}...`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name,
                role: 'Student'
            }
        }
    });

    if (error) {
        console.error('Signup Error:', error.message);
        process.exit(1);
    }

    if (!data.user) {
        console.error('Signup succeeded but no user returned');
        process.exit(1);
    }

    console.log('Auth user created:', data.user.id);

    // Give the trigger a moment
    await new Promise(r => setTimeout(r, 2000));

    // Check users_extended
    const { data: profile, error: profileError } = await supabase
        .from('users_extended')
        .select('*')
        .eq('id', data.user.id)
        .single();

    if (profileError) {
        console.error('Profile fetch error:', profileError.message);
        process.exit(1);
    }

    if (!profile) {
        console.error('Profile not found in users_extended');
        process.exit(1);
    }

    console.log('Profile found:', profile);
    console.log('Signup test PASSED');
}

testSignup();
