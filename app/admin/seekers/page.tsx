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
import type { ProfileWithDetails, UserStatus } from "@/types";

const statusStyles: Record<UserStatus, { bg: string; text: string }> = {
  pending: { bg: "rgba(245, 158, 11, 0.2)", text: "#F59E0B" },
  approved: { bg: "rgba(16, 185, 129, 0.2)", text: "#10B981" },
  rejected: { bg: "rgba(239, 68, 68, 0.2)", text: "#EF4444" },
};

export default function AdminSeekersPage() {
  const [seekers, setSeekers] = useState<ProfileWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedSeeker, setSelectedSeeker] = useState<ProfileWithDetails | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const supabase = createClient();

  async function fetchSeekers() {
    let query = supabase
      .from("profiles")
      .select("*, seeker_profiles(*)")
      .eq("role", "seeker")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data } = await query;
    setSeekers((data as ProfileWithDetails[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchSeekers();
  }, [filter]);

  async function approveSeeker(id: string) {
    const { error } = await supabase.from("profiles").update({ status: "approved", rejection_note: null }).eq("id", id);
    if (error) {
      toast.error("Failed to approve seeker");
      return;
    }
    toast.success("Seeker approved");
    fetchSeekers();
  }

  async function rejectSeeker() {
    if (!rejectId) return;
    const { error } = await supabase.from("profiles").update({ status: "rejected", rejection_note: rejectNote }).eq("id", rejectId);
    if (error) {
      toast.error("Failed to reject seeker");
    } else {
      toast.success("Seeker rejected");
      fetchSeekers();
    }
    setRejectId(null);
    setRejectNote("");
  }

  return (
    <div>
      <h1 className="text-2xl font-display text-dc-text-primary mb-6">Seekers</h1>

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
                <th className="text-left text-xs font-medium text-dc-text-muted uppercase px-4 py-3">Company</th>
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
                    <td colSpan={6} className="px-4 py-3"><Skeleton className="h-6 w-full bg-dc-raised" /></td>
                  </tr>
                ))
              ) : seekers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-dc-text-muted text-sm">
                    No seekers found.
                  </td>
                </tr>
              ) : (
                seekers.map((seeker) => {
                  const ss = statusStyles[seeker.status];
                  return (
                    <tr key={seeker.id} className="border-b border-dc-border last:border-0 hover:bg-dc-raised/50">
                      <td className="px-4 py-3 text-sm font-medium text-dc-text-primary">{seeker.full_name}</td>
                      <td className="px-4 py-3 text-sm text-dc-text-secondary">{seeker.seeker_profiles?.company_name || "—"}</td>
                      <td className="px-4 py-3 text-sm text-dc-text-secondary">{seeker.city || "—"}</td>
                      <td className="px-4 py-3 text-sm text-dc-text-muted">
                        {new Date(seeker.created_at).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium px-2 py-1 rounded-full capitalize" style={{ backgroundColor: ss.bg, color: ss.text }}>
                          {seeker.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedSeeker(seeker)} className="text-dc-text-secondary hover:text-dc-text-primary hover:bg-dc-raised h-8 w-8 p-0">
                            <Eye size={14} />
                          </Button>
                          {seeker.status === "pending" && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => approveSeeker(seeker.id)} className="text-dc-success hover:bg-dc-raised h-8 w-8 p-0">
                                <Check size={14} />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setRejectId(seeker.id)} className="text-dc-error hover:bg-dc-raised h-8 w-8 p-0">
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

      {/* View Seeker Sheet */}
      <Sheet open={!!selectedSeeker} onOpenChange={() => setSelectedSeeker(null)}>
        <SheetContent className="bg-dc-surface border-dc-border text-dc-text-primary">
          <SheetHeader>
            <SheetTitle className="text-dc-text-primary">{selectedSeeker?.full_name}</SheetTitle>
          </SheetHeader>
          {selectedSeeker && (
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs text-dc-text-muted uppercase">Company</p>
                <p className="text-sm text-dc-text-primary">{selectedSeeker.seeker_profiles?.company_name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-dc-text-muted uppercase">Designation</p>
                <p className="text-sm text-dc-text-primary">{selectedSeeker.seeker_profiles?.designation || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-dc-text-muted uppercase">Email</p>
                <p className="text-sm text-dc-text-primary">{selectedSeeker.email}</p>
              </div>
              <div>
                <p className="text-xs text-dc-text-muted uppercase">Mobile</p>
                <p className="text-sm text-dc-text-primary">{selectedSeeker.mobile || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-dc-text-muted uppercase">City</p>
                <p className="text-sm text-dc-text-primary">{selectedSeeker.city || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-dc-text-muted uppercase">Status</p>
                <span
                  className="text-xs font-medium px-2 py-1 rounded-full capitalize"
                  style={{ backgroundColor: statusStyles[selectedSeeker.status].bg, color: statusStyles[selectedSeeker.status].text }}
                >
                  {selectedSeeker.status}
                </span>
              </div>
              {selectedSeeker.rejection_note && (
                <div>
                  <p className="text-xs text-dc-text-muted uppercase">Rejection Note</p>
                  <p className="text-sm text-dc-error">{selectedSeeker.rejection_note}</p>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Reject Dialog */}
      <Dialog open={!!rejectId} onOpenChange={() => { setRejectId(null); setRejectNote(""); }}>
        <DialogContent className="bg-dc-surface border-dc-border text-dc-text-primary">
          <DialogHeader>
            <DialogTitle>Reject Seeker</DialogTitle>
            <DialogDescription className="text-dc-text-secondary">
              Provide a reason for rejection. The seeker will see this note.
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
            <Button onClick={rejectSeeker} className="bg-dc-error text-white hover:bg-dc-error/80">
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
