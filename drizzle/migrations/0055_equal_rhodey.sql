-- Custom SQL migration file, put your code below! --
-- Add missing deleted_at column to admin_audit_log table
ALTER TABLE "admin_audit_log" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;