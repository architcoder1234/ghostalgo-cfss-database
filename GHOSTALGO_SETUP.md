# 👻 GhostAlgo CFSS 2023 — Supabase Setup

## Project
Project ref: `cvzkpkeuykmwmhcoppvw`
Project URL: `https://cvzkpkeuykmwmhcoppvw.supabase.co`

The website configuration is already filled in `supabase-config.js`.

## Security
NEVER put these in GitHub or frontend JavaScript:
- Database password
- PostgreSQL connection string containing a password
- Supabase `service_role` key
- Any Supabase secret key

The PostgreSQL string you pasted contains `[YOUR-PASSWORD]` and is not needed by the website.

## Supabase CLI
If you want to use the CLI later:
```bash
supabase login
supabase init
supabase link --project-ref cvzkpkeuykmwmhcoppvw
```

## Expected backend
- Table: `public.cars`
- Storage bucket: `car-images`
- Auth: GhostAlgo admin account
- Public visitors: read-only

## Before publishing
1. Upload these files to GitHub.
2. Test the public car catalogue.
3. Test GhostAlgo login.
4. Test add/edit/delete.
5. Test image upload.
6. Verify an incognito visitor can view but cannot modify.
