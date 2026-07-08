# Hostel Room Manager

Minimal React + Supabase webapp scaffold for managing a 4-person room: funds, cleaning rota, wifi bills, members, and optional chat.

Quick start

1. Create a Supabase project at https://supabase.com and copy `anon` key and URL.
2. Run SQL from `supabase/schema.sql` in the Supabase SQL editor to create tables.
3. Create a `.env` file in project root with:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Install and run:

```bash
npm install
npm run dev
```

This scaffold includes core pages and a supabase schema to extend.
