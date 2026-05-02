-- Create the app_data table to store generic application state
CREATE TABLE IF NOT EXISTS public.app_data (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.app_data ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone with the anon key to read/write
-- NOTE: In a production app, you should restrict this to authenticated users
CREATE POLICY "Allow public access to app_data" 
ON public.app_data 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create an index on updated_at for better performance if needed
CREATE INDEX IF NOT EXISTS idx_app_data_updated_at ON public.app_data (updated_at);

-- Add a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_app_data_updated_at
    BEFORE UPDATE ON public.app_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
