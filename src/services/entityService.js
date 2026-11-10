import { ensureSupabase, hasSupabaseConfig, supabase } from './supabaseClient';

const STORAGE_KEY_PREFIX = 'legacy_book_entity_';

const isBrowser = typeof window !== 'undefined';

const readStorage = (key, fallback = []) => {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) ?? fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  if (!isBrowser) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const makeId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `legacy-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export function getStorageKey(name) {
  return `${STORAGE_KEY_PREFIX}${name}`;
}

export function readEntityRecords(name) {
  return readStorage(getStorageKey(name), []);
}

export function writeEntityRecords(name, records) {
  writeStorage(getStorageKey(name), records);
}

function normaliseFilters(filters = {}) {
  if (!filters || typeof filters !== 'object' || Array.isArray(filters)) return {};
  return Object.entries(filters).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) acc[key] = value;
    return acc;
  }, {});
}

function matchFilters(record, filters) {
  return Object.entries(filters).every(([key, value]) => record[key] === value);
}

export async function listEntity(tableName, filters = []) {
  if (hasSupabaseConfig && supabase) {
    let query = supabase.from(tableName).select('*');
    const normalised = normaliseFilters(filters);

    Object.entries(normalised).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }

  const records = readEntityRecords(tableName);
  if (Array.isArray(filters) && filters.length === 0) return records;
  if (filters && typeof filters === 'object' && !Array.isArray(filters)) {
    return records.filter((record) => matchFilters(record, normaliseFilters(filters)));
  }
  return records;
}

export async function filterEntity(tableName, filters = {}) {
  return listEntity(tableName, filters);
}

export async function createEntity(tableName, values = {}) {
  if (hasSupabaseConfig && supabase) {
    const payload = { id: values.id ?? makeId(), ...values };
    const { data, error } = await supabase.from(tableName).insert(payload).select().single();
    if (error) throw error;
    return data ?? payload;
  }

  const record = { id: values.id ?? makeId(), ...values };
  const records = readEntityRecords(tableName);
  records.push(record);
  writeEntityRecords(tableName, records);
  return record;
}

export async function updateEntity(tableName, id, values = {}) {
  if (hasSupabaseConfig && supabase) {
    const particle = { ...values };
    const { data, error } = await supabase.from(tableName).update(particle).eq('id', id).select().single();
    if (error) throw error;
    return data ?? { id, ...particle };
  }

  const records = readEntityRecords(tableName);
  const index = records.findIndex((record) => record.id === id);
  if (index === -1) return null;

  const updated = { ...records[index], ...values };
  records[index] = updated;
  writeEntityRecords(tableName, records);
  return updated;
}

export async function deleteEntity(tableName, id) {
  if (hasSupabaseConfig && supabase) {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  const records = readEntityRecords(tableName).filter((record) => record.id !== id);
  writeEntityRecords(tableName, records);
  return true;
}

export async function upsertEntity(tableName, values = {}) {
  if (hasSupabaseConfig && supabase) {
    const payload = { id: values.id ?? makeId(), ...values };
    const { data, error } = await supabase.from(tableName).upsert(payload, { onConflict: 'id' }).select().single();
    if (error) throw error;
    return data ?? payload;
  }

  const records = readEntityRecords(tableName);
  const index = records.findIndex((record) => record.id === values.id);
  if (index >= 0) {
    const updated = { ...records[index], ...values };
    records[index] = updated;
    writeEntityRecords(tableName, records);
    return updated;
  }

  const created = { id: values.id ?? makeId(), ...values };
  records.push(created);
  writeEntityRecords(tableName, records);
  return created;
}

export async function deleteEntityByFilters(tableName, filters = {}) {
  if (hasSupabaseConfig && supabase) {
    let query = supabase.from(tableName).delete();
    const normalised = normaliseFilters(filters);
    Object.entries(normalised).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { error } = await query;
    if (error) throw error;
    return true;
  }

  const records = readEntityRecords(tableName).filter((record) => !matchFilters(record, normaliseFilters(filters)));
  writeEntityRecords(tableName, records);
  return true;
}

export function getCurrentUserId() {
  if (!isBrowser) return null;
  const session = window.localStorage.getItem('legacy_book_auth_session');
  if (!session) return null;
  try {
    const parsed = JSON.parse(session);
    return parsed?.user?.id ?? null;
  } catch {
    return null;
  }
}

export function withUserFilter(filters = {}) {
  const userId = getCurrentUserId();
  if (!userId) return filters;
  return { ...filters, user_id: userId };
}

export default {
  listEntity,
  filterEntity,
  createEntity,
  updateEntity,
  deleteEntity,
  upsertEntity,
  deleteEntityByFilters,
  getCurrentUserId,
  withUserFilter,
};
