"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Briefcase, Bookmark, Heart, User, LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Deals", href: "/investor/deals", icon: Briefcase },
  { label: "Watchlist", href: "/investor/watchlist", icon: Bookmark },
  { label: "Interests", href: "/investor/interests", icon: Heart },
  { label: "Profile", href: "/investor/profile", icon: User },
];

export default function InvestorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/investor/deals") return pathname.startsWith("/investor/deals");
    return pathname === href;
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  const sidebar = (
    <div className="flex flex-col h-full bg-dc-bg border-r border-dc-border w-64">
      <div className="p-6">
        <h1 className="text-xl font-display text-dc-text-primary">SMELogin</h1>
        <p className="text-xs text-dc-text-muted mt-1">Investor Portal</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
                active
                  ? "bg-dc-raised text-dc-gold"
                  : "text-dc-text-secondary hover:text-dc-text-primary hover:bg-dc-surface"
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-dc-gold rounded-r" />
              )}
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-dc-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-dc-text-secondary hover:text-dc-error hover:bg-dc-surface w-full transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dc-bg flex">
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30">{sidebar}</aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50 h-full">{sidebar}</aside>
        </div>
      )}

      <main className="flex-1 lg:ml-64">
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-dc-border">
          <button onClick={() => setSidebarOpen(true)} className="text-dc-text-primary">
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-display text-dc-text-primary">SMELogin</h1>
          <div className="w-6" />
        </div>
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
