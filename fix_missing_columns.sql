-- Add missing columns to Ad table
-- This migration was marked as applied but didn't actually run

-- Check if columns exist before adding them
DO $$
BEGIN
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

