# Free Deployment Guide for Quizz

This guide will walk you through deploying your application for free using **Vercel** and **Neon**.

## 1. Setup Your Database (Neon)

1.  Go to [Neon.tech](https://neon.tech) and create a free account.
2.  Create a new project (e.g., `quizz-db`).
3.  In your dashboard, find the **Connection String** (it starts with `postgresql://`).
4.  Copy this string.

## 2. Setup Your Frontend (Vercel)

1.  Go to [Vercel.com](https://vercel.com) and create a free account.
2.  Click **"Add New"** -> **"Project"**.
3.  Connect your GitHub repository where this code is pushed.
4.  In the **Environment Variables** section, add:
    *   **Key**: `DATABASE_URL`
    *   **Value**: *The connection string you copied from Neon.*
5.  Click **"Deploy"**.

## 3. Configure Prisma for Production

Vercel will automatically run `npm run build`, but you need to make sure Prisma is correctly initialized.

1.  In your `package.json` (at the root), ensure you have a `postinstall` script:
    ```json
    "scripts": {
      "postinstall": "prisma generate"
    }
    ```
2.  Since this is a monorepo, Vercel might need some extra configuration for the root directory. It's recommended to set the **Root Directory** as `.` and the **Framework Preset** as `Next.js`.

## 4. Run Migrations

Before the app works, the database needs the tables.

1.  Install the Neon CLI OR use the Neon SQL editor to run the initial migration.
2.  Alternatively, you can run this command locally with your production URL:
    ```bash
    DATABASE_URL="your_neon_url" npx prisma db push
    ```

> [!TIP]
> **Why Neon?** Neon has a "Scale to Zero" feature on its free tier, which means it's completely free for small projects and hobbyists.

---

### Alternative: Turso (If you prefer SQLite)

If you'd rather stick to SQLite:
1.  Go to [Turso.tech](https://turso.tech).
2.  Create a database.
3.  Update your `schema.prisma` provider to `libsql`.
4.  Use `DATABASE_URL="libsql://your-db-url"` and token.
