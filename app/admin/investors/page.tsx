"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Check, X, Eye } from "lucide-react";
import { categoryConfigs } from "@/lib/dealCategories";
import type { ProfileWithDetails, UserStatus, DealCategory } from "@/types";

const statusStyles: Record<UserStatus, { bg: string; text: string }> = {
  pending: { bg: "rgba(245, 158, 11, 0.2)", text: "#F59E0B" },
  approved: { bg: "rgba(16, 185, 129, 0.2)", text: "#10B981" },
  rejected: { bg: "rgba(239, 68, 68, 0.2)", text: "#EF4444" },
};

export default function AdminInvestorsPage() {
  const [investors, setInvestors] = useState<ProfileWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedInvestor, setSelectedInvestor] = useState<ProfileWithDetails | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const supabase = createClient();

  async function fetchInvestors() {
    let query = supabase
      .from("profiles")
      .select("*, investor_profiles(*)")
      .eq("role", "investor")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data } = await query;
    setInvestors((data as ProfileWithDetails[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchInvestors();
  }, [filter]);

  async function approveInvestor(id: string) {
    const { error } = await supabase.from("profiles").update({ status: "approved", rejection_note: null }).eq("id", id);
    if (error) {
      toast.error("Failed to approve investor");
      return;
    }
    toast.success("Investor approved");
    fetchInvestors();
  }

  async function rejectInvestor() {
    if (!rejectId) return;
    const { error } = await supabase.from("profiles").update({ status: "rejected", rejection_note: rejectNote }).eq("id", rejectId);
    if (error) {
      toast.error("Failed to reject investor");
    } else {
      toast.success("Investor rejected");
      fetchInvestors();
    }
    setRejectId(null);
    setRejectNote("");
  }

  return (
    <div>
      <h1 className="text-2xl font-display text-dc-text-primary mb-6">Investors</h1>

      <div className="mb-4">
        <Select value={filter} onValueChange={(v) => v && setFilter(v)}>
          <SelectTrigger className="w-48 bg-dc-surface border-dc-border text-dc-text-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-dc-surface border-dc-border">
            <SelectItem value="all" className="text-dc-text-primary hover:bg-dc-raised">All</SelectItem>
            <SelectItem value="pending" className="text-dc-text-primary hover:bg-dc-raised">Pending</SelectItem>
            <SelectItem value="approved" className="text-dc-text-primary hover:bg-dc-raised">Approved</SelectItem>
            <SelectItem value="rejected" className="text-dc-text-primary hover:bg-dc-raised">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-dc-surface border border-dc-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dc-border">
                <th className="text-left text-xs font-medium text-dc-text-muted uppercase px-4 py-3">Name</th>
                <th className="text-left text-xs font-medium text-dc-text-muted uppercase px-4 py-3">Type</th>
                <th className="text-left text-xs font-medium text-dc-text-muted uppercase px-4 py-3">Corpus</th>
                <th className="text-left text-xs font-medium text-dc-text-muted uppercase px-4 py-3">City</th>
                <th className="text-left text-xs font-medium text-dc-text-muted uppercase px-4 py-3">Registered</th>
                <th className="text-left text-xs font-medium text-dc-text-muted uppercase px-4 py-3">Status</th>
                <th className="text-right text-xs font-medium text-dc-text-muted uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-dc-border">
                    <td colSpan={7} className="px-4 py-3"><Skeleton className="h-6 w-full bg-dc-raised" /></td>
                  </tr>
                ))
              ) : investors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-dc-text-muted text-sm">No investors found.</td>
                </tr>
              ) : (
                investors.map((inv) => {
                  const ss = statusStyles[inv.status];
                  return (
                    <tr key={inv.id} className="border-b border-dc-border last:border-0 hover:bg-dc-raised/50">
                      <td className="px-4 py-3 text-sm font-medium text-dc-text-primary">{inv.full_name}</td>
                      <td className="px-4 py-3 text-sm text-dc-text-secondary">{inv.investor_profiles?.investor_type || "—"}</td>
                      <td className="px-4 py-3 text-sm text-dc-text-secondary font-mono">{inv.investor_profiles?.corpus_band || "—"}</td>
                      <td className="px-4 py-3 text-sm text-dc-text-secondary">{inv.city || "—"}</td>
                      <td className="px-4 py-3 text-sm text-dc-text-muted">
                        {new Date(inv.created_at).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium px-2 py-1 rounded-full capitalize" style={{ backgroundColor: ss.bg, color: ss.text }}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedInvestor(inv)} className="text-dc-text-secondary hover:text-dc-text-primary hover:bg-dc-raised h-8 w-8 p-0">
                            <Eye size={14} />
                          </Button>
                          {inv.status === "pending" && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => approveInvestor(inv.id)} className="text-dc-success hover:bg-dc-raised h-8 w-8 p-0">
                                <Check size={14} />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setRejectId(inv.id)} className="text-dc-error hover:bg-dc-raised h-8 w-8 p-0">
                                <X size={14} />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Investor Sheet */}
      <Sheet open={!!selectedInvestor} onOpenChange={() => setSelectedInvestor(null)}>
        <SheetContent className="bg-dc-surface border-dc-border text-dc-text-primary">
          <SheetHeader>
            <SheetTitle className="text-dc-text-primary">{selectedInvestor?.full_name}</SheetTitle>
          </SheetHeader>
          {selectedInvestor && (
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs text-dc-text-muted uppercase">Investor Type</p>
                <p className="text-sm text-dc-text-primary">{selectedInvestor.investor_profiles?.investor_type || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-dc-text-muted uppercase">Corpus Band</p>
                <p className="text-sm font-mono text-dc-text-primary">{selectedInvestor.investor_profiles?.corpus_band || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-dc-text-muted uppercase">Investment Interests</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedInvestor.investor_profiles?.investment_interests?.map((cat) => {
                    const cfg = categoryConfigs[cat as DealCategory];
                    return cfg ? (
                      <span key={cat} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: cfg.badgeBg, color: cfg.badgeColor }}>
                        {cfg.label}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs text-dc-text-muted uppercase">Email</p>
                <p className="text-sm text-dc-text-primary">{selectedInvestor.email}</p>
              </div>
              <div>
                <p className="text-xs text-dc-text-muted uppercase">Mobile</p>
                <p className="text-sm text-dc-text-primary">{selectedInvestor.mobile || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-dc-text-muted uppercase">City</p>
                <p className="text-sm text-dc-text-primary">{selectedInvestor.city || "—"}</p>
              </div>
              {selectedInvestor.investor_profiles?.linkedin_url && (
                <div>
                  <p className="text-xs text-dc-text-muted uppercase">LinkedIn</p>
                  <a href={selectedInvestor.investor_profiles.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-dc-gold hover:text-dc-gold-hover">
                    {selectedInvestor.investor_profiles.linkedin_url}
                  </a>
                </div>
              )}
              <div>
                <p className="text-xs text-dc-text-muted uppercase">Status</p>
                <span className="text-xs font-medium px-2 py-1 rounded-full capitalize" style={{ backgroundColor: statusStyles[selectedInvestor.status].bg, color: statusStyles[selectedInvestor.status].text }}>
                  {selectedInvestor.status}
                </span>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Reject Dialog */}
      <Dialog open={!!rejectId} onOpenChange={() => { setRejectId(null); setRejectNote(""); }}>
        <DialogContent className="bg-dc-surface border-dc-border text-dc-text-primary">
          <DialogHeader>
            <DialogTitle>Reject Investor</DialogTitle>
            <DialogDescription className="text-dc-text-secondary">
              Provide a reason for rejection.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Reason for rejection..."
            className="bg-dc-raised border-dc-border text-dc-text-primary placeholder:text-dc-text-muted"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectId(null); setRejectNote(""); }} className="border-dc-border text-dc-text-secondary">
              Cancel
            </Button>
            <Button onClick={rejectInvestor} className="bg-dc-error text-white hover:bg-dc-error/80">
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
