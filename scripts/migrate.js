const { execSync } = require('child_process');

console.log('Running database migration...');

try {
  // Generate Prisma client
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Deploy migrations
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  console.log('✅ Database migration completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
