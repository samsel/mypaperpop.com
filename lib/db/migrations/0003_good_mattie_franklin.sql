CREATE TABLE "colored_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"photo_path" text NOT NULL,
	"composite_path" text,
	"share_token" varchar(32),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "colored_photos_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
ALTER TABLE "colored_photos" ADD CONSTRAINT "colored_photos_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "colored_photos" ADD CONSTRAINT "colored_photos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "colored_photos_message_id_idx" ON "colored_photos" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "colored_photos_user_id_idx" ON "colored_photos" USING btree ("user_id");