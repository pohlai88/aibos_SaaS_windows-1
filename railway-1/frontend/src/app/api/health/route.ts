import { NextRequest, NextResponse } from 'next/server';
import { checkConnection } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    // Check backend connection
    const connectionStatus = await checkConnection();

    // Get environment info
    const envInfo = {
      nodeEnv: process.env.NODE_ENV || 'development',
      nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL,
      nextPublicDebug: process.env.NEXT_PUBLIC_DEBUG,
      nextPublicInstanceId: process.env.NEXT_PUBLIC_INSTANCE_ID,
      timestamp: new Date().toISOString()
    };

    // Health check response
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: envInfo.nodeEnv,
      backend: {
        connected: connectionStatus.connected,
        status: connectionStatus.status,
        error: connectionStatus.error
      },
      frontend: {
        version: process.env.AI_BOS_VERSION || '1.0.0',
        instanceId: envInfo.nextPublicInstanceId,
        debug: envInfo.nextPublicDebug === 'true'
      },
      checks: {
        backend: connectionStatus.connected ? 'pass' : 'fail',
        environment: 'pass',
        timestamp: 'pass'
      }
    };

    // Return appropriate status code
    const statusCode = connectionStatus.connected ? 200 : 503;

    return NextResponse.json(healthStatus, { status: statusCode });
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
