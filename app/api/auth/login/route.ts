import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/user-service';
import { generateTokens } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await authenticateUser(email, password);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT tokens
    const tokens = await generateTokens(user);

    // Return success response
    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
