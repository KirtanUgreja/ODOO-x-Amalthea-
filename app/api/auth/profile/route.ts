import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth-utils';
import { getUserById } from '@/lib/user-service';

export async function GET(request: NextRequest) {
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
    const decoded = await verifyToken(token);
    
    // Get user from database to ensure they're still active
    const user = await getUserById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 404 }
      );
    }

    // Return user profile
    return NextResponse.json({
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        hourly_rate: user.hourly_rate,
        is_active: user.is_active,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('Profile error:', error);
    
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        { error: 'Invalid or expired access token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
