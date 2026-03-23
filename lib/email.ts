import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'SMELogin <onboarding@resend.dev>';
const ADMIN_EMAIL = 'admin@smelogin.com';

// ─── Email Templates ────────────────────────────────────────────────

function baseTemplate(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background-color: #0A0F1E; font-family: 'Inter', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background-color: #111827; border-radius: 12px; overflow: hidden; border: 1px solid #1E2D45; }
    .header { background-color: #0A0F1E; padding: 32px 40px; text-align: center; border-bottom: 1px solid #1E2D45; }
    .header h1 { color: #C8992A; font-size: 24px; margin: 0; font-weight: 700; letter-spacing: -0.5px; }
    .body { padding: 40px; color: #F1F5F9; }
    .body h2 { color: #F1F5F9; font-size: 20px; margin: 0 0 16px 0; }
    .body p { color: #94A3B8; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
    .badge-gold { background-color: rgba(200, 153, 42, 0.2); color: #C8992A; }
    .badge-green { background-color: rgba(16, 185, 129, 0.2); color: #10B981; }
    .badge-blue { background-color: rgba(59, 130, 246, 0.2); color: #3B82F6; }
    .info-card { background-color: #1A2235; border: 1px solid #1E2D45; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1E2D45; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #94A3B8; font-size: 13px; }
    .info-value { color: #F1F5F9; font-size: 13px; font-weight: 600; }
    .cta-btn { display: inline-block; background-color: #C8992A; color: #0A0F1E; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 8px; }
    .footer { padding: 24px 40px; text-align: center; border-top: 1px solid #1E2D45; }
    .footer p { color: #4B5563; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div style="padding: 20px; background-color: #0A0F1E;">
    <div class="container">
      <div class="header">
        <h1>SMELogin</h1>
      </div>
      ${content}
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} SMELogin. All rights reserved.</p>
        <p style="margin-top: 8px;">Questions? Reach us at deals@smelogin.com</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ─── Send Functions ─────────────────────────────────────────────────

export async function sendSeekerApprovedEmail(to: string, name: string) {
  const html = baseTemplate(`
    <div class="body">
      <h2>Welcome aboard, ${name}! 🎉</h2>
      <p>Great news — your seeker profile on SMELogin has been <span class="badge badge-green">Approved</span>.</p>
      <p>You can now log in to your dashboard and submit your deal for review.</p>
      <div class="info-card">
        <p style="color: #F1F5F9; margin: 0;">Next steps:</p>
        <p style="margin-top: 8px;">1. Log in to your dashboard<br>2. Click "Submit Your Deal"<br>3. Complete the 4-step intake wizard<br>4. Our team will review and publish your deal</p>
      </div>
      <a href="${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'https://smelogin.com' : 'http://localhost:3000'}/seeker/dashboard" class="cta-btn">Go to Dashboard →</a>
    </div>
  `);

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Your SMELogin Profile is Approved ✓',
    html,
  });
}

export async function sendSeekerRejectedEmail(to: string, name: string, reason: string) {
  const html = baseTemplate(`
    <div class="body">
      <h2>Profile Update</h2>
      <p>Hi ${name}, we've reviewed your seeker application on SMELogin.</p>
      <p>Unfortunately, we're unable to approve your profile at this time.</p>
      <div class="info-card">
        <p style="color: #94A3B8; margin: 0; font-size: 13px;">Reason:</p>
        <p style="color: #F1F5F9; margin: 8px 0 0 0;">${reason}</p>
      </div>
      <p>If you believe this was an error or have additional information, please reach out to us at deals@smelogin.com.</p>
    </div>
  `);

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'SMELogin — Profile Review Update',
    html,
  });
}

export async function sendInvestorApprovedEmail(to: string, name: string) {
  const html = baseTemplate(`
    <div class="body">
      <h2>Welcome to SMELogin, ${name}! 🎉</h2>
      <p>Your investor profile has been <span class="badge badge-green">Approved</span>.</p>
      <p>You now have full access to our curated deal marketplace featuring startup funding, SME investments, and debt opportunities.</p>
      <div class="info-card">
        <p style="color: #F1F5F9; margin: 0;">What you can do now:</p>
        <p style="margin-top: 8px;">• Browse curated deals across 3 categories<br>• Express interest on deals that match your profile<br>• Save deals to your watchlist<br>• Our team will connect you with deal seekers</p>
      </div>
      <a href="${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'https://smelogin.com' : 'http://localhost:3000'}/investor/deals" class="cta-btn">Browse Deals →</a>
    </div>
  `);

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Welcome to SMELogin — Start Browsing Deals',
    html,
  });
}

export async function sendInvestorRejectedEmail(to: string, name: string, reason: string) {
  const html = baseTemplate(`
    <div class="body">
      <h2>Profile Update</h2>
      <p>Hi ${name}, we've reviewed your investor application on SMELogin.</p>
      <p>Unfortunately, we're unable to approve your profile at this time.</p>
      <div class="info-card">
        <p style="color: #94A3B8; margin: 0; font-size: 13px;">Reason:</p>
        <p style="color: #F1F5F9; margin: 8px 0 0 0;">${reason}</p>
      </div>
      <p>If you have questions, reach out to us at deals@smelogin.com.</p>
    </div>
  `);

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'SMELogin — Profile Review Update',
    html,
  });
}

export async function sendInterestNotificationToAdmin(
  investorName: string,
  investorType: string,
  investorCity: string,
  dealTitle: string,
  dealCategory: string
) {
  const html = baseTemplate(`
    <div class="body">
      <h2>New Interest Expressed 🔔</h2>
      <p>An investor has expressed interest on a deal.</p>
      <div class="info-card">
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #1E2D45;">
            <td style="padding: 10px 0; color: #94A3B8; font-size: 13px;">Investor</td>
            <td style="padding: 10px 0; color: #F1F5F9; font-size: 13px; font-weight: 600; text-align: right;">${investorName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1E2D45;">
            <td style="padding: 10px 0; color: #94A3B8; font-size: 13px;">Type</td>
            <td style="padding: 10px 0; color: #F1F5F9; font-size: 13px; text-align: right;">${investorType}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1E2D45;">
            <td style="padding: 10px 0; color: #94A3B8; font-size: 13px;">City</td>
            <td style="padding: 10px 0; color: #F1F5F9; font-size: 13px; text-align: right;">${investorCity}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1E2D45;">
            <td style="padding: 10px 0; color: #94A3B8; font-size: 13px;">Deal</td>
            <td style="padding: 10px 0; color: #F1F5F9; font-size: 13px; font-weight: 600; text-align: right;">${dealTitle}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #94A3B8; font-size: 13px;">Category</td>
            <td style="padding: 10px 0; text-align: right;"><span class="badge badge-gold">${dealCategory}</span></td>
          </tr>
        </table>
      </div>
      <a href="${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'https://smelogin.com' : 'http://localhost:3000'}/admin" class="cta-btn">View in Admin Panel →</a>
    </div>
  `);

  return resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Interest — ${investorName} on ${dealTitle}`,
    html,
  });
}

export async function sendDealPublishedToInvestors(
  investors: { email: string; name: string }[],
  dealTitle: string,
  dealCategory: string,
  dealCity: string,
  dealId: string
) {
  const categoryColors: Record<string, string> = {
    startup: '#3B82F6',
    sme: '#6366F1',
    debt: '#F59E0B',
  };
  const color = categoryColors[dealCategory] || '#C8992A';
  const categoryLabels: Record<string, string> = {
    startup: 'Startup Funding',
    sme: 'SME Investment',
    debt: 'Debt Opportunity',
  };
  const label = categoryLabels[dealCategory] || dealCategory;

  const html = baseTemplate(`
    <div class="body">
      <h2>New Deal Alert 🚀</h2>
      <p>A new deal matching your interests is now live on SMELogin.</p>
      <div class="info-card">
        <div style="margin-bottom: 12px;">
          <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; background-color: ${color}33; color: ${color};">${label}</span>
        </div>
        <p style="color: #F1F5F9; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">${dealTitle}</p>
        <p style="color: #94A3B8; font-size: 13px; margin: 0;">📍 ${dealCity}</p>
      </div>
      <a href="${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'https://smelogin.com' : 'http://localhost:3000'}/investor/deals/${dealId}" class="cta-btn">View Deal →</a>
    </div>
  `);

  const results = await Promise.allSettled(
    investors.map((investor) =>
      resend.emails.send({
        from: FROM_EMAIL,
        to: investor.email,
        subject: `New ${label} — ${dealTitle}`,
        html,
      })
    )
  );

  return results;
}

export async function sendNewSeekerSubmissionToAdmin(
  seekerName: string,
  companyName: string,
  category: string,
  city: string
) {
  const categoryLabels: Record<string, string> = {
    startup: 'Startup Funding',
    sme: 'SME Investment',
    debt: 'Debt Opportunity',
  };
  const label = categoryLabels[category] || category;

  const html = baseTemplate(`
    <div class="body">
      <h2>New Seeker Submission 📋</h2>
      <p>A new deal submission has been received and needs your review.</p>
      <div class="info-card">
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #1E2D45;">
            <td style="padding: 10px 0; color: #94A3B8; font-size: 13px;">Seeker</td>
            <td style="padding: 10px 0; color: #F1F5F9; font-size: 13px; font-weight: 600; text-align: right;">${seekerName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1E2D45;">
            <td style="padding: 10px 0; color: #94A3B8; font-size: 13px;">Company</td>
            <td style="padding: 10px 0; color: #F1F5F9; font-size: 13px; text-align: right;">${companyName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1E2D45;">
            <td style="padding: 10px 0; color: #94A3B8; font-size: 13px;">Category</td>
            <td style="padding: 10px 0; text-align: right;"><span class="badge badge-gold">${label}</span></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #94A3B8; font-size: 13px;">City</td>
            <td style="padding: 10px 0; color: #F1F5F9; font-size: 13px; text-align: right;">${city}</td>
          </tr>
        </table>
      </div>
      <a href="${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'https://smelogin.com' : 'http://localhost:3000'}/admin/seekers" class="cta-btn">Review Submission →</a>
    </div>
  `);

  return resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Deal Submission — ${companyName} (${label})`,
    html,
  });
}

export async function sendWelcomeEmail(to: string, name: string, role: 'seeker' | 'investor') {
  const html = baseTemplate(`
    <div class="body">
      <h2>Thanks for registering, ${name}!</h2>
      <p>We've received your ${role === 'seeker' ? 'deal seeker' : 'investor'} application on SMELogin.</p>
      <div class="info-card">
        <p style="color: #F1F5F9; margin: 0;">⏳ What happens next?</p>
        <p style="margin-top: 8px;">Our team will review your profile within 24–48 hours. You'll receive an email once your profile is approved.</p>
      </div>
      <p>In the meantime, if you have questions, reach out to us at deals@smelogin.com.</p>
    </div>
  `);

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'SMELogin — Registration Received',
    html,
  });
}
