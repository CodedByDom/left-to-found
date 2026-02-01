# Left to Found

A public photo project. Physical photographs are placed in public
spaces and left to be found. When one is discovered, the moment is
marked here. The image itself is not collected. What remains is a
record.

`lefttofound.com`

---

## Project Structure

```
left-to-found/
├── app/
│   ├── globals.css                # All styles
│   ├── layout.tsx                 # Shell (header, footer)
│   ├── page.tsx                   # / — Homepage
│   ├── found/
│   │   ├── page.tsx               # /found — Public ledger
│   │   └── [id]/
│   │       ├── page.tsx           # /found/[id] — Record (server)
│   │       └── record-client.tsx  # Record interaction (client)
│   └── api/
│       └── found/
│           └── route.ts           # POST /api/found — Mark as found
├── lib/
│   ├── supabase.ts                # DB clients
│   ├── types.ts                   # TypeScript types
│   ├── rate-limit.ts              # IP-based rate limiter
│   └── sanitize.ts                # Input validation
├── supabase-schema.sql            # Database schema + seed data
├── package.json
├── tsconfig.json
├── next.config.js
├── .env.example
└── .gitignore
```

---

## Database Options (Vercel Storage Tab)

When you open **Storage** in your Vercel dashboard, you'll see
several options. Here's what each one is and why Supabase is the
right pick.

| Option         | Type           | Table Editor | Free Tier   | Right for this? |
|----------------|----------------|:------------:|:-----------:|:---------------:|
| **Supabase**   | Postgres + BaaS| ✓            | 500 MB      | **Yes**         |
| Neon           | Postgres       | ✗            | 512 MB      | Workable        |
| Upstash        | Redis (KV)     | ✗            | 10k cmds/day| No              |
| Vercel Blob    | Object storage | ✗            | 250 MB      | No              |
| EdgeDB         | Relational     | ✗            | 1 GB        | Overkill        |

**Supabase wins** because its Table Editor lets you add new photos
by clicking "Insert Row" — no code, no admin panel. Environment
variables are auto-injected into Vercel. Billed through Vercel.

---

## Setup

Everything is done in GitHub Codespaces and the browser. Nothing
runs on your local machine.

### Step 1 — Create GitHub Repo

1. Go to GitHub → **New Repository**
2. Name it `left-to-found` (or whatever you like)
3. Set to private or public
4. Click **Create Repository**

### Step 2 — Open in Codespaces

1. On your new repo page, click **Code** → **Codespaces** → **Create codespace on main**
2. Wait for the environment to spin up
3. In the Codespace terminal, add all the project files (drag and
   drop from the downloaded archive, or upload via the file
   explorer)
4. Install dependencies:

```bash
npm install
```

### Step 3 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and log in
2. Click **Add New** → **Project**
3. Import your GitHub repo
4. Click **Deploy**
   - It will fail on the first build (no database yet) — that's
     expected

### Step 4 — Create Database via Vercel Storage

1. In your Vercel project dashboard, click the **Storage** tab
2. Click **Create Database**
3. Select **Supabase**
4. Follow the prompts:
   - Pick a region close to your audience
   - Choose the free tier
5. Once created, Vercel automatically injects these environment
   variables into your project:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

**No copy-pasting keys.** Vercel handles the connection.

### Step 5 — Run the Database Schema

1. From the Vercel Storage tab, click **Open in Supabase**
2. In Supabase, go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Paste the entire contents of `supabase-schema.sql`
5. Click **Run**
6. Check **Table Editor** — you should see a `photos` table with
   6 seed rows

### Step 6 — Redeploy

1. Back in Vercel → **Deployments** tab
2. Click the three dots on your latest deployment → **Redeploy**
3. This time it will pick up the environment variables and build
   successfully
4. Your site is live

### Step 7 — Custom Domain (optional)

1. In Vercel → **Settings** → **Domains**
2. Add `lefttofound.com` (or your domain)
3. Follow the DNS instructions
4. SSL is automatic

---

## Developing in Codespaces

When you want to make changes:

1. Open your repo on GitHub → **Code** → **Codespaces** → open
   your existing codespace (or create a new one)
2. You'll need a `.env.local` file for the dev server to connect
   to Supabase. Create it in the root:

```bash
touch .env.local
```

3. Add your keys (get them from Vercel → Storage → your Supabase
   store, or from the Supabase dashboard → Project Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. Run the dev server:

```bash
npm run dev
```

5. Codespaces will offer to open a preview in your browser —
   click the link or the "Open in Browser" popup
6. Make your changes, commit and push:

```bash
git add .
git commit -m "your message"
git push
```

Vercel auto-deploys on every push to main.

**Tip:** Add `.env.local` to `.gitignore` (it's already there) so
your keys never get committed.

---

## Adding New Photos

When you hide a new photograph in the real world:

1. Open Supabase Dashboard → **Table Editor** → `photos`
2. Click **Insert Row**
3. Fill in:
   - `id` — a 4-character code (e.g. `R5J3`)
   - `hidden_date` — formatted date (e.g. `15 March 2026`)
   - `found` — `false`
   - Leave everything else empty/null
4. Click **Save**

The photo is now live at `lefttofound.com/found/R5J3`.

### Back of photograph template

Keep it sparse. Print or handwrite:

```
R5J3
Hidden: 15 March 2026

lefttofound.com/found/R5J3
```

Or a QR code pointing to the URL, with the ID text alongside.

Do not include:
- Project explanation
- Social media handles
- Emotional language

Let curiosity do the work.

---

## Security

| Concern              | How it's handled                                         |
|----------------------|----------------------------------------------------------|
| Spam / bot marking   | Rate limiting (3/min per IP) + honeypot field            |
| Input injection      | HTML stripped, length capped (100 loc, 200 caption)      |
| Re-marking photos    | API rejects + DB-level guard (`found = false` check)     |
| Data tampering       | RLS: public can only SELECT, cannot INSERT/DELETE         |
| SQL injection        | Supabase client uses parameterised queries               |
| HTTPS                | Vercel handles automatically                             |
| Key exposure         | Service role key is server-side only, never in browser    |
