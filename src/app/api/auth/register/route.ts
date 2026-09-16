import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { registerUserInDb } from '@/lib/db';
import { signAuthToken, SESSION_COOKIE_NAME } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, favoriteBuddy } = body;

    if (!name || !email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Name and valid email are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const passwordHash = password ? await bcrypt.hash(password, 10) : 'verified_hash';

    // Register user with strict role = 'user'
    const user = await registerUserInDb({
      name: name.trim(),
      email: cleanEmail,
      password: passwordHash,
      favoriteBuddy: favoriteBuddy || 'Matcha Dino',
    });

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'user' as const,
      favoriteBuddy: user.favorite_buddy || 'Matcha Dino',
    };

    // Sign JWT
    const token = await signAuthToken(userPayload);

    const response = NextResponse.json({
      success: true,
      user: userPayload,
      message: 'Account created and verified successfully!',
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Error in register API:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to register account.' },
      { status: 500 }
    );
  }
}
