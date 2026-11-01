-- Replaces EventProfileRelation with Program / ProgramProfileRelation / ProgramEventRelation.
--
-- Run this BEFORE `prisma db push`, otherwise db push drops EventProfileRelation and its data:
--   npx prisma db execute --file prisma/sql/replace-event-profiles-with-programs.sql --schema prisma/schema.prisma
--
-- Every event that has profile links becomes a program with the same title, linked to that event,
-- and each profile link keeps its progressToAdd as the program weight.
-- Safe to re-run: tables/columns/rows are only created when missing.

BEGIN;

-- 1. Program tables (same DDL prisma db push would create)
CREATE TABLE IF NOT EXISTS "Program" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProgramProfileRelation" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "progressToAdd" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgramProfileRelation_pkey" PRIMARY KEY ("id")
);

-- In case the table was created by an earlier db push without the weight column
ALTER TABLE "ProgramProfileRelation" ADD COLUMN IF NOT EXISTS "progressToAdd" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "ProgramEventRelation" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgramEventRelation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Program_name_key" ON "Program"("name");
CREATE INDEX IF NOT EXISTS "ProgramProfileRelation_programId_idx" ON "ProgramProfileRelation"("programId");
CREATE INDEX IF NOT EXISTS "ProgramProfileRelation_profileId_idx" ON "ProgramProfileRelation"("profileId");
CREATE UNIQUE INDEX IF NOT EXISTS "ProgramProfileRelation_programId_profileId_key" ON "ProgramProfileRelation"("programId", "profileId");
CREATE INDEX IF NOT EXISTS "ProgramEventRelation_programId_idx" ON "ProgramEventRelation"("programId");
CREATE INDEX IF NOT EXISTS "ProgramEventRelation_eventId_idx" ON "ProgramEventRelation"("eventId");
CREATE UNIQUE INDEX IF NOT EXISTS "ProgramEventRelation_programId_eventId_key" ON "ProgramEventRelation"("programId", "eventId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProgramProfileRelation_programId_fkey') THEN
    ALTER TABLE "ProgramProfileRelation" ADD CONSTRAINT "ProgramProfileRelation_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProgramProfileRelation_profileId_fkey') THEN
    ALTER TABLE "ProgramProfileRelation" ADD CONSTRAINT "ProgramProfileRelation_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProgramEventRelation_programId_fkey') THEN
    ALTER TABLE "ProgramEventRelation" ADD CONSTRAINT "ProgramEventRelation_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProgramEventRelation_eventId_fkey') THEN
    ALTER TABLE "ProgramEventRelation" ADD CONSTRAINT "ProgramEventRelation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 2. Copy event-profile links into programs (skipped if EventProfileRelation is already gone)
DO $$
BEGIN
  IF to_regclass('"EventProfileRelation"') IS NULL THEN
    RETURN;
  END IF;

  -- One program per linked event. Titles shared by several events, or already used by a program,
  -- get the event id appended to keep Program.name unique.
  INSERT INTO "Program" ("id", "name", "description", "updatedAt", "createdAt")
  SELECT
    'evtprog_' || e."id",
    CASE
      WHEN COUNT(*) OVER (PARTITION BY e."title") > 1
        OR EXISTS (SELECT 1 FROM "Program" p WHERE p."name" = e."title")
      THEN e."title" || ' (' || e."id" || ')'
      ELSE e."title"
    END,
    e."description",
    NOW(),
    NOW()
  FROM "events" e
  WHERE EXISTS (SELECT 1 FROM "EventProfileRelation" r WHERE r."eventId" = e."id")
  ON CONFLICT ("id") DO NOTHING;

  INSERT INTO "ProgramEventRelation" ("id", "programId", "eventId", "updatedAt", "createdAt")
  SELECT DISTINCT 'evtprogev_' || r."eventId", 'evtprog_' || r."eventId", r."eventId", NOW(), NOW()
  FROM "EventProfileRelation" r
  ON CONFLICT DO NOTHING;

  INSERT INTO "ProgramProfileRelation" ("id", "programId", "profileId", "progressToAdd", "updatedAt", "createdAt")
  SELECT 'evtprogpr_' || r."id", 'evtprog_' || r."eventId", r."profileId", r."progressToAdd", NOW(), r."createdAt"
  FROM "EventProfileRelation" r
  ON CONFLICT DO NOTHING;

  DROP TABLE "EventProfileRelation";
END $$;

COMMIT;
