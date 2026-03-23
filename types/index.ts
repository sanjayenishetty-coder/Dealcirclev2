export type UserRole = "seeker" | "investor" | "admin";
export type UserStatus = "pending" | "approved" | "rejected";
export type DealCategory = "startup" | "sme" | "debt";
export type DealStatus = "draft" | "published" | "paused" | "closed";
export type InterestStatus = "new" | "contacted" | "in_discussion" | "converted" | "dropped";
export type InvestorType = "HNI Individual" | "Family Office" | "Corporate" | "VC-Angel" | "Other";
export type CorpusBand = "<₹25L" | "₹25L-1Cr" | "₹1-5Cr" | "₹5Cr+";
export type RevenueBand = "<₹1Cr" | "₹1-5Cr" | "₹5-25Cr" | "₹25-100Cr";
export type StartupStage = "Pre-Seed" | "Seed" | "Series A" | "Series B";
export type DebtType = "Term Loan" | "NCD" | "Invoice Discounting" | "Structured Debt" | "Other";
export type InstrumentType = "Equity" | "Preference Shares";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  mobile: string;
  city: string;
  status: UserStatus;
  rejection_note: string | null;
  created_at: string;
}

export interface InvestorProfile {
  id: string;
  investor_type: InvestorType;
  corpus_band: CorpusBand;
  investment_interests: DealCategory[];
  linkedin_url: string | null;
}

export interface SeekerProfile {
  id: string;
  company_name: string;
  designation: string;
}

export interface Deal {
  id: string;
  created_by: string | null;
  category: DealCategory;
  title: string;
  show_company_name: boolean;
  status: DealStatus;
  admin_narrative: string | null;
  fields: Record<string, unknown>;
  ticket_min: number | null;
  ticket_max: number | null;
  city: string | null;
  sector: string | null;
  nda_required: boolean;
  published_at: string | null;
  created_at: string;
}

export interface InvestorInterest {
  id: string;
  investor_id: string;
  deal_id: string;
  status: InterestStatus;
  admin_notes: string | null;
  created_at: string;
}

export interface Watchlist {
  investor_id: string;
  deal_id: string;
  added_at: string;
}

// Extended types for joins
export interface DealWithInterests extends Deal {
  investor_interests?: InvestorInterest[];
}

export interface InterestWithInvestor extends InvestorInterest {
  profiles?: Profile;
  investor_profiles?: InvestorProfile;
}

export interface ProfileWithDetails extends Profile {
  investor_profiles?: InvestorProfile;
  seeker_profiles?: SeekerProfile;
}

// Startup fields
export interface StartupFields {
  company_name: string;
  sector: string;
  stage: StartupStage;
  ask_amount: number;
  valuation_cap: number;
  use_of_funds: string;
  team_overview: string;
  mrr_arr: number;
  website_url: string;
  pitch_deck_url?: string;
}

// SME fields
export interface SMEFields {
  company_name: string;
  industry: string;
  years_in_operation: number;
  revenue_band: RevenueBand;
  ebitda_margin: number;
  ask_amount: number;
  instrument: InstrumentType;
  promoter_background: string;
  city: string;
  financials_url?: string;
}

// Debt fields
export interface DebtFields {
  borrower_name: string;
  debt_type: DebtType;
  loan_amount: number;
  tenure_months: number;
  indicative_yield: number;
  security_collateral: string;
  credit_rating?: string;
  repayment_structure: string;
  city: string;
}
