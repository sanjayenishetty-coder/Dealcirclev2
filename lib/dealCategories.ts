import { DealCategory } from "@/types";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "file";
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  suffix?: string;
  prefix?: string;
}

export interface CategoryConfig {
  key: DealCategory;
  label: string;
  description: string;
  badgeColor: string;
  badgeBg: string;
  icon: string;
  fields: FieldConfig[];
  cardMetrics: { key: string; label: string; format?: "currency" | "percent" | "text" }[];
}

export const categoryConfigs: Record<DealCategory, CategoryConfig> = {
  startup: {
    key: "startup",
    label: "Startup Funding",
    description: "Pre-Seed to Series B funding for high-growth startups",
    badgeColor: "#3B82F6",
    badgeBg: "rgba(59, 130, 246, 0.2)",
    icon: "Rocket",
    fields: [
      { name: "company_name", label: "Company Name", type: "text", required: true },
      { name: "sector", label: "Sector", type: "text", required: true, placeholder: "e.g. SaaS, Fintech, HealthTech" },
      {
        name: "stage", label: "Stage", type: "select", required: true,
        options: [
          { label: "Pre-Seed", value: "Pre-Seed" },
          { label: "Seed", value: "Seed" },
          { label: "Series A", value: "Series A" },
          { label: "Series B", value: "Series B" },
        ],
      },
      { name: "ask_amount", label: "Ask Amount", type: "number", required: true, prefix: "₹" },
      { name: "valuation_cap", label: "Valuation Cap", type: "number", required: true, prefix: "₹" },
      { name: "use_of_funds", label: "Use of Funds", type: "textarea", required: true },
      { name: "team_overview", label: "Team Overview", type: "textarea", required: true },
      { name: "mrr_arr", label: "MRR / ARR", type: "number", required: true, prefix: "₹" },
      { name: "website_url", label: "Website URL", type: "text", placeholder: "https://" },
    ],
    cardMetrics: [
      { key: "stage", label: "Stage" },
      { key: "ask_amount", label: "Ask", format: "currency" },
      { key: "valuation_cap", label: "Valuation Cap", format: "currency" },
      { key: "mrr_arr", label: "MRR", format: "currency" },
    ],
  },
  sme: {
    key: "sme",
    label: "SME Investment",
    description: "Equity and preference share investments in established SMEs",
    badgeColor: "#6366F1",
    badgeBg: "rgba(99, 102, 241, 0.2)",
    icon: "Building2",
    fields: [
      { name: "company_name", label: "Company Name", type: "text", required: true },
      { name: "industry", label: "Industry", type: "text", required: true },
      { name: "years_in_operation", label: "Years in Operation", type: "number", required: true },
      {
        name: "revenue_band", label: "Revenue Band", type: "select", required: true,
        options: [
          { label: "<₹1Cr", value: "<₹1Cr" },
          { label: "₹1-5Cr", value: "₹1-5Cr" },
          { label: "₹5-25Cr", value: "₹5-25Cr" },
          { label: "₹25-100Cr", value: "₹25-100Cr" },
        ],
      },
      { name: "ebitda_margin", label: "EBITDA Margin", type: "number", required: true, suffix: "%" },
      { name: "ask_amount", label: "Ask Amount", type: "number", required: true, prefix: "₹" },
      {
        name: "instrument", label: "Instrument", type: "select", required: true,
        options: [
          { label: "Equity", value: "Equity" },
          { label: "Preference Shares", value: "Preference Shares" },
        ],
      },
      { name: "promoter_background", label: "Promoter Background", type: "textarea", required: true },
      { name: "city", label: "City", type: "text", required: true },
    ],
    cardMetrics: [
      { key: "revenue_band", label: "Revenue" },
      { key: "instrument", label: "Instrument" },
      { key: "ask_amount", label: "Ask", format: "currency" },
      { key: "ebitda_margin", label: "EBITDA", format: "percent" },
    ],
  },
  debt: {
    key: "debt",
    label: "Debt Opportunity",
    description: "NCDs, term loans, invoice discounting and structured debt",
    badgeColor: "#F59E0B",
    badgeBg: "rgba(245, 158, 11, 0.2)",
    icon: "Landmark",
    fields: [
      { name: "borrower_name", label: "Borrower Name", type: "text", required: true },
      {
        name: "debt_type", label: "Debt Type", type: "select", required: true,
        options: [
          { label: "Term Loan", value: "Term Loan" },
          { label: "NCD", value: "NCD" },
          { label: "Invoice Discounting", value: "Invoice Discounting" },
          { label: "Structured Debt", value: "Structured Debt" },
          { label: "Other", value: "Other" },
        ],
      },
      { name: "loan_amount", label: "Loan Amount", type: "number", required: true, prefix: "₹" },
      { name: "tenure_months", label: "Tenure (months)", type: "number", required: true },
      { name: "indicative_yield", label: "Indicative Yield", type: "number", required: true, suffix: "%" },
      { name: "security_collateral", label: "Security / Collateral", type: "textarea", required: true },
      { name: "credit_rating", label: "Credit Rating", type: "text" },
      { name: "repayment_structure", label: "Repayment Structure", type: "textarea", required: true },
      { name: "city", label: "City", type: "text", required: true },
    ],
    cardMetrics: [
      { key: "debt_type", label: "Type" },
      { key: "indicative_yield", label: "Yield", format: "percent" },
      { key: "tenure_months", label: "Tenure", format: "text" },
      { key: "loan_amount", label: "Amount", format: "currency" },
    ],
  },
};

export function formatIndianCurrency(amount: number): string {
  if (amount >= 10000000) {
    const crores = amount / 10000000;
    return `₹${crores % 1 === 0 ? crores : crores.toFixed(1)} Crore`;
  }
  if (amount >= 100000) {
    const lakhs = amount / 100000;
    return `₹${lakhs % 1 === 0 ? lakhs : lakhs.toFixed(1)} Lakh`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function getCategoryConfig(category: DealCategory): CategoryConfig {
  return categoryConfigs[category];
}
