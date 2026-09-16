import { NextResponse } from 'next/server';
import { verifyAuthToken, AuthUserPayload, SESSION_COOKIE_NAME } from './jwt';

export class AuthError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 401, code = 'UNAUTHORIZED') {
    super(message);
    this.name = 'AuthError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Extracts the session token from cookie or Authorization header
 */
export function extractTokenFromRequest(request: Request): string | null {
  // 1. Check Cookie header
  const cookieHeader = request.headers.get('cookie') || '';
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    const sessionCookie = cookies.find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));
    if (sessionCookie) {
      const val = sessionCookie.split('=')[1];
      if (val) return decodeURIComponent(val);
    }
  }

  // 2. Check Authorization Bearer header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

/**
 * Validates request authentication and returns user payload if valid, or null
 */
export async function getAuthenticatedUser(request: Request): Promise<AuthUserPayload | null> {
  const token = extractTokenFromRequest(request);
  if (!token) return null;
  return await verifyAuthToken(token);
}

/**
 * Enforces authentication and optional role check. Throws AuthError if unauthorized.
 */
export async function requireAuth(
  request: Request,
  requiredRole?: 'user' | 'admin'
): Promise<AuthUserPayload> {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    throw new AuthError('Authentication required. Please sign in to access this resource.', 401, 'UNAUTHENTICATED');
  }

  if (requiredRole === 'admin' && user.role !== 'admin') {
    throw new AuthError('Access denied. Administrator privileges required.', 403, 'FORBIDDEN');
  }

  return user;
}

/**
 * Helper to generate standardized JSON responses for auth errors
 */
export function handleAuthError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: error.status }
    );
  }

  console.error('[API Server Error]', error);
  return NextResponse.json(
    {
      success: false,
      error: 'An internal server error occurred.',
    },
    { status: 500 }
  );
}
