# Quick Database Setup for Vercel

## 🚀 3 Simple Steps

### 1. Get a PostgreSQL Database (Choose One)

**Easiest Option - Vercel Postgres:**
- Go to Vercel Dashboard → Your Project → **Storage** tab
- Click **Create Database** → **Postgres**
- Choose Hobby (free) plan
- ✅ Connection string is automatically added!

**Alternative - Neon (Free):**
- Sign up at [neon.tech](https://neon.tech)
- Create project → Copy connection string
- Format: `postgresql://user:pass@host/db?sslmode=require`

### 2. Add DATABASE_URL to Vercel

1. Vercel Dashboard → Your Project → **Settings**
2. **Environment Variables** → **Add New**
3. Key: `DATABASE_URL`
4. Value: Your connection string
5. Select: Production, Preview, Development
6. **Save**

### 3. Deploy!

- Push to git or trigger a new deployment
- Migrations run automatically during build (only if DATABASE_URL is set)
- ✅ Done!

**⚠️ Important:** Make sure to set `DATABASE_URL` in Vercel **BEFORE** deploying, otherwise the build will fail!

---

## 🔍 Verify It Works

After deployment:
1. Visit your Vercel URL
2. Try registering a user
3. Check Vercel logs for any errors

---

## ⚠️ Important Notes

- **First deployment**: Make sure `DATABASE_URL` is set BEFORE deploying
- **Migrations**: Run automatically on each build (safe to run multiple times)
- **File uploads**: Still need cloud storage (Vercel Blob, S3, etc.)

See `VERCEL_DATABASE_SETUP.md` for detailed instructions and troubleshooting.

