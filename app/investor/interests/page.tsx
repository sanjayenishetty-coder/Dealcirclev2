"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";
import { categoryConfigs } from "@/lib/dealCategories";
import type { InterestStatus, DealCategory } from "@/types";

interface InterestRow {
  id: string;
  deal_id: string;
  status: InterestStatus;
  created_at: string;
  deals: {
    title: string;
    category: DealCategory;
  };
}

const statusLabels: Record<InterestStatus, string> = {
  new: "Admin Follow-up Pending",
  contacted: "Contacted",
  in_discussion: "In Discussion",
  converted: "Converted",
  dropped: "Closed",
};

const statusStyles: Record<InterestStatus, { bg: string; text: string }> = {
  new: { bg: "rgba(245, 158, 11, 0.2)", text: "#F59E0B" },
  contacted: { bg: "rgba(59, 130, 246, 0.2)", text: "#3B82F6" },
  in_discussion: { bg: "rgba(99, 102, 241, 0.2)", text: "#6366F1" },
  converted: { bg: "rgba(16, 185, 129, 0.2)", text: "#10B981" },
  dropped: { bg: "rgba(239, 68, 68, 0.2)", text: "#EF4444" },
};

export default function InvestorInterestsPage() {
  const [interests, setInterests] = useState<InterestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchInterests() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("investor_interests")
        .select("id, deal_id, status, created_at, deals(title, category)")
        .eq("investor_id", user.id)
        .order("created_at", { ascending: false });

      setInterests((data as unknown as InterestRow[]) || []);
      setLoading(false);
    }
    fetchInterests();
  }, [supabase]);

  return (
    <div>
      <h1 className="text-2xl font-display text-dc-text-primary mb-6">My Interests</h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full bg-dc-raised rounded-xl" />
          ))}
        </div>
      ) : interests.length === 0 ? (
        <div className="bg-dc-surface border border-dc-border rounded-xl p-12 text-center">
          <Heart className="h-12 w-12 text-dc-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-dc-text-primary mb-2">No Interests Yet</h2>
          <p className="text-dc-text-secondary">
            You haven&apos;t expressed interest in any deals yet.
          </p>
        </div>
      ) : (
        <div className="bg-dc-surface border border-dc-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dc-border">
                  <th className="text-left text-xs font-medium text-dc-text-muted uppercase px-4 py-3">Deal</th>
                  <th className="text-left text-xs font-medium text-dc-text-muted uppercase px-4 py-3">Category</th>
                  <th className="text-left text-xs font-medium text-dc-text-muted uppercase px-4 py-3">Date</th>
                  <th className="text-left text-xs font-medium text-dc-text-muted uppercase px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {interests.map((int) => {
                  const catConfig = categoryConfigs[int.deals.category];
                  const ss = statusStyles[int.status];
                  return (
                    <tr key={int.id} className="border-b border-dc-border last:border-0 hover:bg-dc-raised/50">
                      <td className="px-4 py-3 text-sm font-medium text-dc-text-primary">{int.deals.title}</td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{ backgroundColor: catConfig.badgeBg, color: catConfig.badgeColor }}
                        >
                          {catConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-dc-text-muted">
                        {new Date(int.created_at).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{ backgroundColor: ss.bg, color: ss.text }}
                        >
                          {statusLabels[int.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
