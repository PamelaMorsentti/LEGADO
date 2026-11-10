import { hasSupabaseConfig, supabase } from '@/services/supabaseClient';

const ENTITY_TABLES = {
  Answer: 'answers',
  ChapterCover: 'chapter_covers',
  FamilyMember: 'family_members',
  FamilyMessage: 'family_messages',
  FutureLetter: 'future_letters',
  OwnChapter: 'own_chapters',
  OwnQuestion: 'own_questions',
  Photo: 'photos',
  Place: 'places',
  ProfileInfo: 'profile_info',
  Recipe: 'recipes',
  Song: 'songs',
  Sticker: 'stickers',
  TimelineEvent: 'timeline_events',
};

const AUTH_KEY = 'legacy_book_auth_session';
const OTP_KEY = 'legacy_book_pending_otp';

const isBrowser = typeof window !== 'undefined';

const readStorage = (key, fallback = []) => {
  if (!isBrowser) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  if (!isBrowser) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const removeStorage = (key) => {
  if (!isBrowser) return;
  window.localStorage.removeItem(key);
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `legacy-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const readSession = () => readStorage(AUTH_KEY, null);
const writeSession = (session) => writeStorage(AUTH_KEY, session);
const clearSession = () => removeStorage(AUTH_KEY);

const readPendingOtp = () => readStorage(OTP_KEY, {});
const writePendingOtp = (value) => writeStorage(OTP_KEY, value);

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    if (typeof file === 'string') {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });

const entityKey = (entityName) => `legacy_book_entity_${entityName}`;

const readEntityRecords = (entityName) => readStorage(entityKey(entityName), []);
const writeEntityRecords = (entityName, records) => writeStorage(entityKey(entityName), records);

const applyFilters = (records, filters = {}) => {
  if (!filters || typeof filters !== 'object' || Array.isArray(filters)) return records;

  return records.filter((record) =>
    Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null) return true;
      return record[key] === value;
    })
  );
};

const createEntityModule = (entityName) => ({
  async list(filters = []) {
    if (hasSupabaseConfig && supabase) {
      try {
        let query = supabase.from(entityName).select('*');
        if (filters && typeof filters === 'object' && !Array.isArray(filters)) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              query = query.eq(key, value);
            }
          });
        }

        const { data, error } = await query;
        if (error) throw error;
        return data ?? [];
      } catch (error) {
        console.warn(`[appClient] ${entityName}.list() falling back to local storage`, error);
      }
    }

    const records = readEntityRecords(entityName);
    if (Array.isArray(filters) && filters.length === 0) return records;
    if (filters && typeof filters === 'object' && !Array.isArray(filters)) {
      return applyFilters(records, filters);
    }
    return records;
  },

  async filter(filters = {}) {
    if (hasSupabaseConfig && supabase) {
      try {
        let query = supabase.from(entityName).select('*');
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
        const { data, error } = await query;
        if (error) throw error;
        return data ?? [];
      } catch (error) {
        console.warn(`[appClient] ${entityName}.filter() falling back to local storage`, error);
      }
    }

    const records = readEntityRecords(entityName);
    return applyFilters(records, filters);
  },

  async create(values = {}) {
    if (hasSupabaseConfig && supabase) {
      try {
        const record = { id: values.id ?? generateId(), ...values };
        const { data, error } = await supabase.from(entityName).insert(record).select().single();
        if (error) throw error;
        return data ?? record;
      } catch (error) {
        console.warn(`[appClient] ${entityName}.create() falling back to local storage`, error);
      }
    }

    const record = { id: values.id ?? generateId(), ...values };
    const records = readEntityRecords(entityName);
    records.push(record);
    writeEntityRecords(entityName, records);
    return record;
  },

  async bulkCreate(values = []) {
    if (hasSupabaseConfig && supabase) {
      try {
        const list = Array.isArray(values) ? values : [];
        const payload = list.map((item) => ({ id: item.id ?? generateId(), ...item }));
        const { data, error } = await supabase.from(entityName).insert(payload).select();
        if (error) throw error;
        return data ?? payload;
      } catch (error) {
        console.warn(`[appClient] ${entityName}.bulkCreate() falling back to local storage`, error);
      }
    }

    const list = Array.isArray(values) ? values : [];
    const records = readEntityRecords(entityName);
    const created = list.map((item) => {
      const record = { id: item.id ?? generateId(), ...item };
      records.push(record);
      return record;
    });
    writeEntityRecords(entityName, records);
    return created;
  },

  async update(id, values = {}) {
    if (hasSupabaseConfig && supabase) {
      try {
        const payload = typeof id === 'object' && id && !values?.id ? id : { ...values };
        const targetId = typeof id === 'string' || typeof id === 'number' ? id : payload.id;
        const { data, error } = await supabase.from(entityName).update(payload).eq('id', targetId).select().single();
        if (error) throw error;
        return data ?? payload;
      } catch (error) {
        console.warn(`[appClient] ${entityName}.update() falling back to local storage`, error);
      }
    }

    const records = readEntityRecords(entityName);
    const index = records.findIndex((record) => record.id === id);
    if (index === -1) {
      return null;
    }

    const updated = { ...records[index], ...values };
    records[index] = updated;
    writeEntityRecords(entityName, records);
    return updated;
  },

  async updateMany(filters = {}, updates = {}) {
    if (hasSupabaseConfig && supabase) {
      try {
        let query = supabase.from(entityName).update(updates);
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
        const { data, error } = await query.select();
        if (error) throw error;
        return data ?? [];
      } catch (error) {
        console.warn(`[appClient] ${entityName}.updateMany() falling back to local storage`, error);
      }
    }

    const records = readEntityRecords(entityName);
    const nextRecords = records.map((record) => {
      if (Object.entries(filters).every(([key, value]) => record[key] === value)) {
        return { ...record, ...updates };
      }
      return record;
    });
    writeEntityRecords(entityName, nextRecords);
    return nextRecords;
  },

  async delete(id) {
    if (hasSupabaseConfig && supabase) {
      try {
        const targetId = id?.id ?? id;
        const { error } = await supabase.from(entityName).delete().eq('id', targetId);
        if (error) throw error;
        return true;
      } catch (error) {
        console.warn(`[appClient] ${entityName}.delete() falling back to local storage`, error);
      }
    }

    const records = readEntityRecords(entityName);
    const filtered = records.filter((record) => record.id !== id);
    writeEntityRecords(entityName, filtered);
    return filtered;
  },

  async deleteMany(filters = {}) {
    if (hasSupabaseConfig && supabase) {
      try {
        let query = supabase.from(entityName).delete();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
        const { error } = await query;
        if (error) throw error;
        return true;
      } catch (error) {
        console.warn(`[appClient] ${entityName}.deleteMany() falling back to local storage`, error);
      }
    }

    const records = readEntityRecords(entityName);
    const filtered = records.filter((record) =>
      !Object.entries(filters).every(([key, value]) => record[key] === value)
    );
    writeEntityRecords(entityName, filtered);
    return filtered;
  },
});

const createAuthApi = () => ({
  async me() {
    const session = readSession();
    if (!session?.user) {
      const error = new Error('Authentication required');
      error.status = 401;
      throw error;
    }
    return { ...session.user, id: session.user.id ?? session.user.email };
  },

  async getPublicSettings() {
    return { id: 'legacy-book-app', public_settings: {} };
  },

  async loginViaEmailPassword(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const user = {
      id: generateId(),
      email,
      name: email.split('@')[0],
      provider: 'email',
    };

    const session = {
      token: generateId(),
      user,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
    };

    writeSession(session);
    return { user, access_token: session.token };
  },

  async loginWithProvider(provider, returnTo) {
    const email = `user@${provider}.local`;
    const session = {
      token: generateId(),
      user: {
        id: generateId(),
        email,
        name: `${provider} user`,
        provider,
      },
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
    };

    writeSession(session);
    if (returnTo && isBrowser) {
      const nextUrl = new URL(returnTo, window.location.origin);
      if (nextUrl.origin === window.location.origin) {
        window.location.href = nextUrl.href;
      }
    }
    return { user: session.user, access_token: session.token };
  },

  async register({ email, password }) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    writePendingOtp({ [email]: code });
    return { ok: true, email, otpCode: code };
  },

  async verifyOtp({ email, otpCode }) {
    const pending = readPendingOtp();
    if (!pending?.[email] || String(pending[email]) !== String(otpCode)) {
      throw new Error('Invalid verification code');
    }

    const user = {
      id: generateId(),
      email,
      name: email.split('@')[0],
      provider: 'email',
    };

    const session = { token: generateId(), user, expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7 };
    writeSession(session);
    removeStorage(OTP_KEY);
    return { access_token: session.token, user };
  },

  async resendOtp(email) {
    if (!email) throw new Error('Email is required');
    return this.register({ email, password: 'temporary' });
  },

  async logout(redirectUrl) {
    clearSession();
    if (redirectUrl && isBrowser) {
      window.location.href = redirectUrl;
    }
  },

  redirectToLogin(returnTo) {
    if (!isBrowser) return;
    const nextUrl = returnTo && returnTo !== 'null' ? encodeURIComponent(returnTo) : '';
    const loginUrl = nextUrl ? `/login?returnTo=${nextUrl}` : '/login';
    window.location.href = loginUrl;
  },

  setToken(token) {
    const current = readSession();
    writeSession({ ...(current ?? {}), token });
  },

  getToken() {
    return readSession()?.token ?? null;
  },
});

const createIntegrationsApi = () => ({
  Core: {
    async UploadPrivateFile({ file }) {
      const dataUri = await fileToDataUrl(file);
      return { file_uri: dataUri };
    },

    async UploadPublicFile({ file }) {
      const dataUri = await fileToDataUrl(file);
      return { file_url: dataUri };
    },

    async CreateFileSignedUrl({ file_uri }) {
      const signedUrl = file_uri || '';
      return { signed_url: signedUrl };
    },
  },
});

const entityEntries = Object.fromEntries(
  Object.entries(ENTITY_TABLES).map(([entityName, tableName]) => [entityName, createEntityModule(tableName)])
);

const appClient = {
  app: createAuthApi(),
  auth: createAuthApi(),
  integrations: createIntegrationsApi(),
  entities: entityEntries,
};

export { appClient };