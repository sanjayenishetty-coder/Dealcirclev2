-- DealCircle V2 — Seed Data
-- Run AFTER migration.sql
-- NOTE: You must first create these users in Supabase Auth (Dashboard > Authentication > Users)
-- Then replace the UUIDs below with the actual auth.users UUIDs.

-- ============================================
-- INSTRUCTIONS:
-- 1. Create users in Supabase Auth Dashboard:
--    - admin@dealcircle.in (password: DealCircle@2025)
--    - priya@example.com (password: Test@1234)
--    - rajiv@example.com (password: Test@1234)
--    - ananya@example.com (password: Test@1234)
--    - nitin@example.com (password: Test@1234)
--    - deepa@example.com (password: Test@1234)
-- 2. Copy each user's UUID from the Auth dashboard
-- 3. Replace the placeholder UUIDs below
-- ============================================

-- Placeholder UUIDs — REPLACE with real UUIDs from your Supabase Auth
-- Admin
-- INSERT INTO public.profiles (id, role, full_name, email, mobile, city, status)
-- VALUES ('REPLACE-ADMIN-UUID', 'admin', 'DealCircle Admin', 'admin@dealcircle.in', '+919999999999', 'Mumbai', 'approved');

-- Investors
-- INSERT INTO public.profiles (id, role, full_name, email, mobile, city, status)
-- VALUES
--   ('REPLACE-PRIYA-UUID', 'investor', 'Priya Mehta', 'priya@example.com', '+919876543210', 'Bengaluru', 'approved'),
--   ('REPLACE-RAJIV-UUID', 'investor', 'Rajiv Sharma', 'rajiv@example.com', '+919876543211', 'Mumbai', 'approved'),
--   ('REPLACE-ANANYA-UUID', 'investor', 'Ananya Krishnan', 'ananya@example.com', '+919876543212', 'Hyderabad', 'approved');

-- INSERT INTO public.investor_profiles (id, investor_type, corpus_band, investment_interests, linkedin_url)
-- VALUES
--   ('REPLACE-PRIYA-UUID', 'HNI Individual', '₹1-5Cr', ARRAY['startup', 'debt'], NULL),
--   ('REPLACE-RAJIV-UUID', 'Family Office', '₹5Cr+', ARRAY['sme', 'debt'], NULL),
--   ('REPLACE-ANANYA-UUID', 'VC-Angel', '₹25L-1Cr', ARRAY['startup', 'sme'], NULL);

-- Seekers
-- INSERT INTO public.profiles (id, role, full_name, email, mobile, city, status)
-- VALUES
--   ('REPLACE-NITIN-UUID', 'seeker', 'Nitin Mehta', 'nitin@example.com', '+919876543213', 'Surat', 'approved'),
--   ('REPLACE-DEEPA-UUID', 'seeker', 'Deepa Nair', 'deepa@example.com', '+919876543214', 'Pune', 'pending');

-- INSERT INTO public.seeker_profiles (id, company_name, designation)
-- VALUES
--   ('REPLACE-NITIN-UUID', 'Arvind Textiles Pvt Ltd', 'CFO'),
--   ('REPLACE-DEEPA-UUID', 'QuickFreight Logistics', 'Founder');

