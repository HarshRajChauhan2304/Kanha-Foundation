-- SQL Script to create the 'contact_submissions' table in Supabase
-- Run this in your Supabase Dashboard SQL Editor (https://supabase.com)

-- 1. Create the contact_submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- 3. Create security policies
-- Allow anyone to submit a contact form (Insert access)
DROP POLICY IF EXISTS "Allow public insert access" ON public.contact_submissions;
CREATE POLICY "Allow public insert access" ON public.contact_submissions
  FOR INSERT WITH CHECK (true);

-- Allow administrative service role full read/write access
DROP POLICY IF EXISTS "Allow service role read write access" ON public.contact_submissions;
CREATE POLICY "Allow service role read write access" ON public.contact_submissions
  USING (true)
  WITH CHECK (true);
