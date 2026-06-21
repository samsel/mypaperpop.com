DROP INDEX "colored_photos_message_id_idx";--> statement-breakpoint
ALTER TABLE "colored_photos" ADD CONSTRAINT "colored_photos_message_id_unique" UNIQUE("message_id");