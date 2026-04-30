# Deluxify Website

Marketing and lead-generation website for **Deluxify** — South Africa's AI solutions company based in Bloemfontein.

Built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

---

## Pages

| Route | Description |
|---|---|
| `/` | Home — hero, stats, services overview, testimonials, pricing |
| `/about` | Company story and team |
| `/services` | AI Automation, Chatbots, Integrations, Consulting |
| `/case-studies` | Client success stories |
| `/contact` | Contact form (saves to Supabase) |
| `/book-call` | Paid consultation booking (Paystack) |
| `/blog` | Blog listing |
| `/careers` | Open roles |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/cookies` | Cookie policy |

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom design system
- **Animations**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude (Ask AI widget)
- **Deployment**: Netlify

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.local.example` or create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

Get your Supabase keys from the [Supabase dashboard](https://supabase.com/dashboard) → Settings → API.  
Get your Anthropic key from the [Anthropic console](https://console.anthropic.com/settings/api-keys).

### 3. Set up the database

Run the SQL in `supabase-schema.sql` in the Supabase SQL Editor. This creates three tables:

- `contact_submissions` — contact form entries
- `bookings` — paid consultation bookings
- `newsletter_subscribers` — email subscribers

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/contact` | POST | Save contact form submission to Supabase |
| `/api/bookings` | POST | Save booking after Paystack payment |
| `/api/newsletter` | POST | Subscribe email to newsletter list |
| `/api/ask-ai` | POST | Ask the Deluxify AI assistant (Claude Haiku) |

---

## Deployment (Netlify)

1. Connect the GitHub repo to Netlify.
2. Set all four environment variables in **Site settings → Environment variables**.
3. Build command: `npm run build` — Publish directory: `.next`
4. The `netlify.toml` at the root handles Next.js config and secrets scanning omissions.
