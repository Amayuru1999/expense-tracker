# 💰 Expense Tracker (Next.js + Supabase + Vercel)

A full-stack, responsive expense management application built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL)**, pre-populated with expenses from March 9, 2026 to present.

---

## 🚀 Live Features

- **Executive Financial Dashboard**:
  - Total expenditure and total transaction summaries
  - Average expense per transaction
  - Top category distribution chart (Pie chart using Recharts)
  - Monthly spending trajectory (Bar chart using Recharts)
  - Most frequent expense sub-types (e.g. Lunch Food, Morning Transport)
- **Detailed Expenses Ledger**:
  - Filterable by Category (`Food`, `Transport`, `Water`, etc.)
  - Filterable by specific Date
  - Instant delete capability with confirmation
- **Add Expense Form**:
  - Real-time form with category and sub-category cascading pickers
  - Server actions with Next.js revalidation
- **Historical Data Migrated**:
  - All 29 weekly expense sheets (March 9, 2026 – September 24, 2026) extracted and migrated directly into the Supabase database (440 total records, ~LKR 114,668.81).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (React 19, App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase PostgreSQL
- **Data Visualizations**: Recharts
- **Icons**: Lucide React
- **Deployment Target**: Vercel

---

## 📦 Database Schema

```sql
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  category TEXT NOT NULL,
  sub_category TEXT,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_date ON expenses(date DESC);
CREATE INDEX idx_expenses_category ON expenses(category);
```

---

## ⚙️ Environment Variables

Create a `.env.local` file with:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.ixyagmwtvenklguggose.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://ixyagmwtvenklguggose.supabase.co
```

---

## 🚢 Deploying to Vercel

### Option 1: Via GitHub (Recommended)
1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit: Expense Tracker"
   git remote add origin https://github.com/<YOUR_USERNAME>/expense-tracker.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository.
3. In **Environment Variables**, add:
   - `DATABASE_URL`: `postgresql://postgres:Amayuru%401999@db.ixyagmwtvenklguggose.supabase.co:5432/postgres`
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://ixyagmwtvenklguggose.supabase.co`
4. Click **Deploy**!

### Option 2: Via Vercel CLI
```bash
npx vercel
```
Follow the interactive prompts and enter the `DATABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL` when requested.
