"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { categoryConfigs, type FieldConfig } from "@/lib/dealCategories";
import type { DealCategory } from "@/types";
import { Rocket, Building2, Landmark, ArrowLeft, ArrowRight, Upload, Send, Check } from "lucide-react";

const categoryIcons = { startup: Rocket, sme: Building2, debt: Landmark };

export default function SeekerFormPage() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<DealCategory | null>(null);
  const [fields, setFields] = useState<Record<string, any>>({});
  const [documents, setDocuments] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  function updateField(name: string, value: any) {
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  function renderField(field: FieldConfig) {
    const value = fields[field.name] || "";

    if (field.type === "select" && field.options) {
      return (
        <div key={field.name}>
          <Label className="text-dc-text-secondary text-sm">
            {field.label} {field.required && <span className="text-dc-error">*</span>}
          </Label>
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
        <div key={field.name} className="sm:col-span-2">
          <Label className="text-dc-text-secondary text-sm">
            {field.label} {field.required && <span className="text-dc-error">*</span>}
          </Label>
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
          {field.required && <span className="text-dc-error ml-1">*</span>}
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const fileList = Array.from(e.target.files).filter(
        (f) => f.type === "application/pdf" && f.size <= 10 * 1024 * 1024
      );
      if (fileList.length !== e.target.files.length) {
        toast.error("Only PDF files under 10MB are accepted.");
      }
      setDocuments((prev) => [...prev, ...fileList]);
    }
  }

  async function handleSubmit() {
    if (!category) return;
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setSubmitting(false);
      return;
    }

    // Upload documents
    const uploadedUrls: string[] = [];
    for (const doc of documents) {
      const filePath = `${user.id}/${Date.now()}-${doc.name}`;
      const { error } = await supabase.storage.from("documents").upload(filePath, doc);
      if (!error) {
        uploadedUrls.push(filePath);
      }
    }

    // Create deal
    const title = `${fields.city || fields.company_name || ""} ${categoryConfigs[category].label}`;
    const { error } = await supabase.from("deals").insert({
      created_by: user.id,
      category,
      title: title.trim(),
      status: "draft",
      fields: { ...fields, document_urls: uploadedUrls },
      city: fields.city || null,
      sector: fields.sector || fields.industry || null,
      ticket_min: fields.ask_amount || fields.loan_amount || null,
      ticket_max: fields.ask_amount || fields.loan_amount || null,
    });

    if (error) {
      toast.error("Failed to submit: " + error.message);
      setSubmitting(false);
      return;
    }

    toast.success("Deal submitted successfully!");
    router.push("/seeker/dashboard");
  }

  const config = category ? categoryConfigs[category] : null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-display text-dc-text-primary mb-6">Submit Your Deal</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 ${
                s <= step
                  ? "border-dc-gold bg-dc-gold/20 text-dc-gold"
                  : "border-dc-border text-dc-text-muted"
              }`}
            >
              {s < step ? <Check size={14} /> : s}
            </div>
            {s < 4 && (
              <div className={`h-0.5 flex-1 mx-2 ${s < step ? "bg-dc-gold" : "bg-dc-border"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Category Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-dc-text-primary">Select Deal Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(Object.keys(categoryConfigs) as DealCategory[]).map((cat) => {
              const cfg = categoryConfigs[cat];
              const Icon = categoryIcons[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-5 rounded-xl border text-left transition-colors ${
                    category === cat
                      ? "border-dc-gold bg-dc-raised"
                      : "border-dc-border bg-dc-surface hover:border-dc-gold/50"
                  }`}
                >
                  <Icon size={24} style={{ color: cfg.badgeColor }} className="mb-3" />
                  <p className="text-sm font-semibold text-dc-text-primary">{cfg.label}</p>
                  <p className="text-xs text-dc-text-secondary mt-1">{cfg.description}</p>
                </button>
              );
            })}
          </div>
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setStep(2)}
              disabled={!category}
              className="bg-dc-gold text-dc-bg hover:bg-dc-gold-hover"
            >
              Next <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Category Fields */}
      {step === 2 && config && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-dc-text-primary">{config.label} Details</h2>
          <div className="bg-dc-surface border border-dc-border rounded-xl p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.fields.map(renderField)}
            </div>
          </div>
          <div className="flex justify-between pt-4">
            <Button onClick={() => setStep(1)} variant="outline" className="border-dc-border text-dc-text-secondary">
              <ArrowLeft size={16} className="mr-2" /> Back
            </Button>
            <Button onClick={() => setStep(3)} className="bg-dc-gold text-dc-bg hover:bg-dc-gold-hover">
              Next <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Documents */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-dc-text-primary">Upload Documents</h2>
          <div className="bg-dc-surface border border-dc-border rounded-xl p-5">
            <div className="border-2 border-dashed border-dc-border rounded-lg p-8 text-center">
              <Upload className="h-10 w-10 text-dc-text-muted mx-auto mb-3" />
              <p className="text-sm text-dc-text-secondary mb-2">
                Upload pitch deck, financials, or supporting documents
              </p>
              <p className="text-xs text-dc-text-muted mb-4">PDF only, max 10MB per file</p>
              <label className="inline-block">
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="px-4 py-2 bg-dc-raised border border-dc-border rounded-lg text-sm text-dc-text-primary cursor-pointer hover:bg-dc-surface transition-colors">
                  Choose Files
                </span>
              </label>
            </div>

            {documents.length > 0 && (
              <div className="mt-4 space-y-2">
                {documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-dc-raised rounded-lg p-3">
                    <span className="text-sm text-dc-text-primary truncate">{doc.name}</span>
                    <button
                      onClick={() => setDocuments((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-dc-text-muted hover:text-dc-error ml-2"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-between pt-4">
            <Button onClick={() => setStep(2)} variant="outline" className="border-dc-border text-dc-text-secondary">
              <ArrowLeft size={16} className="mr-2" /> Back
            </Button>
            <Button onClick={() => setStep(4)} className="bg-dc-gold text-dc-bg hover:bg-dc-gold-hover">
              Next <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Submit */}
      {step === 4 && config && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-dc-text-primary">Review & Submit</h2>
          <div className="bg-dc-surface border border-dc-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span
                className="text-xs font-medium px-2 py-1 rounded-full"
                style={{ backgroundColor: config.badgeBg, color: config.badgeColor }}
              >
                {config.label}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {config.fields.map((field) => {
                const val = fields[field.name];
                if (!val) return null;
                return (
                  <div key={field.name} className="bg-dc-raised rounded-lg p-3">
                    <p className="text-xs text-dc-text-muted">{field.label}</p>
                    <p className="text-sm text-dc-text-primary mt-1">{String(val)}</p>
                  </div>
                );
              })}
            </div>
            {documents.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-dc-text-muted mb-2">Documents ({documents.length})</p>
                {documents.map((doc, idx) => (
                  <p key={idx} className="text-sm text-dc-text-secondary">{doc.name}</p>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-between pt-4">
            <Button onClick={() => setStep(3)} variant="outline" className="border-dc-border text-dc-text-secondary">
              <ArrowLeft size={16} className="mr-2" /> Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-dc-gold text-dc-bg hover:bg-dc-gold-hover"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-dc-bg border-t-transparent rounded-full" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send size={16} />
                  Submit Deal
                </span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
