CREATE TABLE "user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role" "user_role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_roles_user_id_role_unique" ON "user_roles" USING btree ("user_id","role");

-- Backfill existing single-role users into user_roles
INSERT INTO "public"."user_roles" ("user_id", "role")
SELECT "id", "role"
FROM "public"."users"
WHERE "role" IS NOT NULL
ON CONFLICT DO NOTHING;