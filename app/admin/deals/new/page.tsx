"use client";

import DealEditor from "@/components/deals/DealEditor";

export default function NewDealPage() {
  return (
    <div>
      <h1 className="text-2xl font-display text-dc-text-primary mb-6">Create Deal</h1>
      <DealEditor />
    </div>
  );
}
