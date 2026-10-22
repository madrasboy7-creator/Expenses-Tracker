# Lucifer Tracker — Personal Monthly Expense Tracker

A complete, secure, responsive, and lightweight personal monthly expense tracker web application built with **Next.js (App Router), TypeScript, Tailwind CSS, and Supabase PostgreSQL**, designed for deployment on **Render** and version control on **GitHub**.

---

## 1. Key Features

- **Personal Single-User Focus:** Tailored for a single personal account with strict Row Level Security (RLS).
- **Starting Month:** Tracker starts from **October 2026** onwards.
- **Optional Monthly Spending Limit:**
  - Users can set an optional monthly budget limit per month.
  - When set, total monthly expenses are dynamically subtracted from the limit (`Remaining Balance = Limit - Total Expenses`).
  - Progress bar shows percentage of limit consumed, with automatic "Over Budget" alert indicators if exceeded.
- **Categories:**
  1. **Food**
  2. **Transportation**
  3. **Shopping**
  4. **Education**
  5. **Entertainment**
  6. **Other** — allows user to manually type and specify the custom category name (e.g. Health, Bills, Fitness, Rent, Gifts).
- **Indian Rupee (INR ₹) Support:** Formats all amounts in standard Indian numbering system (`₹1,25,000.00`).
- **Reporting Timezone:** Asia/Kolkata date handling with calendar date preservation to prevent timezone drift.
- **Interactive Visualizations:**
  - Responsive 6-month spending trend comparison chart.
  - Category breakdown with progress bars, percentages, and transaction counts.
- **History & Filtering:** Chronological history, month selector, category filter, text search, inline editing, and deletion with confirmation dialog.
- **CSV Data Export:** RFC 4180 compliant CSV export with UTF-8 BOM for Microsoft Excel and Google Sheets.
- **Appearance:** Built-in Light and Dark themes with persistent user preference.

---

## 2. Tech Stack

- **Framework:** Next.js 16 (App Router with Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Supabase Auth (Email + Password)
- **Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Icons:** Lucide React
- **Hosting:** Render Web Service
- **Source Control:** GitHub

---

## 3. Database Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open and run the migration script located at [`supabase/migrations/20261021_001_create_expenses.sql`](supabase/migrations/20261021_001_create_expenses.sql).
4. The migration will:
   - Create `public.expenses` table with all fields and check constraints.
   - Create `public.monthly_limits` table for optional monthly budget limits.
   - Create indexes on `(user_id, expense_date DESC)` and `(user_id, year, month)`.
   - Enable Row Level Security (RLS) on all tables.
   - Create SELECT, INSERT, UPDATE, and DELETE policies enforcing `auth.uid() = user_id`.
   - Create an automated trigger for `updated_at`.

---

## 4. Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Populate with your Supabase project credentials (found in Supabase Dashboard -> **Project Settings** -> **API**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-publishable-key
```

*(Note: Never commit `.env.local` to Git. It is already added to `.gitignore`.)*

---

## 5. Local Development

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

Build for production:
```bash
npm run build
```

Run production server:
```bash
npm run start
```

---

## 6. GitHub Repository Setup

To push this codebase to GitHub:

```bash
git init
git add .
git commit -m "feat: initial commit of Lucifer Tracker"
git branch -M main
git remote add origin https://github.com/<your-username>/lucifer-tracker.git
git push -u origin main
```

---

## 7. Render Deployment

Deploy the Next.js application as a **Render Web Service**:

1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (`lucifer-tracker`).
4. Configure service details:
   - **Name:** `lucifer-tracker`
   - **Region:** Singapore / closest to your audience.
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm run start`
   - **Plan:** Free or Starter.
5. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase Anon Key
   - `NODE_VERSION` = `24.15.0` (or `20+`)
6. Click **Deploy Web Service**.
7. Once deployed, add your Render domain (e.g. `https://lucifer-tracker.onrender.com`) to Supabase Dashboard -> **Authentication** -> **URL Configuration** -> **Site URL** and **Redirect URLs** (`https://lucifer-tracker.onrender.com/auth/callback`).

---

## 8. Verification & Testing Checklist

- [x] Application name is **Lucifer Tracker** across navbar, login, and pages.
- [x] Starting date/month is **October 2026** onwards.
- [x] Optional monthly spending limit can be set and updated per month.
- [x] Expenses are dynamically subtracted from the limit (`Remaining = Limit - Total Expenses`).
- [x] Over-budget alerts appear when spending exceeds the limit.
- [x] Categories include Food, Transportation, Shopping, Education, Entertainment, and Other.
- [x] Other category prompts for manual category name input and displays it on badges and CSV.
- [x] Currency is formatted in Indian Rupees (INR ₹).
- [x] Production build passes cleanly with zero errors (`npm run build`).
- [x] Light and Dark modes toggle and persist in local preferences.
