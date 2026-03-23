import Link from "next/link";
import { Rocket, Building2, Landmark, ArrowRight, Shield, Users, Briefcase } from "lucide-react";

const categories = [
  {
    icon: Rocket,
    title: "Startup Funding",
    description: "Pre-Seed to Series B funding for high-growth technology startups across India.",
    color: "#3B82F6",
    bg: "rgba(59, 130, 246, 0.15)",
  },
  {
    icon: Building2,
    title: "SME Investment",
    description: "Equity and preference share investments in established SMEs with strong fundamentals.",
    color: "#6366F1",
    bg: "rgba(99, 102, 241, 0.15)",
  },
  {
    icon: Landmark,
    title: "Debt Opportunity",
    description: "NCDs, term loans, invoice discounting and structured debt with attractive yields.",
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.15)",
  },
];

const steps = [
  {
    step: "01",
    title: "Submit or Browse",
    description: "Seekers submit deals for review. Investors browse the curated marketplace.",
  },
  {
    step: "02",
    title: "Admin Curation",
    description: "Every deal is reviewed, verified, and published by our team. Quality guaranteed.",
  },
  {
    step: "03",
    title: "Connect & Close",
    description: "Express interest and our team facilitates introductions. We handle everything offline.",
  },
];

const trustItems = [
  { icon: Shield, label: "Curated Deals" },
  { icon: Users, label: "Verified Investors" },
  { icon: Briefcase, label: "Admin-Mediated" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dc-bg">
      {/* Nav */}
      <header className="border-b border-dc-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-display text-dc-text-primary">SMELogin</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm text-dc-text-secondary hover:text-dc-text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="text-sm bg-dc-gold text-dc-bg px-4 py-2 rounded-lg font-medium hover:bg-dc-gold-hover transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 lg:py-28 text-center">
        <h2 className="text-4xl lg:text-6xl font-display text-dc-text-primary mb-6 leading-tight">
          Curated Investment Deals,
          <br />
          <span className="text-dc-gold">One Platform.</span>
        </h2>
        <p className="text-lg text-dc-text-secondary max-w-2xl mx-auto mb-10">
          Access verified startup funding, SME investments, and debt opportunities — all reviewed and published by our expert team.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/register?role=seeker"
            className="inline-flex items-center gap-2 bg-dc-gold text-dc-bg px-6 py-3 rounded-lg font-medium hover:bg-dc-gold-hover transition-colors"
          >
            List Your Deal <ArrowRight size={16} />
          </Link>
          <Link
            href="/auth/register?role=investor"
            className="inline-flex items-center gap-2 border border-dc-gold text-dc-gold px-6 py-3 rounded-lg font-medium hover:bg-dc-gold/10 transition-colors"
          >
            Join as Investor <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-display text-dc-text-primary text-center mb-12">
          How It Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-12 h-12 rounded-full bg-dc-gold/20 text-dc-gold font-mono font-bold text-lg flex items-center justify-center mx-auto mb-4">
                {s.step}
              </div>
              <h4 className="text-lg font-semibold text-dc-text-primary mb-2">{s.title}</h4>
              <p className="text-sm text-dc-text-secondary">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Category Cards */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-display text-dc-text-primary text-center mb-12">
          Three Deal Categories
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="bg-dc-surface border border-dc-border rounded-xl p-6 hover:border-dc-gold/30 transition-colors"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: cat.bg }}
              >
                <cat.icon size={24} style={{ color: cat.color }} />
              </div>
              <h4 className="text-lg font-semibold text-dc-text-primary mb-2">{cat.title}</h4>
              <p className="text-sm text-dc-text-secondary">{cat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-t border-dc-border">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-wrap items-center justify-center gap-12">
            {trustItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-dc-text-secondary">
                <item.icon size={20} className="text-dc-gold" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dc-border">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-display text-dc-text-primary">SMELogin</h4>
            <p className="text-xs text-dc-text-muted mt-1">Curated investment deals</p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/auth/register?role=seeker" className="text-sm text-dc-text-secondary hover:text-dc-gold">
              List Your Deal
            </Link>
            <Link href="/auth/register?role=investor" className="text-sm text-dc-text-secondary hover:text-dc-gold">
              Join as Investor
            </Link>
            <a href="mailto:deals@smelogin.com" className="text-sm text-dc-text-secondary hover:text-dc-gold">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
