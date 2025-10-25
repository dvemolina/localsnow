-- Migration: Simplified Pricing System for MVP

-- Drop old tables if they exist
DROP TABLE IF EXISTS conditional_pricing CASCADE;
DROP TABLE IF EXISTS promotional_pricing CASCADE;

-- Group Pricing Tiers
-- For offering discounts based on number of students
CREATE TABLE IF NOT EXISTS group_pricing_tiers (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    min_students INTEGER NOT NULL CHECK (min_students > 0),
    max_students INTEGER NOT NULL CHECK (max_students >= min_students),
    price_per_hour INTEGER NOT NULL CHECK (price_per_hour >= 0),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,
    UNIQUE(lesson_id, min_students, max_students)
);

-- Duration Packages
-- For half-day, full-day, or multi-hour packages
CREATE TABLE IF NOT EXISTS duration_packages (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., "Half Day", "Full Day"
    hours NUMERIC(4,1) NOT NULL CHECK (hours > 0), -- e.g., 4.0, 8.0
    price INTEGER NOT NULL CHECK (price >= 0),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Promo Codes (Simplified)
-- For special discount codes
CREATE TABLE IF NOT EXISTS promo_codes (
    id SERIAL PRIMARY KEY,
    instructor_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- NULL = applies to all instructor's lessons
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE, -- NULL = applies to all lessons
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    valid_until TIMESTAMP,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_group_pricing_lesson ON group_pricing_tiers(lesson_id);
CREATE INDEX IF NOT EXISTS idx_duration_packages_lesson ON duration_packages(lesson_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_instructor ON promo_codes(instructor_id);

-- Add helpful comment
COMMENT ON TABLE group_pricing_tiers IS 'Pricing tiers based on group size (e.g., 1-2 students: 65€/hr, 3-4 students: 60€/hr)';
COMMENT ON TABLE duration_packages IS 'Fixed-price packages for half-day, full-day lessons';
COMMENT ON TABLE promo_codes IS 'Discount codes for special offers';