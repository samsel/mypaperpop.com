ALTER TABLE "referrals" ADD COLUMN "seen_at" timestamp;--> statement-breakpoint
UPDATE "referrals" SET "seen_at" = "created_at" WHERE "seen_at" IS NULL;