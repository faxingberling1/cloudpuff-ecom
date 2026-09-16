import { NextResponse } from 'next/server';
import { verifyCodeInDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, purpose } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and 6-digit verification code are required.' },
        { status: 400 }
      );
    }

    const isValid = await verifyCodeInDb(email, code, purpose || 'signup');

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code. Please request a new code.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email address verified successfully!',
    });
  } catch (error: any) {
    console.error('Error in verify-code API:', error);
    return NextResponse.json(
      { error: error?.message || 'Verification failed.' },
      { status: 500 }
    );
  }
}
