# AGENTS.md

## Project Context

This repository is a custom React + Vite application for a family memory book. Keep changes focused on the user's request, preserve the existing app structure and visual design, and avoid unnecessary rewrites.

Start with `README.md` for local setup, environment variables, and deployment workflow.

## Key Files

- `src/`: frontend application source.
- `src/api/appClient.js`: app compatibility/client layer for the standalone runtime.
- `src/services/`: Supabase-facing data services.
- `vite.config.js`: Vite configuration.
- `.env.local`: local-only env values; never commit secrets.

## Working Notes

- Prefer a conservative migration strategy: keep UI and routes stable while replacing backend dependencies.
- Use `npm run dev` for the frontend locally and `npm run build` before finishing changes.
- Keep the app deployable to Netlify with Supabase as the data backend.
- Run the relevant checks from `package.json` before finishing code changes.
