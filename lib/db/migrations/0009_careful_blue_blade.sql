ALTER TABLE "colored_photos" DROP CONSTRAINT "colored_photos_share_token_unique";--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_share_token_unique";--> statement-breakpoint
ALTER TABLE "colored_photos" DROP COLUMN "share_token";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "share_token";