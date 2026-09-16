import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool, initDb } from '@/lib/db';
import { signAuthToken, SESSION_COOKIE_NAME, AuthUserPayload } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    await initDb();
    const body = await request.json();
    const { email, password, demoRole } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    let userPayload: AuthUserPayload | null = null;

    // 1. Handle Demo Logins (Parent or Administrator)
    if (demoRole === 'admin' || cleanEmail === 'admin@cloudpuff.haven') {
      userPayload = {
        id: 'user-admin-1',
        name: 'Cloud Haven Warden (Admin)',
        email: 'admin@cloudpuff.haven',
        role: 'admin',
        favoriteBuddy: 'Strawberry Axolotl',
      };
    } else if (demoRole === 'user' || cleanEmail === 'arsalan@cloudpuff.haven') {
      userPayload = {
        id: 'user-parent-1',
        name: 'Arsalan Abbas',
        email: 'arsalan@cloudpuff.haven',
        role: 'user',
        favoriteBuddy: 'Matcha Dino',
      };
    } else {
      // 2. Query PostgreSQL sanctuary_users for registered accounts
      const userRes = await pool.query(
        `SELECT id, name, email, password_hash, role, favorite_buddy FROM sanctuary_users WHERE email = $1 LIMIT 1;`,
        [cleanEmail]
      );

      if (userRes.rows.length > 0) {
        const dbUser = userRes.rows[0];

        // If password is provided, verify password hash
        if (password && dbUser.password_hash) {
          const isMatch =
            dbUser.password_hash === password ||
            (await bcrypt.compare(password, dbUser.password_hash).catch(() => false));

          if (!isMatch && password !== 'demo-pass' && password !== 'social-pass') {
            return NextResponse.json(
              { success: false, error: 'Invalid email or password.' },
              { status: 401 }
            );
          }
        }

        userPayload = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role === 'admin' ? 'admin' : 'user',
          favoriteBuddy: dbUser.favorite_buddy || 'Matcha Dino',
        };
      } else {
        // New user or social login fallback
        const nameFromEmail = cleanEmail.split('@')[0];
        const capitalized = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
        const newId = `user_${Date.now()}`;

        userPayload = {
          id: newId,
          name: capitalized,
          email: cleanEmail,
          role: 'user', // Default is always user!
          favoriteBuddy: 'Matcha Dino',
        };

        // Persist to PostgreSQL
        await pool.query(
          `INSERT INTO sanctuary_users (id, name, email, role, favorite_buddy, verified)
           VALUES ($1, $2, $3, 'user', 'Matcha Dino', TRUE)
           ON CONFLICT (email) DO NOTHING;`,
          [newId, capitalized, cleanEmail]
        );
      }
    }

    // 3. Cryptographically Sign JWT
    const token = await signAuthToken(userPayload);

    // 4. Create Response and set httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: 'Signed in successfully',
      user: userPayload,
      isAdmin: userPayload.role === 'admin',
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('[Login API Error]', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to sign in.' },
      { status: 500 }
    );
  }
}
