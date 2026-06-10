// Le Congo D'Abord — TypeScript types

// Re-export Language from translations to avoid duplication
import type { Language } from './translations';
export type { Language };

export type Gender = 'M' | 'F' | 'Other';

export type ContributionStatus =
  | 'Active'
  | 'Grace Period'
  | 'Suspended'
  | 'Ineligible'
  | 'Exempted'
  | 'Under Review';

export type MemberRole =
  | 'Founder'
  | 'President'
  | 'National Coordinator'
  | 'Provincial Coordinator'
  | 'Local Cell Leader'
  | 'Youth Wing Leader'
  | 'Women Wing Leader'
  | 'Member'
  | 'Observer';

export type ElectionLevel =
  | 'Presidential'
  | 'National Deputy'
  | 'Provincial Deputy'
  | 'Mayor'
  | 'Commune Chief'
  | 'Sector Chief';

export interface AdminLocation {
  country: string;
  continent: string;
  province?: string;
  territory?: string;
  commune?: string;
  sector?: string;
  village?: string;
}

export interface EducationProfile {
  level: 'None' | 'Primary' | 'Secondary' | 'Vocational' | 'Bachelor' | 'Master' | 'PhD';
  field?: string;
  institution?: string;
  yearCompleted?: number;
  score: number; // 0-100
}

export interface WorkProfile {
  currentEmployer?: string;
  jobTitle?: string;
  sector?: string;
  yearsExperience: number;
  previousRoles?: string[];
  score: number; // 0-100
}

export interface PoliticalProfile {
  previousPartyMembership?: string;
  civicOrgs?: string[];
  localLeadershipRoles?: string[];
  languagesSpoken: Language[];
  hasIntegrityCase: boolean;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  nationality: string;
  phone: string;
  email: string;
  photoUrl?: string;
  location: AdminLocation;
  education: EducationProfile;
  work: WorkProfile;
  political: PoliticalProfile;
  role: MemberRole;
  contributionStatus: ContributionStatus;
  memberSince: string;
  trainingCompletion: number; // 0-100
  integrityScore: number; // 0-100
  localCredibilityScore: number; // 0-100
  leadershipScore: number; // 0-100
}

export interface CandidateScore {
  education: number;       // 0-100, weight 15%
  workExperience: number;  // 0-100, weight 20%
  localCredibility: number; // 0-100, weight 15%
  leadership: number;      // 0-100, weight 15%
  contributionStatus: number; // 0-100, weight 10%
  trainingCompletion: number; // 0-100, weight 10%
  integrityScore: number;  // 0-100, weight 10%
  languageAbility: number; // 0-100, weight 5%
  total: number;           // weighted total
}

export interface AIRecommendation {
  id: string;
  memberId: string;
  member: Member;
  targetRole: ElectionLevel;
  constituency: string;
  scores: CandidateScore;
  rank: number; // 1-3 top picks
  aiJustification: string;
  generatedAt: string;
}

export interface Contribution {
  id: string;
  memberId: string;
  amount: number;
  currency: string;
  date: string;
  method: 'Mobile Money' | 'Bank Transfer' | 'Cash' | 'Online';
  status: 'Confirmed' | 'Pending' | 'Failed';
  receiptNumber?: string;
}

export interface ContributionSummary {
  memberId: string;
  totalPaid: number;
  monthsActive: number;
  lastPaymentDate: string;
  status: ContributionStatus;
  nextDueDate: string;
}

export interface Province {
  id: string;
  name: string;
  capital: string;
  region: 'Kinshasa' | 'Kongo' | 'Kasai' | 'Bandundu' | 'Equateur' | 'Oriental' | 'Kivu' | 'Katanga' | 'Maniema';
  population: number;
  territories: Territory[];
  memberCount?: number;
  activeContributors?: number;
  leaderName?: string;
  electionReadiness?: number;
}

export interface Territory {
  id: string;
  name: string;
  provinceId: string;
  communes: string[];
  memberCount?: number;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  durationHours: number;
  category: 'Political' | 'Leadership' | 'Policy' | 'Communication' | 'Ethics' | 'Finance';
  level: 'Basic' | 'Intermediate' | 'Advanced';
  isRequired: boolean;
}

export interface TrainingRecord {
  memberId: string;
  moduleId: string;
  completedAt?: string;
  score?: number;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Failed';
}

export interface EthicsCase {
  id: string;
  memberId: string;
  type: 'Corruption' | 'Misconduct' | 'Fraud' | 'Violence' | 'Hate Speech' | 'Other';
  description: string;
  reportedAt: string;
  status: 'Open' | 'Under Investigation' | 'Resolved' | 'Dismissed';
  resolution?: string;
  impactOnScore: number;
}

export interface InfrastructureNeed {
  id: string;
  province: string;
  territory?: string;
  category: 'Water' | 'Electricity' | 'Roads' | 'Healthcare' | 'Education' | 'Internet' | 'Agriculture';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  estimatedCost?: number;
  populationAffected: number;
}

export interface PolicyProposal {
  id: string;
  title: string;
  category: string;
  description: string;
  targetBeneficiaries: string;
  estimatedImpact: string;
  aiSummary?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalMembers: number;
  membersByProvince: Record<string, number>;
  activeContributors: number;
  monthlyRevenue: number;
  electionReadinessIndex: number;
  topCandidates: AIRecommendation[];
  integrityAlerts: number;
  infrastructureNeeds: number;
  trainingCompletion: number;
}

export interface AIAgentRequest {
  agentType: string;
  payload: Record<string, unknown>;
  language?: Language;
}

export interface AIAgentResponse {
  agentType: string;
  result: Record<string, unknown>;
  confidence: number;
  generatedAt: string;
  tokensUsed?: number;
}

export interface PartyRole {
  id: string;
  title: string;
  level: 'National' | 'Provincial' | 'Local';
  description: string;
  requirements: string[];
  currentHolder?: string;
  isVacant: boolean;
}
