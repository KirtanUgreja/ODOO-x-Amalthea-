import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateTokens } from '@/lib/auth-utils';
import { getUserById } from '@/lib/user-service';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Verify refresh token
    const decoded = await verifyRefreshToken(refreshToken);
    
    // Get user from database
    const user = await getUserById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate new tokens
    const userPayload = {
      userId: user.user_id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const tokens = await generateTokens(userPayload);

    return NextResponse.json({
      message: 'Tokens refreshed successfully',
      tokens,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
