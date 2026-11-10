import { ensureSupabase } from './supabaseClient';

export async function signUp({ email, password, displayName }) {
  const client = ensureSupabase();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName ?? '',
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signIn({ email, password }) {
  const client = ensureSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const client = ensureSupabase();
  const { error } = await client.auth.signOut();
  if (error) throw error;
  return true;
}

export async function getSession() {
  const client = ensureSupabase();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data?.session ?? null;
}

export async function getCurrentUser() {
  const client = ensureSupabase();
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  return data?.user ?? null;
}

export async function resetPassword(email) {
  const client = ensureSupabase();
  const { data, error } = await client.auth.resetPasswordForEmail(email);
  if (error) throw error;
  return data;
}

export default {
  signUp,
  signIn,
  signOut,
  getSession,
  getCurrentUser,
  resetPassword,
};
