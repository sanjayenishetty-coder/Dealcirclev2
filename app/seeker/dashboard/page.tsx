"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Send, Search, CheckCircle, XCircle, Plus, RotateCcw } from "lucide-react";
import { categoryConfigs } from "@/lib/dealCategories";
import type { Deal } from "@/types";

type DealState = "none" | "draft" | "submitted" | "published" | "rejected";

const steps = [
  { key: "draft", label: "Draft", icon: FileText },
  { key: "submitted", label: "Submitted", icon: Send },
  { key: "review", label: "Under Review", icon: Search },
  { key: "published", label: "Published", icon: CheckCircle },
];

export default function SeekerDashboard() {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [dealState, setDealState] = useState<DealState>("none");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchDeal() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("deals")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setDeal(data);
        if (data.status === "published") {
          setDealState("published");
        } else if (data.status === "closed") {
          setDealState("rejected");
        } else {
          setDealState("submitted");
        }
      } else {
        setDealState("none");
      }
      setLoading(false);
    }
    fetchDeal();
  }, [supabase]);

  function getStepIndex() {
    switch (dealState) {
      case "draft": return 0;
      case "submitted": return 2;
      case "published": return 3;
      case "rejected": return 3;
      default: return -1;
    }
  }

  const currentStep = getStepIndex();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-dc-raised" />
        <Skeleton className="h-32 w-full bg-dc-raised" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-display text-dc-text-primary mb-6">Dashboard</h1>

      {/* Status Stepper */}
      {dealState !== "none" && (
        <div className="bg-dc-surface border border-dc-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, idx) => {
              const isCompleted = idx < currentStep;
              const isCurrent = idx === currentStep;
              const isRejected = dealState === "rejected" && idx === 3;
              return (
                <div key={step.key} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isRejected
                          ? "border-dc-error bg-dc-error/20"
                          : isCompleted || isCurrent
                          ? "border-dc-gold bg-dc-gold/20"
                          : "border-dc-border bg-dc-surface"
                      }`}
                    >
                      {isRejected ? (
                        <XCircle size={18} className="text-dc-error" />
                      ) : isCompleted ? (
                        <CheckCircle size={18} className="text-dc-gold" />
                      ) : (
                        <step.icon size={18} className={isCurrent ? "text-dc-gold" : "text-dc-text-muted"} />
                      )}
                    </div>
                    <span className={`text-xs mt-2 ${isCurrent ? "text-dc-text-primary font-medium" : "text-dc-text-muted"}`}>
                      {isRejected ? "Rejected" : step.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 ${isCompleted ? "bg-dc-gold" : "bg-dc-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Deal State Display */}
      {dealState === "none" && (
        <div className="bg-dc-surface border border-dc-border rounded-xl p-8 text-center">
          <FileText className="h-12 w-12 text-dc-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-dc-text-primary mb-2">No Deal Submitted Yet</h2>
          <p className="text-dc-text-secondary mb-6">Submit your startup, SME, or debt opportunity to get started.</p>
          <Button onClick={() => router.push("/seeker/form")} className="bg-dc-gold text-dc-bg hover:bg-dc-gold-hover">
            <Plus size={16} className="mr-2" />
            Submit Your Deal
          </Button>
        </div>
      )}

      {dealState === "submitted" && deal && (
        <div className="bg-dc-surface border border-dc-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{
                backgroundColor: categoryConfigs[deal.category].badgeBg,
                color: categoryConfigs[deal.category].badgeColor,
              }}
            >
              {categoryConfigs[deal.category].label}
            </span>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-dc-warning/20 text-dc-warning">
              Under Review
            </span>
          </div>
          <h2 className="text-lg font-semibold text-dc-text-primary mb-2">{deal.title}</h2>
          <p className="text-sm text-dc-text-secondary mb-4">
            Your deal is currently being reviewed by our team. We&apos;ll notify you once it&apos;s published.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(deal.fields as Record<string, any>).slice(0, 4).map(([key, val]) => (
              <div key={key} className="bg-dc-raised rounded-lg p-3">
                <p className="text-xs text-dc-text-muted capitalize">{key.replace(/_/g, " ")}</p>
                <p className="text-sm text-dc-text-primary font-mono mt-1">{String(val)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {dealState === "published" && deal && (
        <div className="bg-dc-surface border border-dc-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-dc-success/20 text-dc-success">
              Published
            </span>
            <span className="text-xs text-dc-text-muted">
              {deal.published_at ? new Date(deal.published_at).toLocaleDateString("en-IN") : ""}
            </span>
          </div>
          <h2 className="text-lg font-semibold text-dc-text-primary">{deal.title}</h2>
          <p className="text-sm text-dc-text-secondary mt-2">
            Your deal is live and visible to approved investors on the marketplace.
          </p>
        </div>
      )}

      {dealState === "rejected" && deal && (
        <div className="bg-dc-surface border border-dc-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-dc-error/20 text-dc-error">
              Not Approved
            </span>
          </div>
          <h2 className="text-lg font-semibold text-dc-text-primary mb-2">{deal.title}</h2>
          {deal.admin_narrative && (
            <div className="bg-dc-raised border border-dc-border rounded-lg p-3 mb-4">
              <p className="text-sm text-dc-text-secondary font-medium mb-1">Feedback:</p>
              <p className="text-sm text-dc-text-primary">{deal.admin_narrative}</p>
            </div>
          )}
          <Button onClick={() => router.push("/seeker/form")} className="bg-dc-gold text-dc-bg hover:bg-dc-gold-hover">
            <RotateCcw size={16} className="mr-2" />
            Resubmit Deal
          </Button>
        </div>
      )}

      {/* Support */}
      <p className="text-sm text-dc-text-muted mt-8 text-center">
        Questions? Reach us at{" "}
        <a href="mailto:deals@dealcircle.in" className="text-dc-gold hover:text-dc-gold-hover">
          deals@dealcircle.in
        </a>
      </p>
    </div>
  );
}
