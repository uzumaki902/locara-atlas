-- ============================================================================
-- LOCARA ATLAS - MVP V1
-- PHASE 1 DATABASE FOUNDATION
-- Safe migration - preserves all existing data
-- ============================================================================
-- ============================================================================
-- USER ROLE ENUM
-- ============================================================================
DO $$ BEGIN CREATE TYPE public.user_role AS ENUM ('admin', 'client');
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);
-- ============================================================================
-- PROFILES
-- Links directly with auth.users
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT DEFAULT '',
    role public.user_role NOT NULL DEFAULT 'client',
    organization_id UUID REFERENCES public.organizations(id) ON DELETE
    SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        is_active BOOLEAN NOT NULL DEFAULT TRUE
);
-- ============================================================================
-- COLLECTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE
    SET NULL,
        title TEXT NOT NULL,
        description TEXT,
        cover_image_url TEXT,
        tags TEXT [],
        is_published BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT unique_collection_per_org UNIQUE (organization_id, title)
);
-- ============================================================================
-- DATASET REQUESTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.dataset_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE
    SET NULL,
        task_type TEXT,
        environment TEXT,
        hours_needed INTEGER,
        deadline DATE,
        notes TEXT,
        status TEXT DEFAULT 'Submitted',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- ============================================================================
-- ACCESS LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE
    SET NULL,
        action TEXT NOT NULL,
        resource_id TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- ============================================================================
-- ALTER EXISTING VIDEOS TABLE
-- DOES NOT MODIFY EXISTING DATA
-- ============================================================================
ALTER TABLE public.videos
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE
SET NULL,
    ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES public.collections(id) ON DELETE
SET NULL;
-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_org ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_collections_org ON public.collections(organization_id);
CREATE INDEX IF NOT EXISTS idx_collections_created_by ON public.collections(created_by);
CREATE INDEX IF NOT EXISTS idx_dataset_requests_org ON public.dataset_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_user ON public.access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_org ON public.videos(organization_id);
CREATE INDEX IF NOT EXISTS idx_videos_collection ON public.videos(collection_id);
-- ============================================================================
-- END OF PHASE 1
-- No RLS
-- No Triggers
-- No Policies
-- No Existing Data Modified
-- ============================================================================