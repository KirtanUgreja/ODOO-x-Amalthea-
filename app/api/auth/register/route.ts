import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/user-service';
import { validatePasswordStrength } from '@/lib/password-utils';
import { generateTokens } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, hourly_rate } = await request.json();

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          error: 'Password does not meet requirements',
          details: passwordValidation.errors
        },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['admin', 'project_manager', 'team_member', 'finance'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Validate hourly_rate
    const rate = parseFloat(hourly_rate) || 0;
    if (rate < 0) {
      return NextResponse.json(
        { error: 'Hourly rate must be a positive number' },
        { status: 400 }
      );
    }

    // Create user
    const newUser = await createUser({
      name,
      email,
      password,
      role,
      hourly_rate: rate,
    });

    // Generate JWT tokens for auto-login
    const userPayload = {
      userId: newUser.user_id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    };

    const tokens = await generateTokens(userPayload);

    // Return success response (exclude password_hash)
    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: newUser.user_id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        hourly_rate: newUser.hourly_rate,
        created_at: newUser.created_at,
      },
      tokens,
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
