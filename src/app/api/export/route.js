import { checkRateLimit } from '@/lib/rateLimit';
import { NextResponse } from 'next/server';

export async function GET(request) {
  // Extract client IP address or default fallback
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

  // Apply Rate Limiting (max 10 export requests per minute per IP)
  const rateLimit = checkRateLimit(`export_${ip}`, 10, 60000);

  if (!rateLimit.success) {
    return NextResponse.json(
      { 
        error: 'Too Many Requests', 
        message: 'Rate limit exceeded. Please wait a minute before requesting another data export.',
        retryAfterMs: rateLimit.resetMs 
      },
      { 
        status: 429, 
        headers: { 
          'Retry-After': String(Math.ceil(rateLimit.resetMs / 1000)) 
        } 
      }
    );
  }

  return NextResponse.json({
    status: 'ok',
    message: 'Data export endpoint available. Rate limit headers attached.',
    remainingRequests: rateLimit.remaining,
  });
}
