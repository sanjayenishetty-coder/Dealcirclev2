"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { LayoutDashboard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SeekerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <div className="min-h-screen bg-dc-bg flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-dc-border bg-dc-bg fixed inset-y-0 left-0">
        <div className="p-6">
          <h1 className="text-xl font-display text-dc-text-primary">SMELogin</h1>
          <p className="text-xs text-dc-text-muted mt-1">Seeker Portal</p>
        </div>

        <nav className="flex-1 px-3">
          <Link
            href="/seeker/dashboard"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
              pathname === "/seeker/dashboard"
                ? "bg-dc-raised text-dc-gold"
                : "text-dc-text-secondary hover:text-dc-text-primary hover:bg-dc-surface"
            )}
          >
            {pathname === "/seeker/dashboard" && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-dc-gold rounded-r" />
            )}
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
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
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">{children}</main>
    </div>
  );
}
