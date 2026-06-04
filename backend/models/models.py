from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class ContributionStatusEnum(str, enum.Enum):
    ACTIVE = "Active"
    GRACE_PERIOD = "Grace Period"
    SUSPENDED = "Suspended"
    INELIGIBLE = "Ineligible"
    EXEMPTED = "Exempted"
    UNDER_REVIEW = "Under Review"

class MemberRoleEnum(str, enum.Enum):
    FOUNDER = "Founder"
    PRESIDENT = "President"
    NATIONAL = "National Coordinator"
    PROVINCIAL = "Provincial Coordinator"
    LOCAL = "Local Cell Leader"
    YOUTH = "Youth Wing Leader"
    WOMEN = "Women Wing Leader"
    MEMBER = "Member"
    OBSERVER = "Observer"

class Member(Base):
    __tablename__ = "members"

    id = Column(String, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(String(20))
    gender = Column(String(10))
    nationality = Column(String(100))
    phone = Column(String(30), unique=True, index=True)
    email = Column(String(200), unique=True, index=True)
    photo_url = Column(String(500))
    language_preference = Column(String(5), default='fr')

    # Location
    country = Column(String(100))
    continent = Column(String(50))
    province_id = Column(String(50))
    province_name = Column(String(100))
    territory_id = Column(String(50))
    commune_id = Column(String(50))
    village_id = Column(String(50))

    # Documents
    id_type = Column(String(50))
    id_number = Column(String(100))
    voter_card = Column(String(100))
    membership_number = Column(String(50), unique=True)

    # Status
    member_role = Column(String(50), default=MemberRoleEnum.MEMBER)
    contribution_status = Column(String(30), default=ContributionStatusEnum.INELIGIBLE)
    is_active = Column(Boolean, default=True)

    # Scores (computed)
    training_completion = Column(Float, default=0)
    integrity_score = Column(Float, default=100)
    local_credibility_score = Column(Float, default=50)
    leadership_score = Column(Float, default=50)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships
    cv = relationship("MemberCV", back_populates="member", uselist=False, cascade="all, delete-orphan")
    contributions = relationship("Contribution", back_populates="member", cascade="all, delete-orphan")
    training_records = relationship("TrainingRecord", back_populates="member", cascade="all, delete-orphan")
    ethics_cases = relationship("EthicsCase", back_populates="member", cascade="all, delete-orphan")

class MemberCV(Base):
    __tablename__ = "member_cv"

    id = Column(Integer, primary_key=True, autoincrement=True)
    member_id = Column(String, ForeignKey("members.id"), unique=True, nullable=False)

    # Education
    education_level = Column(String(50))
    education_field = Column(String(200))
    institution = Column(String(200))
    year_completed = Column(Integer)
    education_score = Column(Float, default=50)

    # Work
    current_employer = Column(String(200))
    job_title = Column(String(200))
    sector = Column(String(100))
    years_experience = Column(Integer, default=0)
    previous_roles = Column(Text)
    public_service_exp = Column(String(100))
    business_ownership = Column(String(50))
    ngo_work = Column(Text)
    work_score = Column(Float, default=50)

    # Civic
    community_work = Column(Text)
    previous_political = Column(String(200))
    leadership_roles = Column(Text)
    languages_spoken = Column(JSON, default=list)
    public_speaking = Column(String(50))

    # Declarations
    integrity_declaration = Column(Boolean, default=False)
    criminal_declaration = Column(Boolean, default=False)

    # Social (voluntary only)
    public_profiles = Column(JSON, default=dict)

    created_at = Column(DateTime, server_default=func.now())
    member = relationship("Member", back_populates="cv")

class Contribution(Base):
    __tablename__ = "contributions"

    id = Column(String, primary_key=True, index=True)
    member_id = Column(String, ForeignKey("members.id"), nullable=False, index=True)
    amount = Column(Float, default=5.0)
    currency = Column(String(10), default="USD")
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    payment_method = Column(String(100))
    payment_status = Column(String(30), default="Pending")
    receipt_number = Column(String(100))
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    member = relationship("Member", back_populates="contributions")

class AdminUnit(Base):
    __tablename__ = "admin_units"

    id = Column(String, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    unit_type = Column(String(50), nullable=False)  # province, territory, commune, sector, chiefdom, village
    parent_id = Column(String, ForeignKey("admin_units.id"))
    province_id = Column(String(50))
    level = Column(Integer, default=0)
    language_names = Column(JSON, default=dict)
    official_code = Column(String(50))
    population = Column(Integer)

class Role(Base):
    __tablename__ = "roles"

    id = Column(String, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    level = Column(String(50))  # National, Provincial, Territory, Local
    description = Column(Text)
    required_skills = Column(JSON, default=list)
    min_contribution_status = Column(String(30), default="Active")
    min_training_score = Column(Float, default=0)
    min_integrity_score = Column(Float, default=70)
    is_electoral = Column(Boolean, default=False)
    admin_unit_id = Column(String, ForeignKey("admin_units.id"))

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(String, primary_key=True, index=True)
    role_id = Column(String, ForeignKey("roles.id"), nullable=False)
    admin_unit_id = Column(String)
    candidate_1_id = Column(String, ForeignKey("members.id"))
    candidate_2_id = Column(String, ForeignKey("members.id"))
    candidate_3_id = Column(String, ForeignKey("members.id"))
    scoring_explanation = Column(JSON, default=dict)
    risk_flags = Column(JSON, default=list)
    human_decision = Column(String(50))  # Pending, Approved, Rejected
    human_decision_by = Column(String)
    human_decision_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())

class TrainingRecord(Base):
    __tablename__ = "training_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    member_id = Column(String, ForeignKey("members.id"), nullable=False, index=True)
    course_id = Column(String(50), nullable=False)
    course_title = Column(String(200))
    score = Column(Float)
    completion_status = Column(String(30), default="Not Started")
    certificate_url = Column(String(500))
    completed_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())

    member = relationship("Member", back_populates="training_records")

class EthicsCase(Base):
    __tablename__ = "ethics_cases"

    id = Column(String, primary_key=True, index=True)
    member_id = Column(String, ForeignKey("members.id"), nullable=False, index=True)
    allegation_type = Column(String(50))
    description = Column(Text, nullable=False)
    reported_at = Column(DateTime, server_default=func.now())
    status = Column(String(30), default="Open")
    severity = Column(String(20), default="Medium")
    evidence = Column(JSON, default=list)
    committee_decision = Column(Text)
    resolution = Column(Text)
    impact_on_score = Column(Float, default=0)
    updated_at = Column(DateTime, onupdate=func.now())

    member = relationship("Member", back_populates="ethics_cases")
