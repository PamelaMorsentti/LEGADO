# LEGADO

This is a React + Vite application for a digital memory book. It is prepared to run as a standalone frontend for Netlify with Supabase as the data backend while preserving the existing UX and structure as closely as possible.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Required environment variables:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_STORAGE_BUCKET=book-files
VITE_APP_NAME=LEGADO
VITE_APP_BASE_URL=http://localhost:5173
```

The app can also fall back to a local browser-storage mode for local testing when Supabase is not configured.

## Netlify deployment

- Run `npm run build`.
- Publish the generated `dist` directory to Netlify.
- Keep the SPA redirect rule defined in `netlify.toml`.
- Set the same environment variables in Netlify project settings.

## Useful commands

```bash
npm run dev
npm run build
npm run preview
```
