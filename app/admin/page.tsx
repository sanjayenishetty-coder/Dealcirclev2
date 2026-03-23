"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Briefcase, Users, TrendingUp, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface KPIs {
  activeDeals: number;
  approvedInvestors: number;
  interestsToday: number;
  pendingApprovals: number;
}

interface ActivityEvent {
  id: string;
  type: "investor_registered" | "interest_expressed" | "seeker_submitted" | "deal_published";
  message: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // Fetch KPIs in parallel
      const [dealsRes, investorsRes, interestsRes, pendingRes] = await Promise.all([
        supabase.from("deals").select("id", { count: "exact" }).in("status", ["published", "paused"]),
        supabase.from("profiles").select("id", { count: "exact" }).eq("role", "investor").eq("status", "approved"),
        supabase.from("investor_interests").select("id", { count: "exact" }).gte("created_at", new Date().toISOString().split("T")[0]),
        supabase.from("profiles").select("id", { count: "exact" }).eq("status", "pending"),
      ]);

      setKpis({
        activeDeals: dealsRes.count || 0,
        approvedInvestors: investorsRes.count || 0,
        interestsToday: interestsRes.count || 0,
        pendingApprovals: pendingRes.count || 0,
      });

      // Build activity feed from recent events
      const events: ActivityEvent[] = [];

      // Recent investors
      const { data: recentInvestors } = await supabase
        .from("profiles")
        .select("id, full_name, city, created_at")
        .eq("role", "investor")
        .order("created_at", { ascending: false })
        .limit(5);

      recentInvestors?.forEach((inv) => {
        events.push({
          id: `inv-${inv.id}`,
          type: "investor_registered",
          message: `New investor registered — ${inv.full_name}, ${inv.city}`,
          created_at: inv.created_at,
        });
      });

      // Recent interests
      const { data: recentInterests } = await supabase
        .from("investor_interests")
        .select("id, created_at, profiles!investor_id(full_name), deals!deal_id(title)")
        .order("created_at", { ascending: false })
        .limit(5);

      recentInterests?.forEach((int: any) => {
        events.push({
          id: `int-${int.id}`,
          type: "interest_expressed",
          message: `Interest expressed — ${int.profiles?.full_name} on ${int.deals?.title}`,
          created_at: int.created_at,
        });
      });

      // Recent seeker submissions
      const { data: recentSeekers } = await supabase
        .from("profiles")
        .select("id, full_name, city, created_at, seeker_profiles(company_name)")
        .eq("role", "seeker")
        .order("created_at", { ascending: false })
        .limit(5);

      recentSeekers?.forEach((s: any) => {
        events.push({
          id: `seek-${s.id}`,
          type: "seeker_submitted",
          message: `New seeker submission — ${s.seeker_profiles?.company_name || s.full_name}, ${s.city}`,
          created_at: s.created_at,
        });
      });

      // Sort by date, take 10
      events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setActivities(events.slice(0, 10));
      setLoading(false);
    }

    fetchData();
  }, [supabase]);

  const kpiCards = [
    { label: "Active Deals", value: kpis?.activeDeals, icon: Briefcase, color: "text-dc-gold" },
    { label: "Approved Investors", value: kpis?.approvedInvestors, icon: Users, color: "text-dc-startup" },
    { label: "Interests Today", value: kpis?.interestsToday, icon: TrendingUp, color: "text-dc-success" },
    { label: "Pending Approvals", value: kpis?.pendingApprovals, icon: Clock, color: "text-dc-warning" },
  ];

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div>
      <h1 className="text-2xl font-display text-dc-text-primary mb-6">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="bg-dc-surface border border-dc-border rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-dc-text-secondary">{card.label}</span>
              <card.icon size={18} className={card.color} />
            </div>
            {loading ? (
              <Skeleton className="h-8 w-16 bg-dc-raised" />
            ) : (
              <span className="text-2xl font-semibold font-mono text-dc-text-primary">
                {card.value}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Activity Feed */}
      <div className="bg-dc-surface border border-dc-border rounded-xl p-5">
        <h2 className="text-lg font-semibold text-dc-text-primary mb-4">Recent Activity</h2>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full bg-dc-raised" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-dc-text-muted text-sm py-8 text-center">
            No recent activity. Events will appear here as users interact with the platform.
          </p>
        ) : (
          <div className="space-y-1">
            {activities.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-dc-raised transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      event.type === "investor_registered"
                        ? "bg-dc-startup"
                        : event.type === "interest_expressed"
                        ? "bg-dc-success"
                        : event.type === "seeker_submitted"
                        ? "bg-dc-sme"
                        : "bg-dc-gold"
                    }`}
                  />
                  <span className="text-sm text-dc-text-primary">{event.message}</span>
                </div>
                <span className="text-xs text-dc-text-muted whitespace-nowrap ml-4">
                  {timeAgo(event.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
