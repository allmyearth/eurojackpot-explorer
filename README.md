# Eurojackpot Explorer

A static GitHub Pages website for searching historical Eurojackpot draws via a read-only Supabase RPC function (`public.explorer_search`).

## Setup
1. Edit `config.js` with your Supabase Project URL and **publishable** key (or legacy anon key).
2. Never put a secret/service_role key or database password into the repository.
3. Enable GitHub Pages: Settings > Pages > Deploy from a branch > main > / (root).
4. Open the Pages URL shown by GitHub.

## Database
The site calls `POST /rest/v1/rpc/explorer_search` with `p_main` and `p_euro` arrays. The database must expose the `public` schema via the Data API, allow `anon` to execute this function, and deny `anon` direct access to the `draws` table. Keep `SECURITY DEFINER` functions tightly scoped.

## Limitations
The RPC currently returns only draws with at least two matching main numbers, limited to 100. The displayed category counts are counts within those returned results, not complete historical frequencies. For a comprehensive summary, add a separate, similarly restricted aggregate RPC later.
