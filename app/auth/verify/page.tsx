"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function VerifyPage() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Handle email verification callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_IN") {
          router.push("/auth/pending");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return (
    <div className="min-h-screen bg-dc-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-dc-surface border border-dc-border rounded-xl p-8">
          <CheckCircle className="h-16 w-16 text-dc-success mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-dc-text-primary mb-2">
            Check Your Email
          </h2>
          <p className="text-dc-text-secondary">
            We&apos;ve sent you a verification link. Click the link in your email to verify your account.
          </p>
        </div>
      </div>
    </div>
  );
}
