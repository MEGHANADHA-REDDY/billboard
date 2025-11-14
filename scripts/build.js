const { execSync } = require('child_process');

console.log('🔨 Starting build process...\n');

// Helper to validate DATABASE_URL format
function isValidDatabaseUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return trimmed.length > 0 && (trimmed.startsWith('postgresql://') || trimmed.startsWith('postgres://'));
}

try {
  // Check DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  const hasValidDbUrl = isValidDatabaseUrl(dbUrl);
  
  if (dbUrl && !hasValidDbUrl) {
    console.error('❌ DATABASE_URL is set but has invalid format!');
    console.error('💡 DATABASE_URL must start with postgresql:// or postgres://');
    console.error('💡 Current value:', dbUrl ? `"${dbUrl.substring(0, 20)}..."` : '(empty)');
    console.error('\n📝 How to fix:');
    console.error('1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
    console.error('2. Update DATABASE_URL with correct format:');
    console.error('   postgresql://user:password@host:port/database?sslmode=require');
    console.error('3. Redeploy your application\n');
    process.exit(1);
  }

  // Generate Prisma Client (works without DATABASE_URL, but validates format if set)
  console.log('📦 Generating Prisma Client...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
  } catch (error) {
    if (dbUrl) {
      console.error('\n❌ Prisma Client generation failed!');
      console.error('💡 This usually means DATABASE_URL has an invalid format');
      console.error('💡 Check your DATABASE_URL in Vercel environment variables');
    } else {
      console.error('\n❌ Prisma Client generation failed!');
      console.error('💡 This is unexpected - check Prisma schema for errors');
    }
    throw error;
  }

  // Run migrations only if DATABASE_URL is valid
  if (hasValidDbUrl) {
    console.log('\n🗄️  Running database migrations...');
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    } catch (error) {
      console.error('\n❌ Migration failed:', error.message);
      console.error('💡 Make sure DATABASE_URL is correctly set in Vercel environment variables');
      console.error('💡 Format: postgresql://user:password@host:port/database?sslmode=require');
      process.exit(1);
    }
  } else {
    console.log('\n⚠️  DATABASE_URL not set or invalid - skipping migrations');
    console.log('💡 Set DATABASE_URL in Vercel environment variables to enable migrations');
    console.log('💡 Format: postgresql://user:password@host:port/database?sslmode=require');
  }

  // Build Next.js
  console.log('\n🚀 Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });

  console.log('\n✅ Build completed successfully!');
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}

