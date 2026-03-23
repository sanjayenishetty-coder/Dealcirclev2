"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Clock, LogOut, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function PendingPage() {
  const [status, setStatus] = useState<string>("pending");
  const [rejectionNote, setRejectionNote] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("status, rejection_note")
        .eq("id", user.id)
        .single();

      if (profile) {
        setStatus(profile.status);
        setRejectionNote(profile.rejection_note);
        if (profile.status === "approved") {
          router.push("/");
        }
      }
    }
    checkStatus();
  }, [supabase, router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <div className="min-h-screen bg-dc-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-dc-surface border border-dc-border rounded-xl p-8">
          {status === "rejected" ? (
            <>
              <XCircle className="h-16 w-16 text-dc-error mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-dc-text-primary mb-2">
                Application Not Approved
              </h2>
              <p className="text-dc-text-secondary mb-4">
                Unfortunately, your application was not approved at this time.
              </p>
              {rejectionNote && (
                <div className="bg-dc-raised border border-dc-border rounded-lg p-3 mb-4 text-left">
                  <p className="text-sm text-dc-text-secondary font-medium mb-1">Reason:</p>
                  <p className="text-sm text-dc-text-primary">{rejectionNote}</p>
                </div>
              )}
              <p className="text-sm text-dc-text-muted">
                Contact us at deals@smelogin.com for more information.
              </p>
            </>
          ) : (
            <>
              <Clock className="h-16 w-16 text-dc-gold mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-dc-text-primary mb-2">
                Application Under Review
              </h2>
              <p className="text-dc-text-secondary mb-4">
                Your application is under review. Our team will reach out within 24–48 hours.
              </p>
              <p className="text-sm text-dc-text-muted">
                Questions? Reach us at deals@smelogin.com
              </p>
            </>
          )}

          <Button
            onClick={handleLogout}
            variant="outline"
            className="mt-6 border-dc-border text-dc-text-secondary hover:bg-dc-raised"
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
