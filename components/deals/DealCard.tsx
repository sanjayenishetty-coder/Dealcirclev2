"use client";

import Link from "next/link";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { categoryConfigs, formatIndianCurrency } from "@/lib/dealCategories";
import type { Deal } from "@/types";

interface DealCardProps {
  deal: Deal;
  isBookmarked?: boolean;
  onToggleBookmark?: (dealId: string) => void;
}

export default function DealCard({ deal, isBookmarked, onToggleBookmark }: DealCardProps) {
  const config = categoryConfigs[deal.category];
  const fields = deal.fields as Record<string, any>;

  function getKeyMetric(): string {
    if (deal.category === "startup" || deal.category === "sme") {
      return fields.ask_amount ? formatIndianCurrency(fields.ask_amount) : "—";
    }
    if (deal.category === "debt") {
      return fields.indicative_yield ? `${fields.indicative_yield}% yield` : "—";
    }
    return "—";
  }

  return (
    <div className="bg-dc-surface border border-dc-border rounded-xl p-5 hover:border-dc-gold/30 transition-colors group relative">
      {/* Bookmark */}
      {onToggleBookmark && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleBookmark(deal.id);
          }}
          className="absolute top-4 right-4 text-dc-text-muted hover:text-dc-gold transition-colors"
        >
          {isBookmarked ? (
            <BookmarkCheck size={18} className="text-dc-gold" />
          ) : (
            <Bookmark size={18} />
          )}
        </button>
      )}

      {/* Category Badge */}
      <span
        className="text-xs font-medium px-2 py-1 rounded-full inline-block mb-3"
        style={{ backgroundColor: config.badgeBg, color: config.badgeColor }}
      >
        {config.label}
      </span>

      {/* Title */}
      <h3 className="text-base font-semibold text-dc-text-primary mb-2 pr-8 line-clamp-2">
        {deal.title}
      </h3>

      {/* Key metric */}
      <p className="text-lg font-mono font-semibold text-dc-gold mb-3">
        {getKeyMetric()}
      </p>

      {/* City */}
      {deal.city && (
        <p className="text-sm text-dc-text-secondary mb-4">{deal.city}</p>
      )}

      {/* View Deal button */}
      <Link href={`/investor/deals/${deal.id}`}>
        <button className="w-full border border-dc-gold text-dc-gold rounded-lg py-2 text-sm font-medium hover:bg-dc-gold/10 transition-colors">
          View Deal
        </button>
      </Link>
    </div>
  );
}
