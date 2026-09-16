import { NextResponse } from 'next/server';
import { saveVerificationCode } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/mailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, purpose } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    // Generate secure 6-digit numeric verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Persist code in PostgreSQL database
    await saveVerificationCode(email, code, purpose || 'signup');

    // Dispatch email via Nodemailer (real SMTP if env configured, or formatted console + simulated dispatch)
    const emailResult = await sendVerificationEmail({
      to: email,
      name: name || 'Fluffy Friend',
      code,
      purpose: purpose === 'recovery' ? 'Password Recovery' : 'Sanctuary Account Creation',
    });

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${email}. Please check your inbox.`,
      email,
      code, // returned for demo/testing convenience
      simulated: emailResult.simulated,
      expiresInMinutes: 10,
      html: emailResult.html,
    });
  } catch (error: any) {
    console.error('Error in send-verification-code API:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to dispatch verification code.' },
      { status: 500 }
    );
  }
}
