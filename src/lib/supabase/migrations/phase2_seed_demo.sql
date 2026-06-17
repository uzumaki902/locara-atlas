BEGIN;
-- 1. Create Organization if missing
INSERT INTO public.organizations (name)
VALUES ('Locara AI') ON CONFLICT (name) DO NOTHING;
-- 2. Select Organization ID and 3. Create Collection if missing
WITH org AS (
    SELECT id
    FROM public.organizations
    WHERE name = 'Locara AI'
    LIMIT 1
)
INSERT INTO public.collections (organization_id, title, is_published)
SELECT org.id,
    'Demo Dataset',
    true
FROM org ON CONFLICT (organization_id, title) DO NOTHING;
-- 4. Select IDs and 5. Update existing videos
WITH org AS (
    SELECT id
    FROM public.organizations
    WHERE name = 'Locara AI'
    LIMIT 1
), col AS (
    SELECT id
    FROM public.collections
    WHERE title = 'Demo Dataset'
        AND organization_id = (
            SELECT id
            FROM org
        )
    LIMIT 1
)
UPDATE public.videos
SET organization_id = (
        SELECT id
        FROM org
    ),
    collection_id = (
        SELECT id
        FROM col
    )
WHERE TRUE;
COMMIT;