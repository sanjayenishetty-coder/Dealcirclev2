"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { categoryConfigs, type FieldConfig } from "@/lib/dealCategories";
import type { Deal, DealCategory, DealStatus } from "@/types";
import { Save, Globe, Rocket, Building2, Landmark } from "lucide-react";

interface DealEditorProps {
  deal?: Deal;
  seekerName?: string;
}

const categoryIcons = {
  startup: Rocket,
  sme: Building2,
  debt: Landmark,
};

export default function DealEditor({ deal, seekerName }: DealEditorProps) {
  const [category, setCategory] = useState<DealCategory>(deal?.category || "startup");
  const [title, setTitle] = useState(deal?.title || "");
  const [showCompanyName, setShowCompanyName] = useState(deal?.show_company_name || false);
  const [adminNarrative, setAdminNarrative] = useState(deal?.admin_narrative || "");
  const [fields, setFields] = useState<Record<string, any>>(deal?.fields as Record<string, any> || {});
  const [city, setCity] = useState(deal?.city || "");
  const [sector, setSector] = useState(deal?.sector || "");
  const [ticketMin, setTicketMin] = useState<string>(deal?.ticket_min?.toString() || "");
  const [ticketMax, setTicketMax] = useState<string>(deal?.ticket_max?.toString() || "");
  const [ndaRequired, setNdaRequired] = useState(deal?.nda_required || false);
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const supabase = createClient();
  const config = categoryConfigs[category];

  function updateField(name: string, value: any) {
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  function renderField(field: FieldConfig) {
    const value = fields[field.name] || "";

    if (field.type === "select" && field.options) {
      return (
        <div key={field.name}>
          <Label className="text-dc-text-secondary text-sm">{field.label}</Label>
          <Select value={value} onValueChange={(v) => updateField(field.name, v)}>
            <SelectTrigger className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary">
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent className="bg-dc-surface border-dc-border">
              {field.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-dc-text-primary hover:bg-dc-raised">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (field.type === "textarea") {
      return (
        <div key={field.name}>
          <Label className="text-dc-text-secondary text-sm">{field.label}</Label>
          <Textarea
            value={value}
            onChange={(e) => updateField(field.name, e.target.value)}
            className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary placeholder:text-dc-text-muted min-h-[80px]"
            placeholder={field.placeholder}
          />
        </div>
      );
    }

    return (
      <div key={field.name}>
        <Label className="text-dc-text-secondary text-sm">
          {field.prefix && <span className="text-dc-text-muted mr-1">{field.prefix}</span>}
          {field.label}
          {field.suffix && <span className="text-dc-text-muted ml-1">({field.suffix})</span>}
        </Label>
        <Input
          type={field.type === "number" ? "number" : "text"}
          value={value}
          onChange={(e) => updateField(field.name, field.type === "number" ? Number(e.target.value) : e.target.value)}
          className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary placeholder:text-dc-text-muted"
          placeholder={field.placeholder}
        />
      </div>
    );
  }

  async function saveDeal(status: DealStatus) {
    setSaving(true);

    const dealData = {
      category,
      title,
      show_company_name: showCompanyName,
      status,
      admin_narrative: adminNarrative,
      fields,
      city,
      sector,
      ticket_min: ticketMin ? parseInt(ticketMin) : null,
      ticket_max: ticketMax ? parseInt(ticketMax) : null,
      nda_required: ndaRequired,
      published_at: status === "published" ? new Date().toISOString() : deal?.published_at || null,
    };

    let error;
    if (deal) {
      ({ error } = await supabase.from("deals").update(dealData).eq("id", deal.id));
    } else {
      ({ error } = await supabase.from("deals").insert(dealData));
    }

    if (error) {
      toast.error("Failed to save deal: " + error.message);
      setSaving(false);
      return;
    }

    toast.success(status === "published" ? "Deal published!" : "Deal saved as draft");
    router.push("/admin/deals");
    router.refresh();
  }

  return (
    <div className="max-w-3xl">
      {seekerName && (
        <div className="bg-dc-raised border border-dc-border rounded-lg p-3 mb-6">
          <p className="text-sm text-dc-text-secondary">
            Submitted by <span className="text-dc-text-primary font-medium">{seekerName}</span>
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Category Selector */}
        <div>
          <Label className="text-dc-text-secondary text-sm mb-3 block">Deal Category</Label>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(categoryConfigs) as DealCategory[]).map((cat) => {
              const cfg = categoryConfigs[cat];
              const Icon = categoryIcons[cat];
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`p-4 rounded-xl border text-left transition-colors ${
                    category === cat
                      ? "border-dc-gold bg-dc-raised"
                      : "border-dc-border bg-dc-surface hover:border-dc-gold/50"
                  }`}
                >
                  <Icon size={20} style={{ color: cfg.badgeColor }} className="mb-2" />
                  <p className="text-sm font-medium text-dc-text-primary">{cfg.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Deal Title */}
        <div>
          <Label className="text-dc-text-secondary text-sm">Deal Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary placeholder:text-dc-text-muted"
            placeholder="e.g. Hyderabad Textile SME — Equity Round"
          />
          <p className="text-xs text-dc-text-muted mt-1">This is what investors see. Keep it anonymised unless you toggle company name below.</p>
        </div>

        {/* Show company name toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={showCompanyName}
            onCheckedChange={(v) => setShowCompanyName(v as boolean)}
            className="border-dc-border data-[state=checked]:bg-dc-gold data-[state=checked]:border-dc-gold"
          />
          <span className="text-sm text-dc-text-primary">Show company name to investors</span>
        </label>

        {/* Category-specific fields */}
        <div className="bg-dc-surface border border-dc-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-dc-text-primary mb-4" style={{ color: config.badgeColor }}>
            {config.label} Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {config.fields.map(renderField)}
          </div>
        </div>

        {/* Admin Narrative */}
        <div>
          <Label className="text-dc-text-secondary text-sm">Admin Narrative (Markdown)</Label>
          <Textarea
            value={adminNarrative}
            onChange={(e) => setAdminNarrative(e.target.value)}
            className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary placeholder:text-dc-text-muted min-h-[200px] font-mono text-sm"
            placeholder="## Overview&#10;&#10;Write a compelling deal narrative here..."
          />
        </div>

        {/* City, Sector, Ticket Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-dc-text-secondary text-sm">City</Label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary placeholder:text-dc-text-muted"
              placeholder="Mumbai"
            />
          </div>
          <div>
            <Label className="text-dc-text-secondary text-sm">Sector</Label>
            <Input
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary placeholder:text-dc-text-muted"
              placeholder="e.g. SaaS, Textiles, NBFC"
            />
          </div>
          <div>
            <Label className="text-dc-text-secondary text-sm">Ticket Min (₹)</Label>
            <Input
              type="number"
              value={ticketMin}
              onChange={(e) => setTicketMin(e.target.value)}
              className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary placeholder:text-dc-text-muted"
            />
          </div>
          <div>
            <Label className="text-dc-text-secondary text-sm">Ticket Max (₹)</Label>
            <Input
              type="number"
              value={ticketMax}
              onChange={(e) => setTicketMax(e.target.value)}
              className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary placeholder:text-dc-text-muted"
            />
          </div>
        </div>

        {/* NDA Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={ndaRequired}
            onCheckedChange={(v) => setNdaRequired(v as boolean)}
            className="border-dc-border data-[state=checked]:bg-dc-gold data-[state=checked]:border-dc-gold"
          />
          <span className="text-sm text-dc-text-primary">NDA required (stored for future use)</span>
        </label>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-dc-border">
          <Button
            onClick={() => saveDeal("draft")}
            disabled={saving || !title}
            variant="outline"
            className="border-dc-border text-dc-text-secondary hover:bg-dc-raised"
          >
            <Save size={16} className="mr-2" />
            Save as Draft
          </Button>
          <Button
            onClick={() => saveDeal("published")}
            disabled={saving || !title}
            className="bg-dc-gold text-dc-bg hover:bg-dc-gold-hover"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-dc-bg border-t-transparent rounded-full" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Globe size={16} />
                Publish Deal
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
