"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import DealCard from "@/components/deals/DealCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Search, Briefcase } from "lucide-react";
import type { Deal } from "@/types";

export default function InvestorDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("");
  const [sort, setSort] = useState("newest");
  const supabase = createClient();

  const fetchDeals = useCallback(async () => {
    let query = supabase.from("deals").select("*").eq("status", "published");

    if (category !== "all") {
      query = query.eq("category", category);
    }
    if (city.trim()) {
      query = query.ilike("city", `%${city.trim()}%`);
    }

    query = query.order("published_at", { ascending: sort === "oldest" });

    const { data } = await query;
    setDeals(data || []);
    setLoading(false);
  }, [category, city, sort, supabase]);

  const fetchBookmarks = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("watchlist").select("deal_id").eq("investor_id", user.id);
    setBookmarks(new Set(data?.map((w) => w.deal_id) || []));
  }, [supabase]);

  useEffect(() => {
    fetchDeals();
    fetchBookmarks();
  }, [fetchDeals, fetchBookmarks]);

  async function toggleBookmark(dealId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (bookmarks.has(dealId)) {
      await supabase.from("watchlist").delete().eq("investor_id", user.id).eq("deal_id", dealId);
      setBookmarks((prev) => {
        const next = new Set(prev);
        next.delete(dealId);
        return next;
      });
      toast.success("Removed from watchlist");
    } else {
      await supabase.from("watchlist").insert({ investor_id: user.id, deal_id: dealId });
      setBookmarks((prev) => new Set(prev).add(dealId));
      toast.success("Added to watchlist");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-display text-dc-text-primary mb-6">Deal Marketplace</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={category} onValueChange={(v) => v && setCategory(v)}>
          <SelectTrigger className="w-44 bg-dc-surface border-dc-border text-dc-text-primary">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-dc-surface border-dc-border">
            <SelectItem value="all" className="text-dc-text-primary hover:bg-dc-raised">All Categories</SelectItem>
            <SelectItem value="startup" className="text-dc-text-primary hover:bg-dc-raised">Startup Funding</SelectItem>
            <SelectItem value="sme" className="text-dc-text-primary hover:bg-dc-raised">SME Investment</SelectItem>
            <SelectItem value="debt" className="text-dc-text-primary hover:bg-dc-raised">Debt Opportunity</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dc-text-muted" />
          <Input
            placeholder="Filter by city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="pl-8 w-44 bg-dc-surface border-dc-border text-dc-text-primary placeholder:text-dc-text-muted"
          />
        </div>

        <Select value={sort} onValueChange={(v) => v && setSort(v)}>
          <SelectTrigger className="w-36 bg-dc-surface border-dc-border text-dc-text-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-dc-surface border-dc-border">
            <SelectItem value="newest" className="text-dc-text-primary hover:bg-dc-raised">Newest</SelectItem>
            <SelectItem value="oldest" className="text-dc-text-primary hover:bg-dc-raised">Oldest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Deal Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 bg-dc-raised rounded-xl" />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="bg-dc-surface border border-dc-border rounded-xl p-12 text-center">
          <Briefcase className="h-12 w-12 text-dc-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-dc-text-primary mb-2">No Deals Available</h2>
          <p className="text-dc-text-secondary">
            No deals live right now. Check back soon — our team is reviewing new submissions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              isBookmarked={bookmarks.has(deal.id)}
              onToggleBookmark={toggleBookmark}
            />
          ))}
        </div>
      )}
    </div>
  );
}
