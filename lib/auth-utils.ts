import { SignJWT, jwtVerify, JWTPayload } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production-must-be-long';
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

// Convert string to Uint8Array for jose
const getJwtSecretKey = () => {
  const secret = JWT_SECRET;
  return new TextEncoder().encode(secret);
};

/**
 * Generate JWT tokens (access and refresh)
 */
export async function generateTokens(payload: UserPayload): Promise<TokenResponse> {
  const jwtPayload: ExtendedJWTPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
  };

  // Generate access token
  const accessToken = await new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('oneflow-api')
    .setAudience('oneflow-client')
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(getJwtSecretKey());

  // Generate refresh token
  const refreshPayload = {
    userId: payload.userId,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
  };

  const refreshToken = await new SignJWT(refreshPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('oneflow-api')
    .setAudience('oneflow-client')
    .setExpirationTime(JWT_REFRESH_EXPIRES_IN)
    .sign(getJwtSecretKey());

  return {
    accessToken,
    refreshToken,
    expiresIn: JWT_EXPIRES_IN,
  };
}

/**
 * Verify JWT token
 */
export async function verifyToken(token: string): Promise<UserPayload> {
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
 * Verify refresh token
 */
export async function verifyRefreshToken(token: string): Promise<{ userId: number; type: string }> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey(), {
      issuer: 'oneflow-api',
      audience: 'oneflow-client',
    });

    const refreshPayload = payload as JWTPayload & { userId: number; type: string };
    
    if (refreshPayload.type !== 'refresh') {
      throw new Error('Invalid refresh token');
    }
    
    return {
      userId: refreshPayload.userId,
      type: refreshPayload.type,
    };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
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
    // Split the token and decode the payload
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = decodeToken(token);
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return true;
  }
  return expiration < new Date();
}
