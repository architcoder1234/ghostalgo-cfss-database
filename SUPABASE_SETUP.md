# GhostAlgo CFSS 2023 — Supabase setup

This version uses GitHub Pages for the public frontend and Supabase for the shared catalogue, Storage and Auth.

## 1. Existing Supabase setup

You should already have:
- `public.cars` with columns: `id`, `name`, `category`, `image_url`, `buy_price`, `sell_price`, `notes`, `created_at`
- RLS enabled on `public.cars`
- Public SELECT policy
- GhostAlgo INSERT/UPDATE/DELETE policies
- Public `car-images` Storage bucket
- GhostAlgo Storage INSERT/UPDATE/DELETE policies
- One GhostAlgo Auth user

## 2. Give the Data API least-privilege table grants

Because this project was created with automatic exposure of new tables disabled, run the following in Supabase SQL Editor if the website gets a permission/exposure error:

```sql
grant select on public.cars to anon;
grant select, insert, update, delete on public.cars to authenticated;
grant usage, select on sequence public.cars_id_seq to authenticated;
```

RLS still controls which rows each role can actually access.

## 3. Configure the browser client

Open `supabase-config.js` and replace:

```js
window.CFSS_SUPABASE_CONFIG = {
  url: "https://YOUR_PROJECT_REF.supabase.co",
  publishableKey: "YOUR_SUPABASE_PUBLISHABLE_KEY"
};
```

Get the project URL and **Publishable key** from the Supabase project's Connect/API settings. A publishable/anon client key is intended for browser use when RLS is correctly configured. **Never put a `service_role` or secret key in this file.**

## 4. Login

Open `admin.html` and sign in with the Auth user you created for GhostAlgo. The UI also checks the configured GhostAlgo UID, but the real protection is the database RLS policies.

## 5. Import the catalogue

After logging in, click **Import starter catalogue** once. It inserts missing starter cars and leaves existing cars unchanged.

Then you can:
- add cars
- edit names/categories/prices/notes
- upload images
- delete cars

Visitors on `index.html` are read-only.

## 6. GitHub Pages

Commit all files to the `main` branch. GitHub Pages should publish from `main` / root.

## Security

The browser can safely contain a Supabase publishable/anon key because it is not a secret. Security comes from Auth + RLS + Storage policies. Never publish the database password or `service_role`/secret key.
