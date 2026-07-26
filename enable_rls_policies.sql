-- ==============================================================================
-- SUPABASE RLS (ROW LEVEL SECURITY) - FULL UNBLOCK ACCESS FOR USER, VOLUNTEER & ADMIN
-- This script enables RLS on all existing database tables and attaches explicit 
-- SELECT, INSERT, UPDATE, DELETE policies TO PUBLIC (anon, authenticated, admin).
-- This guarantees zero issues when users, volunteers, or admins add, edit, or update data.
-- ==============================================================================

DO $$
DECLARE
    t TEXT;
    target_tables TEXT[] := ARRAY[
        'volunteer_applications',
        'volunteer_tasks',
        'star_volunteers',
        'volunteers',
        'directors',
        'users',
        'admin_users',
        'causes',
        'categories',
        'donations',
        'beneficiaries',
        'contact_info',
        'contact_submissions',
        'blogs',
        'reviews',
        'stories',
        'detailed_stories',
        'success_stories',
        'page_media',
        'page_texts',
        'stats_cards',
        'otps'
    ];
BEGIN
    FOREACH t IN ARRAY target_tables
    LOOP
        IF EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
              AND table_name = t
        ) THEN
            -- 1. Enable RLS on the table
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
            
            -- 2. Clean up any existing policies
            EXECUTE format('DROP POLICY IF EXISTS "Public full access select" ON public.%I;', t);
            EXECUTE format('DROP POLICY IF EXISTS "Public full access insert" ON public.%I;', t);
            EXECUTE format('DROP POLICY IF EXISTS "Public full access update" ON public.%I;', t);
            EXECUTE format('DROP POLICY IF EXISTS "Public full access delete" ON public.%I;', t);
            EXECUTE format('DROP POLICY IF EXISTS "Allow full access for %I" ON public.%I;', t, t);

            -- 3. Grant Explicit SELECT, INSERT, UPDATE, DELETE permissions to PUBLIC (anon & authenticated)
            EXECUTE format('CREATE POLICY "Public full access select" ON public.%I FOR SELECT TO PUBLIC USING (true);', t);
            EXECUTE format('CREATE POLICY "Public full access insert" ON public.%I FOR INSERT TO PUBLIC WITH CHECK (true);', t);
            EXECUTE format('CREATE POLICY "Public full access update" ON public.%I FOR UPDATE TO PUBLIC USING (true) WITH CHECK (true);', t);
            EXECUTE format('CREATE POLICY "Public full access delete" ON public.%I FOR DELETE TO PUBLIC USING (true);', t);

            RAISE NOTICE 'RLS & Policies successfully applied for table: %', t;
        ELSE
            RAISE NOTICE 'Skipped non-existent table: %', t;
        END IF;
    END LOOP;
END $$;
