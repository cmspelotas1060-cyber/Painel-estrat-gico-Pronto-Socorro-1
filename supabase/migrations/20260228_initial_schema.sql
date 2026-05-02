-- Migration: Initial Schema for CMSPEL Strategic Panel
-- Created at: 2026-02-28

-- 1. Create a generic key-value store for application data
CREATE TABLE IF NOT EXISTS public.app_data (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.app_data ENABLE ROW LEVEL SECURITY;

-- 3. Create policies (Allowing all for now, but should be restricted in production)
CREATE POLICY "Enable read access for all users" ON public.app_data
    FOR SELECT USING (true);

CREATE POLICY "Enable insert/update access for all users" ON public.app_data
    FOR ALL USING (true);

-- 4. Create a function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_app_data_updated_at
    BEFORE UPDATE ON public.app_data
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Optional: Create more structured tables for key data if needed later
-- For now, the generic app_data table handles the migration from localStorage seamlessly.
