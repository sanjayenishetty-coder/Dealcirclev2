"use client";
import { Suspense } from "react";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import Link from "next/link";
import { UserPlus, Building2, TrendingUp } from "lucide-react";
import type { UserRole, DealCategory } from "@/types";

type Step = "role" | "details";

function RegisterPageInner() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") as UserRole | null;

  const [step, setStep] = useState<Step>(initialRole ? "details" : "role");
  const [role, setRole] = useState<UserRole | null>(initialRole);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Shared fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");

  // Investor fields
  const [investorType, setInvestorType] = useState("");
  const [corpusBand, setCorpusBand] = useState("");
  const [investmentInterests, setInvestmentInterests] = useState<DealCategory[]>([]);
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // Seeker fields
  const [companyName, setCompanyName] = useState("");
  const [designation, setDesignation] = useState("");

  function toggleInterest(cat: DealCategory) {
    setInvestmentInterests((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    setLoading(true);

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });

    if (authError) {
      toast.error(authError.message);
      setLoading(false);
      return;
    }

    if (!authData.user) {
      toast.error("Registration failed. Please try again.");
      setLoading(false);
      return;
    }

    // Create profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      role,
      full_name: fullName,
      email,
      mobile,
      city,
      status: "pending",
    });

    if (profileError) {
      toast.error("Failed to create profile: " + profileError.message);
      setLoading(false);
      return;
    }

    // Create role-specific profile
    if (role === "investor") {
      await supabase.from("investor_profiles").insert({
        id: authData.user.id,
        investor_type: investorType,
        corpus_band: corpusBand,
        investment_interests: investmentInterests,
        linkedin_url: linkedinUrl || null,
      });
    } else if (role === "seeker") {
      await supabase.from("seeker_profiles").insert({
        id: authData.user.id,
        company_name: companyName,
        designation,
      });
    }

    toast.success("Registration successful!");
    router.push("/auth/pending");
  }

  if (step === "role") {
    return (
      <div className="min-h-screen bg-dc-bg flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display text-dc-text-primary mb-2">
              Join SMELogin
            </h1>
            <p className="text-dc-text-secondary">How would you like to participate?</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => {
                setRole("seeker");
                setStep("details");
              }}
              className="bg-dc-surface border border-dc-border rounded-xl p-6 text-left hover:border-dc-gold transition-colors group"
            >
              <Building2 className="h-8 w-8 text-dc-gold mb-3" />
              <h3 className="text-lg font-semibold text-dc-text-primary mb-1">
                List Your Deal
              </h3>
              <p className="text-sm text-dc-text-secondary">
                Submit your startup, SME, or debt opportunity for investor access
              </p>
            </button>

            <button
              onClick={() => {
                setRole("investor");
                setStep("details");
              }}
              className="bg-dc-surface border border-dc-border rounded-xl p-6 text-left hover:border-dc-gold transition-colors group"
            >
              <TrendingUp className="h-8 w-8 text-dc-gold mb-3" />
              <h3 className="text-lg font-semibold text-dc-text-primary mb-1">
                Join as Investor
              </h3>
              <p className="text-sm text-dc-text-secondary">
                Browse curated deals and express interest in opportunities
              </p>
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-dc-text-secondary">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-dc-gold hover:text-dc-gold-hover font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dc-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display text-dc-text-primary mb-2">
            {role === "investor" ? "Investor Registration" : "Seeker Registration"}
          </h1>
          <p className="text-dc-text-secondary">
            Fill in your details to get started
          </p>
        </div>

        <div className="bg-dc-surface border border-dc-border rounded-xl p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Common fields */}
            <div>
              <Label className="text-dc-text-secondary text-sm">Full Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary placeholder:text-dc-text-muted"
                placeholder="Your full name"
              />
            </div>

            <div>
              <Label className="text-dc-text-secondary text-sm">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary placeholder:text-dc-text-muted"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <Label className="text-dc-text-secondary text-sm">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary placeholder:text-dc-text-muted"
                placeholder="Min 6 characters"
              />
            </div>

            <div>
              <Label className="text-dc-text-secondary text-sm">Mobile</Label>
              <Input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary placeholder:text-dc-text-muted"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <Label className="text-dc-text-secondary text-sm">City</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary placeholder:text-dc-text-muted"
                placeholder="Mumbai"
              />
            </div>

            {/* Seeker-specific fields */}
            {role === "seeker" && (
              <>
                <div>
                  <Label className="text-dc-text-secondary text-sm">Company Name</Label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary placeholder:text-dc-text-muted"
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <Label className="text-dc-text-secondary text-sm">Designation</Label>
                  <Input
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    required
                    className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary placeholder:text-dc-text-muted"
                    placeholder="e.g. Founder, CEO, CFO"
                  />
                </div>
              </>
            )}

            {/* Investor-specific fields */}
            {role === "investor" && (
              <>
                <div>
                  <Label className="text-dc-text-secondary text-sm">Investor Type</Label>
                  <Select value={investorType} onValueChange={(v) => v && setInvestorType(v)}>
                    <SelectTrigger className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-dc-surface border-dc-border">
                      {["HNI Individual", "Family Office", "Corporate", "VC-Angel", "Other"].map((t) => (
                        <SelectItem key={t} value={t} className="text-dc-text-primary hover:bg-dc-raised">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-dc-text-secondary text-sm">Investable Corpus</Label>
                  <Select value={corpusBand} onValueChange={(v) => v && setCorpusBand(v)}>
                    <SelectTrigger className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent className="bg-dc-surface border-dc-border">
                      {["<₹25L", "₹25L-1Cr", "₹1-5Cr", "₹5Cr+"].map((b) => (
                        <SelectItem key={b} value={b} className="text-dc-text-primary hover:bg-dc-raised">
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-dc-text-secondary text-sm mb-2 block">
                    Investment Interests
                  </Label>
                  <div className="space-y-2">
                    {(["startup", "sme", "debt"] as DealCategory[]).map((cat) => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={investmentInterests.includes(cat)}
                          onCheckedChange={() => toggleInterest(cat)}
                          className="border-dc-border data-[state=checked]:bg-dc-gold data-[state=checked]:border-dc-gold"
                        />
                        <span className="text-sm text-dc-text-primary">
                          {cat === "startup" ? "Startup Funding" : cat === "sme" ? "SME Investment" : "Debt Opportunity"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-dc-text-secondary text-sm">LinkedIn URL (optional)</Label>
                  <Input
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary placeholder:text-dc-text-muted"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-dc-gold text-dc-bg hover:bg-dc-gold-hover font-medium rounded-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-dc-bg border-t-transparent rounded-full" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus size={16} />
                  Create Account
                </span>
              )}
            </Button>
          </form>

          <div className="mt-4 flex justify-between text-sm">
            <button
              onClick={() => {
                setStep("role");
                setRole(null);
              }}
              className="text-dc-text-secondary hover:text-dc-text-primary"
            >
              &larr; Change role
            </button>
            <Link href="/auth/login" className="text-dc-gold hover:text-dc-gold-hover">
              Already have an account?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dc-bg flex items-center justify-center"><p className="text-dc-text-secondary">Loading...</p></div>}>
      <RegisterPageInner />
    </Suspense>
  );
}
