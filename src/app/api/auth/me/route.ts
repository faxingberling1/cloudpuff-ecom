import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-guard';

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({
        success: true,
        isLoggedIn: false,
        isAdmin: false,
        user: null,
      });
    }

    return NextResponse.json({
      success: true,
      isLoggedIn: true,
      isAdmin: user.role === 'admin',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        favoriteBuddy: user.favoriteBuddy || 'Matcha Dino',
        avatar: user.role === 'admin' ? '🛡️' : '🧸',
      },
    });
  } catch (error: any) {
    console.error('[Auth Me Error]', error);
    return NextResponse.json({
      success: false,
      isLoggedIn: false,
      isAdmin: false,
      user: null,
    });
  }
}
