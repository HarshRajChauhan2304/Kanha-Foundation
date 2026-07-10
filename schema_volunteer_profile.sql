-- SQL Script to update volunteer_applications, users, and admin_users table structures in Supabase
-- Run this in your Supabase Dashboard SQL Editor (https://supabase.com)

-- 1. Update volunteer_applications table
ALTER TABLE public.volunteer_applications 
ADD COLUMN IF NOT EXISTS profile_photo TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT;

-- 2. Update users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- 3. Update admin_users table
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS avatar TEXT;
