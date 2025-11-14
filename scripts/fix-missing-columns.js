const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixMissingColumns() {
  try {
    console.log('Fixing database schema...');
    console.log('This will:');
    console.log('  1. Drop the old "duration" column (if it exists)');
    console.log('  2. Add "hideFromTime" column (if missing)');
    console.log('  3. Add "hideToTime" column (if missing)');
    console.log('');
    
    // Use raw SQL to fix the schema
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        -- Drop duration column if it exists (old column that was replaced)
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'Ad' AND column_name = 'duration'
        ) THEN
          ALTER TABLE "Ad" DROP COLUMN "duration";
          RAISE NOTICE 'Dropped duration column';
        ELSE
          RAISE NOTICE 'duration column does not exist (already removed)';
        END IF;
        
        -- Add hideFromTime if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'Ad' AND column_name = 'hideFromTime'
        ) THEN
          ALTER TABLE "Ad" ADD COLUMN "hideFromTime" TEXT;
          RAISE NOTICE 'Added hideFromTime column';
        ELSE
          RAISE NOTICE 'hideFromTime column already exists';
        END IF;
        
        -- Add hideToTime if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'Ad' AND column_name = 'hideToTime'
        ) THEN
          ALTER TABLE "Ad" ADD COLUMN "hideToTime" TEXT;
          RAISE NOTICE 'Added hideToTime column';
        ELSE
          RAISE NOTICE 'hideToTime column already exists';
        END IF;
      END $$;
    `);
    
    console.log('✅ Database schema fixed successfully!');
    console.log('');
    console.log('The Ad table now has:');
    console.log('  - hideFromTime (TEXT, nullable)');
    console.log('  - hideToTime (TEXT, nullable)');
    console.log('  - duration column removed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('');
    console.error('Make sure:');
    console.error('  1. DATABASE_URL is set correctly');
    console.error('  2. You have permission to alter the table');
    console.error('  3. The database is accessible');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixMissingColumns();

