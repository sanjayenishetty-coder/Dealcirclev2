"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Plus, Pencil, Eye, Trash2, Pause, Play, X } from "lucide-react";
import { formatIndianCurrency, categoryConfigs } from "@/lib/dealCategories";
import type { Deal, DealStatus } from "@/types";

const statusColors: Record<DealStatus, { bg: string; text: string }> = {
  draft: { bg: "rgba(75, 85, 99, 0.2)", text: "#94A3B8" },
  published: { bg: "rgba(16, 185, 129, 0.2)", text: "#10B981" },
  paused: { bg: "rgba(245, 158, 11, 0.2)", text: "#F59E0B" },
  closed: { bg: "rgba(239, 68, 68, 0.2)", text: "#EF4444" },
};

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const supabase = createClient();

  async function fetchDeals() {
    let query = supabase.from("deals").select("*").order("created_at", { ascending: false });
    if (filter !== "all") {
      query = query.eq("status", filter);
    }
    const { data } = await query;
    setDeals(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchDeals();
  }, [filter]);

  async function toggleStatus(deal: Deal) {
    const newStatus = deal.status === "published" ? "paused" : "published";
    const updateData: any = { status: newStatus };
    if (newStatus === "published" && !deal.published_at) {
      updateData.published_at = new Date().toISOString();
    }
    const { error } = await supabase.from("deals").update(updateData).eq("id", deal.id);
    if (error) {
      toast.error("Failed to update status");
      return;
    }
    toast.success(`Deal ${newStatus === "published" ? "published" : "paused"}`);
    fetchDeals();
  }

  async function closeDeal(id: string) {
    const { error } = await supabase.from("deals").update({ status: "closed" }).eq("id", id);
    if (error) {
      toast.error("Failed to close deal");
      return;
    }
    toast.success("Deal closed");
    fetchDeals();
  }

  async function deleteDeal() {
    if (!deleteId) return;
    const { error } = await supabase.from("deals").delete().eq("id", deleteId);
    if (error) {
      toast.error("Failed to delete deal");
    } else {
      toast.success("Deal deleted");
      fetchDeals();
    }
    setDeleteId(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display text-dc-text-primary">Deals</h1>
        <Link href="/admin/deals/new">
          <Button className="bg-dc-gold text-dc-bg hover:bg-dc-gold-hover">
            <Plus size={16} className="mr-2" />
            Create Deal
          </Button>
        </Link>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <Select value={filter} onValueChange={(v) => v && setFilter(v)}>
          <SelectTrigger className="w-48 bg-dc-surface border-dc-border text-dc-text-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-dc-surface border-dc-border">
            <SelectItem value="all" className="text-dc-text-primary hover:bg-dc-raised">All</SelectItem>
            <SelectItem value="published" className="text-dc-text-primary hover:bg-dc-raised">Published</SelectItem>
            <SelectItem value="draft" className="text-dc-text-primary hover:bg-dc-raised">Draft</SelectItem>
            <SelectItem value="paused" className="text-dc-text-primary hover:bg-dc-raised">Paused</SelectItem>
            <SelectItem value="closed" className="text-dc-text-primary hover:bg-dc-raised">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-dc-surface border border-dc-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dc-border">
                <th className="text-left text-xs font-medium text-dc-text-muted uppercase px-4 py-3">Title</th>
                <th className="text-left text-xs font-medium text-dc-text-muted uppercase px-4 py-3">Category</th>
                <th className="text-left text-xs font-medium text-dc-text-muted uppercase px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-dc-text-muted uppercase px-4 py-3">City</th>
                <th className="text-left text-xs font-medium text-dc-text-muted uppercase px-4 py-3">Ticket</th>
                <th className="text-left text-xs font-medium text-dc-text-muted uppercase px-4 py-3">Created</th>
                <th className="text-right text-xs font-medium text-dc-text-muted uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-dc-border last:border-0">
                    <td className="px-4 py-3" colSpan={7}>
                      <Skeleton className="h-6 w-full bg-dc-raised" />
                    </td>
                  </tr>
                ))
              ) : deals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-dc-text-muted text-sm">
                    No deals found. Create your first deal to get started.
                  </td>
                </tr>
              ) : (
                deals.map((deal) => {
                  const catConfig = categoryConfigs[deal.category];
                  const sc = statusColors[deal.status];
                  return (
                    <tr key={deal.id} className="border-b border-dc-border last:border-0 hover:bg-dc-raised/50">
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-dc-text-primary">{deal.title}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{ backgroundColor: catConfig.badgeBg, color: catConfig.badgeColor }}
                        >
                          {catConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-medium px-2 py-1 rounded-full capitalize"
                          style={{ backgroundColor: sc.bg, color: sc.text }}
                        >
                          {deal.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-dc-text-secondary">{deal.city || "—"}</td>
                      <td className="px-4 py-3 text-sm text-dc-text-secondary font-mono">
                        {deal.ticket_max ? formatIndianCurrency(deal.ticket_max) : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-dc-text-muted">
                        {new Date(deal.created_at).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/deals/${deal.id}/edit`}>
                            <Button variant="ghost" size="sm" className="text-dc-text-secondary hover:text-dc-text-primary hover:bg-dc-raised h-8 w-8 p-0">
                              <Pencil size={14} />
                            </Button>
                          </Link>
                          <Link href={`/admin/deals/${deal.id}/interests`}>
                            <Button variant="ghost" size="sm" className="text-dc-text-secondary hover:text-dc-text-primary hover:bg-dc-raised h-8 w-8 p-0">
                              <Eye size={14} />
                            </Button>
                          </Link>
                          {(deal.status === "published" || deal.status === "paused") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleStatus(deal)}
                              className="text-dc-text-secondary hover:text-dc-text-primary hover:bg-dc-raised h-8 w-8 p-0"
                            >
                              {deal.status === "published" ? <Pause size={14} /> : <Play size={14} />}
                            </Button>
                          )}
                          {deal.status !== "closed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => closeDeal(deal.id)}
                              className="text-dc-text-secondary hover:text-dc-warning hover:bg-dc-raised h-8 w-8 p-0"
                            >
                              <X size={14} />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(deal.id)}
                            className="text-dc-text-secondary hover:text-dc-error hover:bg-dc-raised h-8 w-8 p-0"
                          >
                            <Trash2 size={14} />
                          </Button>
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

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-dc-surface border-dc-border text-dc-text-primary">
          <DialogHeader>
            <DialogTitle>Delete Deal</DialogTitle>
            <DialogDescription className="text-dc-text-secondary">
              Are you sure you want to delete this deal? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="border-dc-border text-dc-text-secondary">
              Cancel
            </Button>
            <Button onClick={deleteDeal} className="bg-dc-error text-white hover:bg-dc-error/80">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
