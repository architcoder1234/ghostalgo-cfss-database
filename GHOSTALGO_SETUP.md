# 👻 GhostAlgo CFSS 2023 — Supabase Setup

## Supabase project
Project ref: `cvzkpkeuykmwmhcoppvw`
Project URL: `https://cvzkpkeuykmwmhcoppvw.supabase.co`

The project is configured in `supabase-config.js` with the public publishable key.

## Important browser fix
The website uses `supabaseClient` internally so it does not conflict with the Supabase CDN's global `supabase` variable. This fixes the Edge/Chrome console error:

`Identifier 'supabase' has already been declared`

The "Tracking Prevention blocked access to storage for cdn.jsdelivr.net" messages are browser privacy notices and are not the login error.

## Security
Never commit:
- database password
- PostgreSQL connection string containing a password
- `service_role` key
- Supabase secret key

## Expected backend
- `public.cars`
- Storage bucket: `car-images`
- GhostAlgo admin UUID: `a6a20264-3bda-4a41-9570-61548f7fb5b6`
- Public users: read-only
- GhostAlgo: add/edit/delete cars and manage images

## GitHub Pages
Upload/replace all files in this folder, especially:
- `index.html`
- `admin.html`
- `app.js`
- `admin.js`
- `cars.js`
- `style.css`
- `supabase-config.js`

After GitHub Pages redeploys, hard refresh with `Ctrl + Shift + R`.
