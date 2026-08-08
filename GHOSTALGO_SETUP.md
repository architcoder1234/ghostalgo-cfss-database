# 👻 GhostAlgo CFSS 2023 — Final Supabase Setup

## Supabase project
Project ref: `cvzkpkeuykmwmhcoppvw`
Project URL: `https://cvzkpkeuykmwmhcoppvw.supabase.co`

`supabase-config.js` is already configured with the public publishable key.

## IMPORTANT SECURITY
Never commit or paste into frontend files:
- database password
- PostgreSQL connection string containing a password
- `service_role` key
- any Supabase secret key

The website only needs the public publishable key. RLS policies protect database writes.

## Supabase CLI
Optional:
```bash
supabase login
supabase init
supabase link --project-ref cvzkpkeuykmwmhcoppvw
```

## Expected backend
- `public.cars`
- Storage bucket: `car-images`
- GhostAlgo admin UUID: `a6a20264-3bda-4a41-9570-61548f7fb5b6`
- Public users: read-only
- GhostAlgo: add/edit/delete cars and manage images

## GitHub Pages
Upload ALL project files, including:
- `index.html`
- `admin.html`
- `app.js`
- `admin.js`
- `cars.js`
- `style.css`
- `supabase-config.js`

Do not omit the JavaScript files.
