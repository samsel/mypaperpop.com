ALTER TABLE "colored_photos" DROP CONSTRAINT "colored_photos_message_id_messages_id_fk";
--> statement-breakpoint
ALTER TABLE "colored_photos" ADD COLUMN "original_sketch_path" text;--> statement-breakpoint
UPDATE "colored_photos" SET "original_sketch_path" = m."image_path" FROM "messages" m WHERE m."id" = "colored_photos"."message_id";--> statement-breakpoint
ALTER TABLE "colored_photos" ALTER COLUMN "original_sketch_path" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "colored_photos" ALTER COLUMN "message_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "colored_photos" ADD CONSTRAINT "colored_photos_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE set null ON UPDATE no action;
