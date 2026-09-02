-- SQL Script to update users and volunteer_applications tables with Date of Birth (DOB)
-- Run this in your Supabase Dashboard SQL Editor (https://supabase.com)

-- 1. Add dob column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS dob TEXT;

-- 2. Add dob column to volunteer_applications table
ALTER TABLE public.volunteer_applications 
ADD COLUMN IF NOT EXISTS dob TEXT;
