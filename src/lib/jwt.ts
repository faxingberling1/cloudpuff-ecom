import { SignJWT } from 'jose/jwt/sign';
import { jwtVerify } from 'jose/jwt/verify';

export const SESSION_COOKIE_NAME = 'cloudpuff_session';

export interface AuthUserPayload {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  favoriteBuddy?: string;
}

const DEFAULT_SECRET = 'c74fa09d3b2075df194e82e6d9b04873919e1590abecf6d908e2ef8197e68205';

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
  return new TextEncoder().encode(secret);
}

/**
 * Signs a cryptographic JWT with 7-day expiration
 */
export async function signAuthToken(payload: AuthUserPayload): Promise<string> {
  const secret = getJwtSecretKey();

  return await new SignJWT({
    id: payload.id,
    email: payload.email.toLowerCase().trim(),
    name: payload.name,
    role: payload.role,
    favoriteBuddy: payload.favoriteBuddy || 'Matcha Dino',
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(payload.id)
    .setIssuedAt()
    .setIssuer('cloudpuff-sanctuary')
    .setAudience('cloudpuff-users')
    .setExpirationTime('7d')
    .sign(secret);
}

/**
 * Verifies a cryptographic JWT using HMAC-SHA256
 */
export async function verifyAuthToken(token: string): Promise<AuthUserPayload | null> {
  try {
    const secret = getJwtSecretKey();
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'cloudpuff-sanctuary',
      audience: 'cloudpuff-users',
    });

    if (!payload || !payload.id || !payload.email || !payload.role) {
      return null;
    }

    return {
      id: payload.id as string,
      email: (payload.email as string).toLowerCase().trim(),
      name: payload.name as string,
      role: (payload.role === 'admin' ? 'admin' : 'user'),
      favoriteBuddy: (payload.favoriteBuddy as string) || 'Matcha Dino',
    };
  } catch (error) {
    return null;
  }
}
