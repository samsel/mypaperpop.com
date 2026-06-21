CREATE INDEX IF NOT EXISTS "credit_purchases_user_id_created_at_idx" ON "credit_purchases" USING btree ("user_id","created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "colored_photos_user_id_created_at_idx" ON "colored_photos" USING btree ("user_id","created_at");
