"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { LogIn, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Get profile to determine redirect
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", data.user.id)
      .single();

    if (!profile) {
      toast.error("Profile not found. Please contact support.");
      setLoading(false);
      return;
    }

    if (profile.status === "pending" || profile.status === "rejected") {
      router.push("/auth/pending");
      return;
    }

    toast.success("Welcome back!");

    switch (profile.role) {
      case "admin":
        router.push("/admin");
        break;
      case "investor":
        router.push("/investor/deals");
        break;
      case "seeker":
        router.push("/seeker/dashboard");
        break;
    }
  }

  return (
    <div className="min-h-screen bg-dc-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display text-dc-text-primary mb-2">
            SMELogin
          </h1>
          <p className="text-dc-text-secondary">
            Sign in to your account
          </p>
        </div>

        <div className="bg-dc-surface border border-dc-border rounded-xl p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-dc-text-secondary text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary placeholder:text-dc-text-muted"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-dc-text-secondary text-sm">
                Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="bg-dc-raised border-dc-border text-dc-text-primary placeholder:text-dc-text-muted pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dc-text-muted hover:text-dc-text-secondary"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-dc-gold text-dc-bg hover:bg-dc-gold-hover font-medium rounded-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-dc-bg border-t-transparent rounded-full" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn size={16} />
                  Sign In
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-dc-text-secondary">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-dc-gold hover:text-dc-gold-hover font-medium"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
