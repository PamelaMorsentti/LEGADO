import { ensureSupabase } from './supabaseClient';

export async function uploadFile(bucket, file, path) {
  const client = ensureSupabase();
  const safePath = path ?? `${Date.now()}-${file.name}`;

  const { data, error } = await client.storage.from(bucket).upload(safePath, file, {
    upsert: true,
    contentType: file.type || 'application/octet-stream',
  });

  if (error) throw error;
  return data;
}

export function getPublicUrl(bucket, path) {
  const client = ensureSupabase();
  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl ?? null;
}

export async function deleteFile(bucket, path) {
  const client = ensureSupabase();
  const { error } = await client.storage.from(bucket).remove([path]);
  if (error) throw error;
  return true;
}

export default {
  uploadFile,
  getPublicUrl,
  deleteFile,
};
