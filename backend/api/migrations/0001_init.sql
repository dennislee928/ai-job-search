CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL DEFAULT '',
    last_name VARCHAR(255) NOT NULL DEFAULT '',
    role VARCHAR(50) NOT NULL DEFAULT 'candidate',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE education_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    level VARCHAR(32) NOT NULL CHECK (level IN ('high_school', 'bachelor', 'master', 'phd', 'other')),
    field VARCHAR(255) NOT NULL DEFAULT '',
    country VARCHAR(128) NOT NULL DEFAULT '',
    duration_years DOUBLE PRECISION NOT NULL CHECK (duration_years > 0),
    tuition DOUBLE PRECISION NOT NULL CHECK (tuition >= 0),
    living_cost_per_year DOUBLE PRECISION NOT NULL CHECK (living_cost_per_year >= 0),
    opportunity_cost_per_year DOUBLE PRECISION NOT NULL CHECK (opportunity_cost_per_year >= 0),
    expected_annual_premium DOUBLE PRECISION NOT NULL,
    url TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX education_programs_user_id_idx ON education_programs (user_id);

CREATE TABLE score_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES education_programs(id) ON DELETE CASCADE,
    inputs JSONB NOT NULL,
    cp_ratio DOUBLE PRECISION,
    payback_years DOUBLE PRECISION,
    ai_replacement_10 DOUBLE PRECISION NOT NULL,
    ai_replacement_20 DOUBLE PRECISION NOT NULL,
    ai_replacement_30 DOUBLE PRECISION NOT NULL,
    career_outlook_10 DOUBLE PRECISION NOT NULL,
    career_outlook_20 DOUBLE PRECISION NOT NULL,
    career_outlook_30 DOUBLE PRECISION NOT NULL,
    model_note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX score_snapshots_program_id_idx ON score_snapshots (program_id);
