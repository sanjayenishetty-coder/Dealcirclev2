"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Bookmark, BookmarkCheck, CheckCircle, MessageCircle, Mail, ArrowLeft } from "lucide-react";
import { categoryConfigs, formatIndianCurrency } from "@/lib/dealCategories";
import Link from "next/link";
import type { Deal } from "@/types";

export default function DealDetailPage() {
  const params = useParams();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasExpressedInterest, setHasExpressedInterest] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [expressing, setExpressing] = useState(false);
  const supabase = createClient();

  const fetchDeal = useCallback(async () => {
    const { data } = await supabase.from("deals").select("*").eq("id", params.id).single();
    if (data) setDeal(data);

    // Check bookmark and interest status
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: bookmark } = await supabase
        .from("watchlist")
        .select("deal_id")
        .eq("investor_id", user.id)
        .eq("deal_id", params.id)
        .maybeSingle();
      setIsBookmarked(!!bookmark);

      const { data: interest } = await supabase
        .from("investor_interests")
        .select("id")
        .eq("investor_id", user.id)
        .eq("deal_id", params.id)
        .maybeSingle();
      setHasExpressedInterest(!!interest);
    }

    setLoading(false);
  }, [params.id, supabase]);

  useEffect(() => {
    fetchDeal();
  }, [fetchDeal]);

  async function toggleBookmark() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (isBookmarked) {
      await supabase.from("watchlist").delete().eq("investor_id", user.id).eq("deal_id", deal!.id);
      setIsBookmarked(false);
      toast.success("Removed from watchlist");
    } else {
      await supabase.from("watchlist").insert({ investor_id: user.id, deal_id: deal!.id });
      setIsBookmarked(true);
      toast.success("Added to watchlist");
    }
  }

  async function expressInterest() {
    setExpressing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("investor_interests").insert({
      investor_id: user.id,
      deal_id: deal!.id,
    });

    if (error) {
      toast.error("Failed to express interest: " + error.message);
    } else {
      setHasExpressedInterest(true);
      toast.success("Interest registered. Our team will be in touch.");
    }
    setExpressing(false);
    setShowConfirmModal(false);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 bg-dc-raised" />
        <Skeleton className="h-64 w-full bg-dc-raised" />
      </div>
    );
  }

  if (!deal) {
    return <p className="text-dc-text-muted">Deal not found.</p>;
  }

  const config = categoryConfigs[deal.category];
  const fields = deal.fields as Record<string, any>;

  // Build metrics based on category
  function getMetrics(): { label: string; value: string }[] {
    if (deal!.category === "startup") {
      return [
        { label: "Stage", value: fields.stage || "—" },
        { label: "Ask", value: fields.ask_amount ? formatIndianCurrency(fields.ask_amount) : "—" },
        { label: "Valuation Cap", value: fields.valuation_cap ? formatIndianCurrency(fields.valuation_cap) : "—" },
        { label: "MRR", value: fields.mrr_arr ? formatIndianCurrency(fields.mrr_arr) : "—" },
      ];
    }
    if (deal!.category === "sme") {
      return [
        { label: "Revenue", value: fields.revenue_band || "—" },
        { label: "EBITDA", value: fields.ebitda_margin ? `${fields.ebitda_margin}%` : "—" },
        { label: "Ask", value: fields.ask_amount ? formatIndianCurrency(fields.ask_amount) : "—" },
        { label: "Instrument", value: fields.instrument || "—" },
      ];
    }
    // debt
    return [
      { label: "Yield", value: fields.indicative_yield ? `${fields.indicative_yield}%` : "—" },
      { label: "Tenure", value: fields.tenure_months ? `${fields.tenure_months} months` : "—" },
      { label: "Amount", value: fields.loan_amount ? formatIndianCurrency(fields.loan_amount) : "—" },
      { label: "Type", value: fields.debt_type || "—" },
    ];
  }

  const metrics = getMetrics();

  return (
    <div>
      {/* Back link */}
      <Link href="/investor/deals" className="inline-flex items-center gap-1 text-sm text-dc-text-secondary hover:text-dc-text-primary mb-4">
        <ArrowLeft size={14} /> Back to deals
      </Link>

      <div className="lg:flex gap-6">
        {/* Main content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-xs font-medium px-2 py-1 rounded-full"
                  style={{ backgroundColor: config.badgeBg, color: config.badgeColor }}
                >
                  {config.label}
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${deal.status === "published" ? "bg-dc-success/20 text-dc-success" : "bg-dc-text-muted/20 text-dc-text-muted"}`}>
                  {deal.status === "published" ? "Active" : "Closed"}
                </span>
              </div>
              <h1 className="text-2xl font-display text-dc-text-primary">{deal.title}</h1>
            </div>
            <button onClick={toggleBookmark} className="text-dc-text-muted hover:text-dc-gold mt-1">
              {isBookmarked ? <BookmarkCheck size={22} className="text-dc-gold" /> : <Bookmark size={22} />}
            </button>
          </div>

          {/* Metrics strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {metrics.map((m) => (
              <div key={m.label} className="bg-dc-surface border border-dc-border rounded-xl p-4">
                <p className="text-xs text-dc-text-muted mb-1">{m.label}</p>
                <p className="text-sm font-mono font-semibold text-dc-text-primary">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Narrative */}
          {deal.admin_narrative && (
            <div className="bg-dc-surface border border-dc-border rounded-xl p-6 mb-6">
              <div className="prose prose-invert prose-sm max-w-none text-dc-text-primary [&_h2]:text-dc-text-primary [&_h2]:font-semibold [&_h2]:text-lg [&_h2]:mb-3 [&_h2]:mt-6 first:[&_h2]:mt-0 [&_p]:text-dc-text-secondary [&_li]:text-dc-text-secondary [&_ul]:space-y-1 [&_strong]:text-dc-text-primary">
                <ReactMarkdown>{deal.admin_narrative}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Mobile CTA */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-dc-bg border-t border-dc-border z-20">
            {hasExpressedInterest ? (
              <Button disabled className="w-full bg-dc-surface border border-dc-success text-dc-success">
                <CheckCircle size={16} className="mr-2" />
                Interest Expressed
              </Button>
            ) : (
              <Button onClick={() => setShowConfirmModal(true)} className="w-full bg-dc-gold text-dc-bg hover:bg-dc-gold-hover">
                Express Interest
              </Button>
            )}
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:block w-80 shrink-0 space-y-4">
          {/* Deal snapshot card */}
          <div className="bg-dc-surface border border-dc-border rounded-xl p-5 sticky top-8">
            <h3 className="text-sm font-semibold text-dc-text-primary mb-4">Deal Snapshot</h3>
            <div className="space-y-3 mb-6">
              {metrics.map((m) => (
                <div key={m.label} className="flex justify-between">
                  <span className="text-xs text-dc-text-muted">{m.label}</span>
                  <span className="text-sm font-mono text-dc-text-primary">{m.value}</span>
                </div>
              ))}
            </div>

            {hasExpressedInterest ? (
              <Button disabled className="w-full bg-dc-surface border border-dc-success text-dc-success">
                <CheckCircle size={16} className="mr-2" />
                Interest Expressed
              </Button>
            ) : (
              <Button onClick={() => setShowConfirmModal(true)} className="w-full bg-dc-gold text-dc-bg hover:bg-dc-gold-hover">
                Express Interest
              </Button>
            )}
          </div>

          {/* Contact card */}
          <div className="bg-dc-surface border border-dc-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-dc-text-primary mb-3">Speak to our team</h3>
            <div className="space-y-2">
              <a
                href="https://wa.me/919999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-dc-text-secondary hover:text-dc-gold transition-colors"
              >
                <MessageCircle size={14} />
                WhatsApp
              </a>
              <a
                href="mailto:deals@dealcircle.in"
                className="flex items-center gap-2 text-sm text-dc-text-secondary hover:text-dc-gold transition-colors"
              >
                <Mail size={14} />
                deals@dealcircle.in
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Express Interest Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="bg-dc-surface border-dc-border text-dc-text-primary">
          <DialogHeader>
            <DialogTitle>Express Interest</DialogTitle>
            <DialogDescription className="text-dc-text-secondary">
              By expressing interest, you agree to the DealCircle team sharing your investor profile with the relevant deal team. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)} className="border-dc-border text-dc-text-secondary">
              Cancel
            </Button>
            <Button onClick={expressInterest} disabled={expressing} className="bg-dc-gold text-dc-bg hover:bg-dc-gold-hover">
              {expressing ? "Confirming..." : "Confirm Interest"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
