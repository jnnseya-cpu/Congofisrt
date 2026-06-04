-- ============================================================
-- CDP-AI OS — PostgreSQL Database Schema
-- Congo D'Abord AI Party Operating System
-- Founder & President: Mr Justin Nseya
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ADMINISTRATIVE UNITS
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_units (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    unit_type VARCHAR(50) NOT NULL CHECK (unit_type IN ('province', 'territory', 'city', 'commune', 'sector', 'chiefdom', 'groupement', 'village')),
    parent_id VARCHAR(100) REFERENCES admin_units(id),
    province_id VARCHAR(50),
    level INTEGER DEFAULT 0,
    language_names JSONB DEFAULT '{}',
    official_code VARCHAR(50),
    population INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_units_type ON admin_units(unit_type);
CREATE INDEX IF NOT EXISTS idx_admin_units_parent ON admin_units(parent_id);
CREATE INDEX IF NOT EXISTS idx_admin_units_province ON admin_units(province_id);

-- ============================================================
-- MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth VARCHAR(20),
    gender VARCHAR(10) CHECK (gender IN ('M', 'F', 'Other')),
    nationality VARCHAR(100) DEFAULT 'Congolais(e)',
    phone VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    photo_url VARCHAR(500),
    language_preference VARCHAR(5) DEFAULT 'fr' CHECK (language_preference IN ('fr', 'ln', 'kg', 'ts', 'sw')),
    
    -- Location
    country VARCHAR(100) NOT NULL DEFAULT 'RD Congo',
    continent VARCHAR(50) DEFAULT 'Afrique',
    province_id VARCHAR(100) REFERENCES admin_units(id),
    province_name VARCHAR(100),
    territory_id VARCHAR(100) REFERENCES admin_units(id),
    commune_id VARCHAR(100) REFERENCES admin_units(id),
    village_id VARCHAR(100) REFERENCES admin_units(id),
    
    -- ID Documents
    id_type VARCHAR(50),
    id_number VARCHAR(100),
    voter_card VARCHAR(100),
    membership_number VARCHAR(50) UNIQUE,
    
    -- Party Status
    member_role VARCHAR(50) DEFAULT 'Member',
    contribution_status VARCHAR(30) DEFAULT 'Ineligible' 
        CHECK (contribution_status IN ('Active', 'Grace Period', 'Suspended', 'Ineligible', 'Exempted', 'Under Review')),
    is_active BOOLEAN DEFAULT TRUE,
    is_diaspora BOOLEAN DEFAULT FALSE,
    
    -- AI Scores (computed)
    training_completion FLOAT DEFAULT 0 CHECK (training_completion BETWEEN 0 AND 100),
    integrity_score FLOAT DEFAULT 100 CHECK (integrity_score BETWEEN 0 AND 100),
    local_credibility_score FLOAT DEFAULT 50 CHECK (local_credibility_score BETWEEN 0 AND 100),
    leadership_score FLOAT DEFAULT 50 CHECK (leadership_score BETWEEN 0 AND 100),
    
    -- Timestamps
    member_since DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_members_province ON members(province_name);
CREATE INDEX IF NOT EXISTS idx_members_contribution ON members(contribution_status);
CREATE INDEX IF NOT EXISTS idx_members_role ON members(member_role);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_name ON members USING gin(to_tsvector('french', first_name || ' ' || last_name));

-- ============================================================
-- MEMBER CV / DETAILED PROFILE
-- ============================================================
CREATE TABLE IF NOT EXISTS member_cv (
    id SERIAL PRIMARY KEY,
    member_id VARCHAR(50) UNIQUE REFERENCES members(id) ON DELETE CASCADE,
    
    -- Education
    education_level VARCHAR(50) CHECK (education_level IN ('None', 'Primary', 'Secondary', 'Vocational', 'Bachelor', 'Master', 'PhD')),
    education_field VARCHAR(200),
    institution VARCHAR(200),
    year_completed INTEGER,
    education_score FLOAT DEFAULT 50,
    
    -- Work Experience
    current_employer VARCHAR(200),
    job_title VARCHAR(200),
    sector VARCHAR(100),
    years_experience INTEGER DEFAULT 0,
    previous_roles TEXT,
    public_service_exp VARCHAR(100),
    business_ownership VARCHAR(50),
    ngo_work TEXT,
    work_score FLOAT DEFAULT 50,
    
    -- Civic & Political
    community_work TEXT,
    previous_political VARCHAR(200),
    leadership_roles TEXT,
    languages_spoken JSONB DEFAULT '[]',
    public_speaking VARCHAR(50),
    
    -- Declarations
    integrity_declaration BOOLEAN DEFAULT FALSE,
    criminal_declaration BOOLEAN DEFAULT FALSE,
    criminal_details TEXT,
    
    -- Social (optional)
    public_profiles JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- ============================================================
-- CONTRIBUTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS contributions (
    id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    member_id VARCHAR(50) NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    amount FLOAT DEFAULT 5.0 CHECK (amount > 0),
    currency VARCHAR(10) DEFAULT 'USD',
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL CHECK (year >= 2023),
    payment_method VARCHAR(100),
    payment_status VARCHAR(30) DEFAULT 'Pending' CHECK (payment_status IN ('Confirmed', 'Pending', 'Failed', 'Refunded')),
    receipt_number VARCHAR(100) UNIQUE,
    transaction_ref VARCHAR(200),
    notes TEXT,
    verified_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contributions_member ON contributions(member_id);
CREATE INDEX IF NOT EXISTS idx_contributions_period ON contributions(year, month);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON contributions(payment_status);

-- ============================================================
-- ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    level VARCHAR(50) NOT NULL CHECK (level IN ('National', 'Provincial', 'Territory', 'City', 'Commune', 'Local')),
    description TEXT,
    required_skills JSONB DEFAULT '[]',
    min_contribution_status VARCHAR(30) DEFAULT 'Active',
    min_training_score FLOAT DEFAULT 0,
    min_integrity_score FLOAT DEFAULT 70,
    is_electoral BOOLEAN DEFAULT FALSE,
    admin_unit_id VARCHAR(100) REFERENCES admin_units(id),
    current_holder VARCHAR(50) REFERENCES members(id),
    is_vacant BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- AI RECOMMENDATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    role_id VARCHAR(100) REFERENCES roles(id),
    admin_unit_id VARCHAR(100),
    candidate_1_id VARCHAR(50) REFERENCES members(id),
    candidate_1_score FLOAT,
    candidate_2_id VARCHAR(50) REFERENCES members(id),
    candidate_2_score FLOAT,
    candidate_3_id VARCHAR(50) REFERENCES members(id),
    candidate_3_score FLOAT,
    scoring_explanation JSONB DEFAULT '{}',
    risk_flags JSONB DEFAULT '[]',
    ai_justification TEXT,
    human_decision VARCHAR(50) DEFAULT 'Pending' CHECK (human_decision IN ('Pending', 'Approved', 'Rejected', 'Modified')),
    human_decision_by VARCHAR(50) REFERENCES members(id),
    human_decision_at TIMESTAMP,
    human_decision_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_rec_role ON ai_recommendations(role_id);
CREATE INDEX IF NOT EXISTS idx_ai_rec_decision ON ai_recommendations(human_decision);

-- ============================================================
-- TRAINING RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS training_records (
    id SERIAL PRIMARY KEY,
    member_id VARCHAR(50) NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    course_id VARCHAR(50) NOT NULL,
    course_title VARCHAR(200),
    category VARCHAR(50) CHECK (category IN ('Political', 'Leadership', 'Policy', 'Communication', 'Ethics', 'Finance')),
    score FLOAT CHECK (score BETWEEN 0 AND 100),
    completion_status VARCHAR(30) DEFAULT 'Not Started' 
        CHECK (completion_status IN ('Not Started', 'In Progress', 'Completed', 'Failed')),
    certificate_url VARCHAR(500),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_training_member ON training_records(member_id);
CREATE INDEX IF NOT EXISTS idx_training_status ON training_records(completion_status);

-- ============================================================
-- ETHICS CASES
-- ============================================================
CREATE TABLE IF NOT EXISTS ethics_cases (
    id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    member_id VARCHAR(50) NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    allegation_type VARCHAR(50) CHECK (allegation_type IN ('Corruption', 'Misconduct', 'Fraud', 'Violence', 'Hate Speech', 'Other')),
    description TEXT NOT NULL,
    reported_by VARCHAR(50) REFERENCES members(id),
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) DEFAULT 'Open' CHECK (status IN ('Open', 'Under Investigation', 'Resolved', 'Dismissed')),
    severity VARCHAR(20) DEFAULT 'Medium' CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
    evidence JSONB DEFAULT '[]',
    committee_decision TEXT,
    resolution TEXT,
    resolved_by VARCHAR(50) REFERENCES members(id),
    resolved_at TIMESTAMP,
    impact_on_score FLOAT DEFAULT 0,
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ethics_member ON ethics_cases(member_id);
CREATE INDEX IF NOT EXISTS idx_ethics_status ON ethics_cases(status);

-- ============================================================
-- PARTY ROLES (Leadership Structure)
-- ============================================================
CREATE TABLE IF NOT EXISTS party_roles (
    id VARCHAR(100) PRIMARY KEY,
    member_id VARCHAR(50) REFERENCES members(id),
    role_title VARCHAR(200) NOT NULL,
    role_level VARCHAR(50),
    province_id VARCHAR(100),
    territory_id VARCHAR(100),
    appointed_by VARCHAR(50) REFERENCES members(id),
    appointed_at TIMESTAMP,
    end_date TIMESTAMP,
    is_current BOOLEAN DEFAULT TRUE,
    notes TEXT
);

-- ============================================================
-- DIASPORA MEMBERS (Extended)
-- ============================================================
CREATE TABLE IF NOT EXISTS diaspora_members (
    id SERIAL PRIMARY KEY,
    member_id VARCHAR(50) UNIQUE REFERENCES members(id) ON DELETE CASCADE,
    host_country VARCHAR(100) NOT NULL,
    host_city VARCHAR(100),
    diaspora_chapter VARCHAR(200),
    province_of_origin VARCHAR(100),
    years_abroad INTEGER,
    has_dual_nationality BOOLEAN DEFAULT FALSE,
    can_vote_in_drc BOOLEAN DEFAULT FALSE,
    is_chapter_leader BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INFRASTRUCTURE NEEDS
-- ============================================================
CREATE TABLE IF NOT EXISTS infrastructure_needs (
    id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    province VARCHAR(100) NOT NULL,
    territory VARCHAR(100),
    commune VARCHAR(100),
    category VARCHAR(50) CHECK (category IN ('Water', 'Electricity', 'Roads', 'Healthcare', 'Education', 'Internet', 'Agriculture', 'Other')),
    severity VARCHAR(20) DEFAULT 'Medium' CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
    description TEXT NOT NULL,
    estimated_cost FLOAT,
    population_affected INTEGER DEFAULT 0,
    reported_by VARCHAR(50) REFERENCES members(id),
    status VARCHAR(30) DEFAULT 'Reported' CHECK (status IN ('Reported', 'Validated', 'In Progress', 'Resolved')),
    ai_priority_score FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TRIGGER: Update member status on contribution
-- ============================================================
CREATE OR REPLACE FUNCTION update_member_contribution_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_status = 'Confirmed' THEN
        UPDATE members SET contribution_status = 'Active', updated_at = NOW()
        WHERE id = NEW.member_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_contribution_status ON contributions;
CREATE TRIGGER trg_update_contribution_status
    AFTER INSERT OR UPDATE ON contributions
    FOR EACH ROW EXECUTE FUNCTION update_member_contribution_status();

-- ============================================================
-- SEED DATA: Justin Nseya as Founder
-- ============================================================
INSERT INTO members (
    id, first_name, last_name, email, phone, nationality,
    member_role, contribution_status, country, continent,
    province_name, membership_number, integrity_score,
    local_credibility_score, leadership_score, training_completion
) VALUES (
    'founder-001',
    'Justin',
    'Nseya',
    'justin.nseya@congodabord.cd',
    '+243000000001',
    'Congolais',
    'Founder',
    'Active',
    'RD Congo',
    'Afrique',
    'Kinshasa',
    'CDP-FOUNDER-001',
    100,
    100,
    100,
    100
) ON CONFLICT (id) DO NOTHING;

-- Confirmation
SELECT 'CDP-AI OS Schema initialized successfully.' AS status;
