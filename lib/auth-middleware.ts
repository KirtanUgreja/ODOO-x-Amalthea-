import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth-utils';

/**
 * Authentication middleware for API routes
 * Use this to protect API endpoints that require authentication
 */
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 401 }
      );
    }

    // Verify token
    const user = await verifyToken(token);
    
    // Call the handler with the authenticated user
    return await handler(request, user);
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        { error: 'Invalid or expired access token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

/**
 * Role-based authorization middleware
 * Use this to protect API endpoints that require specific roles
 */
export async function withRole(
  request: NextRequest,
  handler: (request: NextRequest, user: any) => Promise<NextResponse>,
  allowedRoles: string[]
): Promise<NextResponse> {
  return withAuth(request, async (req, user) => {
    // Check if user has required role
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Call the handler with the authorized user
    return await handler(req, user);
  });
}

/**
 * Admin-only middleware
 */
export async function withAdmin(
  request: NextRequest,
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
): Promise<NextResponse> {
  return withRole(request, handler, ['admin']);
}

/**
 * Manager-level middleware (admin + project_manager)
 */
export async function withManager(
  request: NextRequest,
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
): Promise<NextResponse> {
  return withRole(request, handler, ['admin', 'project_manager']);
}

/**
 * Finance access middleware (admin + finance)
 */
export async function withFinance(
  request: NextRequest,
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
): Promise<NextResponse> {
  return withRole(request, handler, ['admin', 'finance']);
}
