"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useParams } from "next/navigation";
import DealEditor from "@/components/deals/DealEditor";
import { Skeleton } from "@/components/ui/skeleton";
import type { Deal } from "@/types";

export default function EditDealPage() {
  const params = useParams();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [seekerName, setSeekerName] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchDeal() {
      const { data } = await supabase
        .from("deals")
        .select("*")
        .eq("id", params.id)
        .single();

      if (data) {
        setDeal(data);
        // Check if created by a seeker
        if (data.created_by) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, seeker_profiles(company_name)")
            .eq("id", data.created_by)
            .single();
          if (profile) {
            setSeekerName((profile as any).seeker_profiles?.company_name || profile.full_name);
          }
        }
      }
      setLoading(false);
    }
    fetchDeal();
  }, [params.id, supabase]);

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

  return (
    <div>
      <h1 className="text-2xl font-display text-dc-text-primary mb-6">Edit Deal</h1>
      <DealEditor deal={deal} seekerName={seekerName} />
    </div>
  );
}
