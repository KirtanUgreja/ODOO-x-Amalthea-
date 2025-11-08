import * as jwt from 'jsonwebtoken';
import { SignJWT, jwtVerify, JWTPayload } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

// User payload interface
export interface UserPayload {
  userId: number;
  email: string;
  role: 'admin' | 'project_manager' | 'team_member' | 'finance';
  name: string;
}

// Extended JWT payload for jose library
export interface ExtendedJWTPayload extends JWTPayload {
  userId: number;
  email: string;
  role: 'admin' | 'project_manager' | 'team_member' | 'finance';
  name: string;
}

// Token response interface
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

/**
 * Generate JWT tokens (access and refresh)
 */
export function generateTokens(payload: UserPayload): TokenResponse {
  // Generate access token
  const accessToken = jwt.sign(
    payload,
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'oneflow-api',
      audience: 'oneflow-client',
    }
  );

  // Generate refresh token
  const refreshToken = jwt.sign(
    { userId: payload.userId, type: 'refresh' },
    JWT_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'oneflow-api',
      audience: 'oneflow-client',
    }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: JWT_EXPIRES_IN,
  };
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): UserPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'oneflow-api',
      audience: 'oneflow-client',
    }) as jwt.JwtPayload & UserPayload;
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): { userId: number; type: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'oneflow-api',
      audience: 'oneflow-client',
    }) as jwt.JwtPayload & { userId: number; type: string };
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid refresh token');
    }
    
    return {
      userId: decoded.userId,
      type: decoded.type,
    };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Next.js Edge Runtime compatible JWT functions using jose library
 */

// Convert string to Uint8Array for jose
const getJwtSecretKey = () => {
  const secret = JWT_SECRET;
  return new TextEncoder().encode(secret);
};

/**
 * Generate JWT token for Edge Runtime
 */
export async function generateEdgeToken(payload: UserPayload): Promise<string> {
  const jwtPayload: ExtendedJWTPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
  };

  const token = await new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('oneflow-api')
    .setAudience('oneflow-client')
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(getJwtSecretKey());

  return token;
}

/**
 * Verify JWT token in Edge Runtime
 */
export async function verifyEdgeToken(token: string): Promise<UserPayload> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey(), {
      issuer: 'oneflow-api',
      audience: 'oneflow-client',
    });

    const extendedPayload = payload as ExtendedJWTPayload;
    
    return {
      userId: extendedPayload.userId,
      email: extendedPayload.email,
      role: extendedPayload.role,
      name: extendedPayload.name,
    };
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove "Bearer " prefix
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): any {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}
