import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/database-connection';

export async function GET() {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      return NextResponse.json({
        message: 'Database connection successful',
        status: 'connected',
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json({
        message: 'Database connection failed',
        status: 'disconnected',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      message: 'Database connection test failed',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
