-- Custom SQL migration file, put your code below! --
-- Admin Audit Log table
CREATE TABLE IF NOT EXISTS "admin_audit_log" (
    "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "uuid" uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    "admin_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "action" varchar(100) NOT NULL,
    "target_type" varchar(50),
    "target_id" integer,
    "details" text,
    "ip_address" varchar(45),
    "user_agent" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Role Transition Archive table
CREATE TABLE IF NOT EXISTS "role_transition_archive" (
    "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "admin_id" integer REFERENCES "users"("id"),
    "from_role" "user_role",
    "to_role" "user_role" NOT NULL,
    "archived_user_data" text NOT NULL,
    "archived_sports" integer[],
    "archived_resorts" integer[],
    "archived_school_id" integer,
    "transition_reason" text,
    "can_restore" boolean DEFAULT true,
    "restored_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "expires_at" timestamp
);
