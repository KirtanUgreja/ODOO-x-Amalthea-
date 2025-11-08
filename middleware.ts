import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth-utils';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/api/auth/login', '/api/auth/register', '/api/test'];
  
  // Check if the current path is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // API routes that require authentication
  if (pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 401 }
      );
    }

    try {
      await verifyToken(token);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired access token' },
        { status: 401 }
      );
    }
  }

  // Page routes - check for auth cookie/token
  const token = request.cookies.get('auth-token')?.value ||
                request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    // Redirect to login page if not authenticated
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const user = await verifyToken(token);
    
    // Role-based redirection
    if (pathname === '/') {
      // Redirect from root based on role
      switch (user.role) {
        case 'admin':
          return NextResponse.redirect(new URL('/admin', request.url));
        case 'project_manager':
          return NextResponse.redirect(new URL('/manager', request.url));
        case 'finance':
          return NextResponse.redirect(new URL('/finance', request.url));
        case 'team_member':
          return NextResponse.redirect(new URL('/employee', request.url));
        default:
          return NextResponse.redirect(new URL('/employee', request.url));
      }
    }

    // Check if user is accessing the correct role-based page
    const roleBasedRoutes = {
      '/admin': ['admin'],
      '/manager': ['admin', 'project_manager'],
      '/finance': ['admin', 'finance'],
      '/employee': ['admin', 'project_manager', 'team_member', 'finance']
    };

    const allowedRoles = roleBasedRoutes[pathname as keyof typeof roleBasedRoutes];
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate page based on role
      switch (user.role) {
        case 'admin':
          return NextResponse.redirect(new URL('/admin', request.url));
        case 'project_manager':
          return NextResponse.redirect(new URL('/manager', request.url));
        case 'finance':
          return NextResponse.redirect(new URL('/finance', request.url));
        case 'team_member':
          return NextResponse.redirect(new URL('/employee', request.url));
        default:
          return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid token - redirect to login
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth-token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
