ALTER TABLE education_programs
    ADD COLUMN kind VARCHAR(32) NOT NULL DEFAULT 'program',
    ADD COLUMN annual_budget DOUBLE PRECISION NOT NULL DEFAULT 0,
    ADD COLUMN expected_starting_salary DOUBLE PRECISION NOT NULL DEFAULT 0,
    ADD COLUMN forgone_annual_income DOUBLE PRECISION NOT NULL DEFAULT 0,
    ADD COLUMN scholarship_amount_per_year DOUBLE PRECISION NOT NULL DEFAULT 0,
    ADD COLUMN scholarship_covers VARCHAR(16) NOT NULL DEFAULT 'both',
    ADD COLUMN sponsor VARCHAR(255) NOT NULL DEFAULT '';

ALTER TABLE education_programs
    ADD CONSTRAINT education_programs_kind_check
    CHECK (kind IN ('school', 'program', 'scholarship'));

ALTER TABLE education_programs
    ADD CONSTRAINT education_programs_covers_check
    CHECK (scholarship_covers IN ('tuition', 'living', 'both'));

ALTER TABLE education_programs
    ALTER COLUMN opportunity_cost_per_year SET DEFAULT 0,
    ALTER COLUMN expected_annual_premium SET DEFAULT 0;

ALTER TABLE score_snapshots
    ADD COLUMN fully_covered BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN over_budget BOOLEAN NOT NULL DEFAULT FALSE;
