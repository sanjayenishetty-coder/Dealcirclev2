// Client-side helper to trigger email notifications via API route

export async function triggerEmail(payload: EmailPayload) {
  try {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Email trigger failed:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Email trigger error:', error);
    return { success: false, error };
  }
}

// ─── Payload Types ──────────────────────────────────────────────────

type EmailPayload =
  | { type: 'seeker_approved'; email: string; name: string }
  | { type: 'seeker_rejected'; email: string; name: string; reason: string }
  | { type: 'investor_approved'; email: string; name: string }
  | { type: 'investor_rejected'; email: string; name: string; reason: string }
  | {
      type: 'interest_expressed';
      investorName: string;
      investorType: string;
      investorCity: string;
      dealTitle: string;
      dealCategory: string;
    }
  | {
      type: 'deal_published';
      investors: { email: string; name: string }[];
      dealTitle: string;
      dealCategory: string;
      dealCity: string;
      dealId: string;
    }
  | {
      type: 'seeker_submission';
      seekerName: string;
      companyName: string;
      category: string;
      city: string;
    }
  | { type: 'welcome'; email: string; name: string; role: 'seeker' | 'investor' };
