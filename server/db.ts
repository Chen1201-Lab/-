import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

function getSupabaseConfig() {
    const url = process.env.SUPABASE_URL || '';
    const key = process.env.SUPABASE_ANON_KEY || '';
    if (!url || !key) {
        throw new Error('SUPABASE_URL or SUPABASE_ANON_KEY not configured in .env');
    }
    return { url, key };
}

export function getSupabase(): SupabaseClient {
    if (!_supabase) {
        const { url, key } = getSupabaseConfig();
        _supabase = createClient(url, key);
    }
    return _supabase;
}

// Create a Supabase client with user's JWT for RLS
export function createUserClient(jwt: string): SupabaseClient {
    const { url, key } = getSupabaseConfig();
    return createClient(url, key, {
        global: {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        },
    });
}
