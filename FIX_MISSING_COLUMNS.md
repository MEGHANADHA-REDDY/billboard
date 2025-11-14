# Fix: Missing `hideFromTime` and `hideToTime` Columns

## Problems
1. Error: `The column hideFromTime does not exist in the current database`
2. Error: `Null constraint violation on the fields: (duration)`

This happened because the migration was marked as applied but didn't actually run. The database still has the old `duration` column (with NOT NULL constraint) but the Prisma schema expects `hideFromTime` and `hideToTime` instead.

## Solution

### Option 1: Run the Fix Script (Recommended)

**On your local machine:**
1. Make sure your `.env` or environment has the **production DATABASE_URL** (Neon connection string)
2. Run:
```bash
npm run fix-columns
```

This will safely add the missing columns if they don't exist.

### Option 2: Run SQL Directly on Neon

1. Go to your Neon dashboard
2. Open the SQL Editor
3. Run this SQL:

```sql
-- Fix Ad table schema: remove old duration, add new time columns
DO $$
BEGIN
    -- Drop duration column if it exists (old column that was replaced)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Ad' AND column_name = 'duration'
    ) THEN
        ALTER TABLE "Ad" DROP COLUMN "duration";
    END IF;
    
    -- Add hideFromTime if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Ad' AND column_name = 'hideFromTime'
    ) THEN
        ALTER TABLE "Ad" ADD COLUMN "hideFromTime" TEXT;
    END IF;
    
    -- Add hideToTime if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Ad' AND column_name = 'hideToTime'
    ) THEN
        ALTER TABLE "Ad" ADD COLUMN "hideToTime" TEXT;
    END IF;
END $$;
```

### Option 3: Use Prisma Studio (Visual)

1. Set your production DATABASE_URL
2. Run: `npx prisma studio`
3. Manually verify columns exist

## Verify It's Fixed

After running the fix, test your app:
1. Try submitting an ad
2. The error should be gone
3. You should be able to set `hideFromTime` and `hideToTime`

## Why This Happened

The migration `20250118120000_remove_duration_add_time_range` was marked as applied in the migration history, but the actual SQL didn't run because the `Ad` table didn't exist yet when we marked it as applied.

The database still has:
- ❌ Old `duration` column (with NOT NULL constraint) - causing "Null constraint violation"
- ❌ Missing `hideFromTime` column - causing "column does not exist"
- ❌ Missing `hideToTime` column - causing "column does not exist"

The fix script safely:
- ✅ Drops the old `duration` column (if it exists)
- ✅ Adds `hideFromTime` column (if missing)
- ✅ Adds `hideToTime` column (if missing)

It's safe to run multiple times - it checks before making changes.

