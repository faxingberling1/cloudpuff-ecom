import { NextResponse } from 'next/server';
import { registerUserInDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, favoriteBuddy } = body;

    if (!name || !email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Name and valid email are required.' },
        { status: 400 }
      );
    }

    const user = await registerUserInDb({
      name,
      email,
      password,
      favoriteBuddy,
    });

    return NextResponse.json({
      success: true,
      user,
      message: 'Account created and verified successfully!',
    });
  } catch (error: any) {
    console.error('Error in register API:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to register account.' },
      { status: 500 }
    );
  }
}
