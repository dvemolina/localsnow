-- Fix BETA2025 expiry date to correct season (2025/2026 instead of 2024/2025)
UPDATE "launch_codes"
SET "valid_until" = '2026-03-31 23:59:59'
WHERE "code" = 'BETA2025';
