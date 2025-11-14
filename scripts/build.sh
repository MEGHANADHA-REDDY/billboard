#!/bin/bash
set -e

echo "🔨 Starting build process..."

# Generate Prisma Client (works without DATABASE_URL)
echo "📦 Generating Prisma Client..."
npx prisma generate

# Run migrations only if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "🗄️  Running database migrations..."
  npx prisma migrate deploy
else
  echo "⚠️  DATABASE_URL not set - skipping migrations"
  echo "💡 Set DATABASE_URL in Vercel environment variables to enable migrations"
fi

# Build Next.js
echo "🚀 Building Next.js application..."
next build

echo "✅ Build completed successfully!"

