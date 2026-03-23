import { NextRequest, NextResponse } from 'next/server';
import {
  sendSeekerApprovedEmail,
  sendSeekerRejectedEmail,
  sendInvestorApprovedEmail,
  sendInvestorRejectedEmail,
  sendInterestNotificationToAdmin,
  sendDealPublishedToInvestors,
  sendNewSeekerSubmissionToAdmin,
  sendWelcomeEmail,
} from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    let result;

    switch (type) {
      case 'seeker_approved':
        result = await sendSeekerApprovedEmail(data.email, data.name);
        break;

      case 'seeker_rejected':
        result = await sendSeekerRejectedEmail(data.email, data.name, data.reason);
        break;

      case 'investor_approved':
        result = await sendInvestorApprovedEmail(data.email, data.name);
        break;

      case 'investor_rejected':
        result = await sendInvestorRejectedEmail(data.email, data.name, data.reason);
        break;

      case 'interest_expressed':
        result = await sendInterestNotificationToAdmin(
          data.investorName,
          data.investorType,
          data.investorCity,
          data.dealTitle,
          data.dealCategory
        );
        break;

      case 'deal_published':
        result = await sendDealPublishedToInvestors(
          data.investors,
          data.dealTitle,
          data.dealCategory,
          data.dealCity,
          data.dealId
        );
        break;

      case 'seeker_submission':
        result = await sendNewSeekerSubmissionToAdmin(
          data.seekerName,
          data.companyName,
          data.category,
          data.city
        );
        break;

      case 'welcome':
        result = await sendWelcomeEmail(data.email, data.name, data.role);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error('Email send error:', error);
    const message = error instanceof Error ? error.message : 'Failed to send email';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
