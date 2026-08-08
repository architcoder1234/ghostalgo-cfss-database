# Public deployment plan

## Recommended setup
- GitHub Pages: public frontend hosting
- Supabase Postgres: shared car catalogue
- Supabase Storage: car images
- Supabase Auth: your private admin login
- RLS: visitors SELECT only; your admin can INSERT/UPDATE/DELETE

## Important
The included admin page is a prototype and stores data locally. Do not treat it as secure authentication.

For production, create a `cars` table with:
`id`, `name`, `category`, `image_url`, `buy_price`, `sell_price`, `notes`, `created_at`.

Create a `car-images` storage bucket. Make images readable publicly, but allow uploads/deletes only for your authenticated admin.

Never put a Supabase service-role key in browser JavaScript.
