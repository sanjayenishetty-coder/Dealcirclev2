"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Save } from "lucide-react";
import type { DealCategory } from "@/types";

export default function InvestorProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");
  const [investorType, setInvestorType] = useState("");
  const [corpusBand, setCorpusBand] = useState("");
  const [investmentInterests, setInvestmentInterests] = useState<DealCategory[]>([]);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("email, mobile, city")
        .eq("id", user.id)
        .single();

      const { data: invProfile } = await supabase
        .from("investor_profiles")
        .select("investor_type, corpus_band, investment_interests, linkedin_url")
        .eq("id", user.id)
        .single();

      if (profile) {
        setEmail(profile.email);
        setMobile(profile.mobile || "");
        setCity(profile.city || "");
      }
      if (invProfile) {
        setInvestorType(invProfile.investor_type || "");
        setCorpusBand(invProfile.corpus_band || "");
        setInvestmentInterests((invProfile.investment_interests as DealCategory[]) || []);
        setLinkedinUrl(invProfile.linkedin_url || "");
      }
      setLoading(false);
    }
    fetchProfile();
  }, [supabase]);

  function toggleInterest(cat: DealCategory) {
    setInvestmentInterests((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  async function handleSave() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await Promise.all([
      supabase.from("profiles").update({ city }).eq("id", user.id),
      supabase.from("investor_profiles").update({
        investor_type: investorType,
        corpus_band: corpusBand,
        investment_interests: investmentInterests,
        linkedin_url: linkedinUrl || null,
      }).eq("id", user.id),
    ]);

    toast.success("Profile updated");
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="max-w-lg space-y-4">
        <Skeleton className="h-8 w-48 bg-dc-raised" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full bg-dc-raised" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-display text-dc-text-primary mb-6">Profile</h1>

      <div className="bg-dc-surface border border-dc-border rounded-xl p-5 space-y-4">
        {/* Read-only fields */}
        <div>
          <Label className="text-dc-text-secondary text-sm">Email</Label>
          <Input value={email} readOnly className="mt-1 bg-dc-raised border-dc-border text-dc-text-muted cursor-not-allowed" />
          <p className="text-xs text-dc-text-muted mt-1">Contact support to change</p>
        </div>

        <div>
          <Label className="text-dc-text-secondary text-sm">Mobile</Label>
          <Input value={mobile} readOnly className="mt-1 bg-dc-raised border-dc-border text-dc-text-muted cursor-not-allowed" />
          <p className="text-xs text-dc-text-muted mt-1">Contact support to change</p>
        </div>

        {/* Editable fields */}
        <div>
          <Label className="text-dc-text-secondary text-sm">City</Label>
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary"
          />
        </div>

        <div>
          <Label className="text-dc-text-secondary text-sm">Investor Type</Label>
          <Select value={investorType} onValueChange={(v) => v && setInvestorType(v)}>
            <SelectTrigger className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-dc-surface border-dc-border">
              {["HNI Individual", "Family Office", "Corporate", "VC-Angel", "Other"].map((t) => (
                <SelectItem key={t} value={t} className="text-dc-text-primary hover:bg-dc-raised">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-dc-text-secondary text-sm">Investable Corpus</Label>
          <Select value={corpusBand} onValueChange={(v) => v && setCorpusBand(v)}>
            <SelectTrigger className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-dc-surface border-dc-border">
              {["<₹25L", "₹25L-1Cr", "₹1-5Cr", "₹5Cr+"].map((b) => (
                <SelectItem key={b} value={b} className="text-dc-text-primary hover:bg-dc-raised">{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-dc-text-secondary text-sm mb-2 block">Investment Interests</Label>
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
          <Label className="text-dc-text-secondary text-sm">LinkedIn URL</Label>
          <Input
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary placeholder:text-dc-text-muted"
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full bg-dc-gold text-dc-bg hover:bg-dc-gold-hover">
          <Save size={16} className="mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
