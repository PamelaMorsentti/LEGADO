import { ensureSupabase } from './supabaseClient';

export async function getProfile() {
  const client = ensureSupabase();
  const { data: userData } = await client.auth.getUser();
  if (!userData?.user) return null;

  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userData.user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data ?? null;
}

export async function updateProfile(updates) {
  const client = ensureSupabase();
  const { data: userData } = await client.auth.getUser();
  if (!userData?.user) return null;

  const { data, error } = await client
    .from('profiles')
    .upsert({
      id: userData.user.id,
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProfileInfo() {
  const client = ensureSupabase();
  const { data: userData } = await client.auth.getUser();
  if (!userData?.user) return [];

  const { data, error } = await client
    .from('profile_info')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function upsertProfileInfo(entries) {
  const client = ensureSupabase();
  const { data: userData } = await client.auth.getUser();
  if (!userData?.user || !Array.isArray(entries)) return [];

  const payload = entries.map((entry) => ({
    ...entry,
    user_id: userData.user.id,
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await client.from('profile_info').upsert(payload, { onConflict: 'id' }).select();
  if (error) throw error;
  return data ?? [];
}

export async function listAnswers() {
  const client = ensureSupabase();
  const { data: userData } = await client.auth.getUser();
  if (!userData?.user) return [];

  const { data, error } = await client
    .from('answers')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export default {
  getProfile,
  updateProfile,
  getProfileInfo,
  upsertProfileInfo,
  listAnswers,
};
