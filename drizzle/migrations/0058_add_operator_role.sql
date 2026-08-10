-- Add the operator role for founder/operator internal management access.
ALTER TYPE "user_role" ADD VALUE IF NOT EXISTS 'operator';
