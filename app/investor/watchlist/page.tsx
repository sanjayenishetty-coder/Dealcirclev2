"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import DealCard from "@/components/deals/DealCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import type { Deal } from "@/types";

export default function WatchlistPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  async function fetchWatchlist() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: watchlistItems } = await supabase
      .from("watchlist")
      .select("deal_id, deals(*)")
      .eq("investor_id", user.id)
      .order("added_at", { ascending: false });

    const dealList = watchlistItems?.map((w: any) => w.deals).filter(Boolean) || [];
    setDeals(dealList);
    setBookmarks(new Set(dealList.map((d: Deal) => d.id)));
    setLoading(false);
  }

  useEffect(() => {
    fetchWatchlist();
  }, []);

  async function toggleBookmark(dealId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("watchlist").delete().eq("investor_id", user.id).eq("deal_id", dealId);
    setDeals((prev) => prev.filter((d) => d.id !== dealId));
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.delete(dealId);
      return next;
    });
    toast.success("Removed from watchlist");
  }

  return (
    <div>
      <h1 className="text-2xl font-display text-dc-text-primary mb-6">Watchlist</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 bg-dc-raised rounded-xl" />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="bg-dc-surface border border-dc-border rounded-xl p-12 text-center">
          <Bookmark className="h-12 w-12 text-dc-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-dc-text-primary mb-2">No Saved Deals</h2>
          <p className="text-dc-text-secondary">
            Browse deals and bookmark the ones you like.
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
