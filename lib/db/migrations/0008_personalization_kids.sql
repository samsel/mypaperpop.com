CREATE TABLE "kids" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(80) NOT NULL,
	"age_group" varchar(30),
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "kids" ADD CONSTRAINT "kids_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "personalized_for_kid_id" integer;
--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "name_used" varchar(80);
--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "name_placement" varchar(120);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_personalized_for_kid_id_kids_id_fk" FOREIGN KEY ("personalized_for_kid_id") REFERENCES "public"."kids"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "kids_user_id_idx" ON "kids" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "messages_personalized_for_kid_id_idx" ON "messages" USING btree ("personalized_for_kid_id");