-- ============================================
-- DEALS (these don't need auth user UUIDs — admin creates them)
-- You can run these immediately after creating the admin user
-- ============================================

-- Deal 1: Startup — Pune B2B SaaS
INSERT INTO public.deals (id, category, title, status, admin_narrative, fields, ticket_min, ticket_max, city, sector, published_at)
VALUES (
  gen_random_uuid(),
  'startup',
  'Pune B2B SaaS — Series A',
  'published',
  '## Overview

A Pune-based B2B SaaS company building a field operations platform for enterprise clients. Strong product-market fit with a growing customer base across manufacturing and logistics sectors.

## Highlights
- Monthly recurring revenue growing 15% month-on-month
- Serving 40+ enterprise clients across India
- Experienced founding team with prior exits
- Clear path to profitability within 18 months',
  '{"company_name": "FieldOps Technologies", "sector": "SaaS/B2B", "stage": "Series A", "ask_amount": 120000000, "valuation_cap": 600000000, "use_of_funds": "Product development, sales team expansion, and market penetration in Southeast Asia", "team_overview": "3 co-founders with 15+ years combined experience in enterprise SaaS. Prior experience at Zoho and Freshworks.", "mrr_arr": 1800000, "website_url": "https://fieldops.example.com"}',
  50000000, 120000000, 'Pune', 'SaaS/B2B', now()
);

-- Deal 2: SME — Surat Textile Manufacturer
INSERT INTO public.deals (id, category, title, status, admin_narrative, fields, ticket_min, ticket_max, city, sector, published_at)
VALUES (
  gen_random_uuid(),
  'sme',
  'Surat Textiles — Equity Round',
  'published',
  '## Overview

A well-established Surat-based textile manufacturer with 20+ years of operations. Strong brand presence in the domestic market with growing export orders.

## Highlights
- Consistent revenue growth over the past 5 years
- Strong EBITDA margins above industry average
- Modern manufacturing facility with capacity for 2x growth
- Well-diversified customer base across retail and wholesale channels',
  '{"company_name": "Arvind Textiles Pvt Ltd", "industry": "Textiles & Apparel", "years_in_operation": 22, "revenue_band": "₹25-100Cr", "ebitda_margin": 14, "ask_amount": 80000000, "instrument": "Equity", "promoter_background": "Second-generation textile family with deep industry relationships. MBA from SP Jain.", "city": "Surat"}',
  30000000, 80000000, 'Surat', 'Textiles', now()
);

-- Deal 3: Debt — Mumbai NBFC NCD
INSERT INTO public.deals (id, category, title, status, admin_narrative, fields, ticket_min, ticket_max, city, sector, published_at)
VALUES (
  gen_random_uuid(),
  'debt',
  'Mumbai NBFC — NCD at 13.5%',
  'published',
  '## Overview

A Mumbai-based NBFC offering NCDs secured against receivables. Strong track record with zero defaults in 8 years of operations.

## Highlights
- AA- credit rating from CRISIL
- Secured against high-quality receivables portfolio
- Monthly interest payout option available
- 8-year track record with zero NPAs',
  '{"borrower_name": "SecureFinance Ltd", "debt_type": "NCD", "loan_amount": 50000000, "tenure_months": 24, "indicative_yield": 13.5, "security_collateral": "Secured against receivables portfolio worth ₹8 Crore", "credit_rating": "AA- (CRISIL)", "repayment_structure": "Monthly interest, bullet principal at maturity", "city": "Mumbai"}',
  10000000, 50000000, 'Mumbai', 'Financial Services', now()
);

-- Deal 4: Debt — Hyderabad Agri-Fintech
INSERT INTO public.deals (id, category, title, status, admin_narrative, fields, ticket_min, ticket_max, city, sector, published_at)
VALUES (
  gen_random_uuid(),
  'debt',
  'Hyderabad Agri-Fintech — Invoice Discounting at 15%',
  'published',
  '## Overview

A Hyderabad-based agri-fintech company offering invoice discounting opportunities. Connecting institutional capital with verified agricultural supply chain invoices.

## Highlights
- 15% indicative yield on 12-month paper
- Technology-driven underwriting and monitoring
- Growing portfolio of verified agricultural invoices
- Strong demand from FPOs and agri-processors',
  '{"borrower_name": "AgriFlow Finance", "debt_type": "Invoice Discounting", "loan_amount": 20000000, "tenure_months": 12, "indicative_yield": 15, "security_collateral": "Unsecured — backed by verified agricultural invoices from FPOs", "credit_rating": "", "repayment_structure": "Quarterly interest and principal repayment", "city": "Hyderabad"}',
  5000000, 20000000, 'Hyderabad', 'Agri-Fintech', now()
);
