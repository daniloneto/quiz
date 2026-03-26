import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle CORS
  const response = NextResponse.next();

  // Allow requests from your frontend
  const allowedOrigins = [
    'http://localhost:5174', // Vite dev server
    'http://localhost:3000', // Next.js dev server
    'http://127.0.0.1:5174',
    'http://127.0.0.1:3000',
  ];

  const origin = request.headers.get('origin');
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET,DELETE,PATCH,POST,PUT,OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-api-key'
  );
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const corsHeaders = new Headers();
    
    if (origin && allowedOrigins.includes(origin)) {
      corsHeaders.set('Access-Control-Allow-Origin', origin);
    }
    
    corsHeaders.set('Access-Control-Allow-Credentials', 'true');
    corsHeaders.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS');
    corsHeaders.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-api-key');
    
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
