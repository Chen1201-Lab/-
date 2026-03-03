import { supabase } from './lib/supabase';

const API_BASE = '/api';

async function getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
        throw new Error('未登录');
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
    };
}

async function fetchApi(path: string, options: RequestInit = {}) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: { ...headers, ...options.headers },
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `API请求失败: ${res.status}`);
    }

    return res.json();
}

// ===== Auth =====
export async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
}

export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
}

// ===== User Profile =====
export async function getUserProfile() {
    return fetchApi('/users/profile');
}

export async function updateUserProfile(data: { gender?: string; user_name?: string }) {
    return fetchApi('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

// ===== Stats =====
export async function getUserStats() {
    return fetchApi('/stats');
}

export async function updateUserStats(data: {
    streak?: number;
    total_minutes?: number;
    today_minutes?: number;
    last_workout?: string;
    last_active_date?: string;
    unlocked_badges?: string[];
    workouts_completed?: number;
}) {
    return fetchApi('/stats', {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function updatePreferences(data: {
    sound_enabled?: boolean;
    haptics_enabled?: boolean;
    reminder_time?: string;
    daily_goal?: number;
}) {
    return fetchApi('/stats/preferences', {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

// ===== Workouts =====
export async function addWorkoutRecord(data: {
    workout_date: string;
    program_id: string;
    program_name: string;
    contract_time: number;
    rest_time: number;
    cycles: number;
    duration_minutes: number;
}) {
    return fetchApi('/workouts', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function getWorkoutHistory(limit = 50) {
    return fetchApi(`/workouts?limit=${limit}`);
}

export async function getWorkoutDates(): Promise<string[]> {
    return fetchApi('/workouts/dates');
}

export async function manualCheckIn(workoutDate?: string) {
    return fetchApi('/workouts/checkin', {
        method: 'POST',
        body: JSON.stringify({ workout_date: workoutDate || new Date().toDateString() }),
    });
}
