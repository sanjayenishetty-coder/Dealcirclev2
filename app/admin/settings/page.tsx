"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [contactEmail, setContactEmail] = useState("deals@dealcircle.in");
  const [whatsappNumber, setWhatsappNumber] = useState("+919999999999");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    // In V1, settings are stored locally. In V2, these would go to a settings table.
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings saved");
    }, 500);
  }

  return (
    <div>
      <h1 className="text-2xl font-display text-dc-text-primary mb-6">Settings</h1>

      <div className="max-w-lg space-y-6">
        <div className="bg-dc-surface border border-dc-border rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-semibold text-dc-text-primary">Contact Information</h2>
          <p className="text-sm text-dc-text-secondary">Shown to investors on deal pages and contact cards.</p>

          <div>
            <Label className="text-dc-text-secondary text-sm">Platform Email</Label>
            <Input
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary"
            />
          </div>

          <div>
            <Label className="text-dc-text-secondary text-sm">WhatsApp Number</Label>
            <Input
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="mt-1 bg-dc-raised border-dc-border text-dc-text-primary"
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="bg-dc-gold text-dc-bg hover:bg-dc-gold-hover">
            <Save size={16} className="mr-2" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>

        <div className="bg-dc-surface border border-dc-border rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-semibold text-dc-text-primary">Deal Categories</h2>
          <p className="text-sm text-dc-text-secondary">V1 supports 3 categories. Additional categories can be enabled in V2.</p>

          <div className="space-y-2">
            {[
              { label: "Startup Funding", color: "#3B82F6", enabled: true },
              { label: "SME Investment", color: "#6366F1", enabled: true },
              { label: "Debt Opportunity", color: "#F59E0B", enabled: true },
            ].map((cat) => (
              <div key={cat.label} className="flex items-center justify-between py-2 px-3 bg-dc-raised rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-sm text-dc-text-primary">{cat.label}</span>
                </div>
                <span className="text-xs text-dc-success">Active</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
