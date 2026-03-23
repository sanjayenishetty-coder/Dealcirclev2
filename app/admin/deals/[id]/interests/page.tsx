"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { InterestStatus } from "@/types";

interface InterestRow {
  id: string;
  investor_id: string;
  status: InterestStatus;
  admin_notes: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    mobile: string;
    city: string;
    investor_profiles: {
      investor_type: string;
      corpus_band: string;
    } | null;
  };
}

const statusOptions: InterestStatus[] = ["new", "contacted", "in_discussion", "converted", "dropped"];

const statusLabels: Record<InterestStatus, string> = {
  new: "New",
  contacted: "Contacted",
  in_discussion: "In Discussion",
  converted: "Converted",
  dropped: "Dropped",
};

const statusStyles: Record<InterestStatus, { bg: string; text: string }> = {
  new: { bg: "rgba(59, 130, 246, 0.2)", text: "#3B82F6" },
  contacted: { bg: "rgba(245, 158, 11, 0.2)", text: "#F59E0B" },
  in_discussion: { bg: "rgba(99, 102, 241, 0.2)", text: "#6366F1" },
  converted: { bg: "rgba(16, 185, 129, 0.2)", text: "#10B981" },
  dropped: { bg: "rgba(239, 68, 68, 0.2)", text: "#EF4444" },
};

export default function DealInterestsPage() {
  const params = useParams();
  const [dealTitle, setDealTitle] = useState("");
  const [interests, setInterests] = useState<InterestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchInterests = useCallback(async () => {
    // Get deal title
    const { data: deal } = await supabase.from("deals").select("title").eq("id", params.id).single();
    if (deal) setDealTitle(deal.title);

    // Get interests with investor profiles
    const { data } = await supabase
      .from("investor_interests")
      .select("*, profiles!investor_id(full_name, email, mobile, city, investor_profiles(investor_type, corpus_band))")
      .eq("deal_id", params.id)
      .order("created_at", { ascending: false });

    setInterests((data as unknown as InterestRow[]) || []);
    setLoading(false);
  }, [params.id, supabase]);

  useEffect(() => {
    fetchInterests();
  }, [fetchInterests]);

  async function updateStatus(interestId: string, status: InterestStatus) {
    const { error } = await supabase.from("investor_interests").update({ status }).eq("id", interestId);
    if (error) {
      toast.error("Failed to update status");
      return;
    }
    setInterests((prev) => prev.map((i) => (i.id === interestId ? { ...i, status } : i)));
    toast.success("Status updated");
  }

  async function updateNotes(interestId: string, notes: string) {
    const { error } = await supabase.from("investor_interests").update({ admin_notes: notes }).eq("id", interestId);
    if (error) {
      toast.error("Failed to save notes");
    }
  }

  function exportCSV() {
    const headers = ["Investor Name", "Email", "Mobile", "Type", "Corpus", "City", "Date", "Status"];
    const rows = interests.map((i) => [
      i.profiles.full_name,
      i.profiles.email,
      i.profiles.mobile || "",
      i.profiles.investor_profiles?.investor_type || "",
      i.profiles.investor_profiles?.corpus_band || "",
      i.profiles.city || "",
      new Date(i.created_at).toLocaleDateString("en-IN"),
      i.status,
    ]);

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interests-${dealTitle.replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/deals">
          <Button variant="ghost" size="sm" className="text-dc-text-secondary hover:text-dc-text-primary hover:bg-dc-raised h-8 w-8 p-0">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-display text-dc-text-primary">Interests</h1>
          <p className="text-sm text-dc-text-secondary">{dealTitle}</p>
        </div>
        <div className="ml-auto">
          <Button onClick={exportCSV} variant="outline" className="border-dc-border text-dc-text-secondary hover:bg-dc-raised" disabled={interests.length === 0}>
            <Download size={14} className="mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="bg-dc-surface border border-dc-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dc-border">
                <th className="text-left text-xs font-medium text-dc-text-muted uppercase px-4 py-3">Investor</th>
                <th className="text-left text-xs font-medium text-dc-text-muted uppercase px-4 py-3">Type</th>
                <th className="text-left text-xs font-medium text-dc-text-muted uppercase px-4 py-3">Corpus</th>
                <th className="text-left text-xs font-medium text-dc-text-muted uppercase px-4 py-3">City</th>
                <th className="text-left text-xs font-medium text-dc-text-muted uppercase px-4 py-3">Date</th>
                <th className="text-left text-xs font-medium text-dc-text-muted uppercase px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-dc-text-muted uppercase px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-dc-border">
                    <td colSpan={7} className="px-4 py-3"><Skeleton className="h-6 w-full bg-dc-raised" /></td>
                  </tr>
                ))
              ) : interests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-dc-text-muted text-sm">
                    No interests expressed yet for this deal.
                  </td>
                </tr>
              ) : (
                interests.map((int) => (
                  <tr key={int.id} className="border-b border-dc-border last:border-0 hover:bg-dc-raised/50">
                    <td className="px-4 py-3 text-sm font-medium text-dc-text-primary">{int.profiles.full_name}</td>
                    <td className="px-4 py-3 text-sm text-dc-text-secondary">{int.profiles.investor_profiles?.investor_type || "—"}</td>
                    <td className="px-4 py-3 text-sm text-dc-text-secondary font-mono">{int.profiles.investor_profiles?.corpus_band || "—"}</td>
                    <td className="px-4 py-3 text-sm text-dc-text-secondary">{int.profiles.city || "—"}</td>
                    <td className="px-4 py-3 text-sm text-dc-text-muted">{new Date(int.created_at).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <Select value={int.status} onValueChange={(v) => updateStatus(int.id, v as InterestStatus)}>
                        <SelectTrigger className="w-36 h-8 text-xs bg-transparent border-dc-border" style={{ color: statusStyles[int.status].text }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-dc-surface border-dc-border">
                          {statusOptions.map((s) => (
                            <SelectItem key={s} value={s} className="text-dc-text-primary hover:bg-dc-raised text-xs">
                              {statusLabels[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        defaultValue={int.admin_notes || ""}
                        onBlur={(e) => updateNotes(int.id, e.target.value)}
                        placeholder="Add notes..."
                        className="h-8 text-xs bg-transparent border-dc-border text-dc-text-primary placeholder:text-dc-text-muted"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
