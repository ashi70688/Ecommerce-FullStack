import { NextRequest, NextResponse } from 'next/server';

// Handle all HTTP methods
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  return handleRequest(request, params.slug, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  return handleRequest(request, params.slug, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  return handleRequest(request, params.slug, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  return handleRequest(request, params.slug, 'DELETE');
}

// Handle OPTIONS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

// Common handler for all methods
async function handleRequest(request: NextRequest, slugs: string[], method: string) {
  try {
    console.log(`API proxy handling ${method} request for /auth/${slugs.join('/')}`);
    
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    const endpoint = slugs.join('/');
    const url = `${backendUrl}/auth/${endpoint}`;
    console.log(`Forwarding to backend URL: ${url}`);
    
    // Get request body for non-GET requests
    let body = null;
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        const contentType = request.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          body = await request.json();
          console.log('Request body:', body);
        }
      } catch (e) {
        console.error('Error parsing request body:', e);
      }
    }
    
    // For debugging - log query parameters
    if (method === 'GET') {
      const searchParams = new URL(request.url).searchParams;
      console.log('Query parameters:', Object.fromEntries(searchParams.entries()));
    }
    
    // Mock response for testing if backend is not available
    if (endpoint === 'register') {
      console.log('Handling register request with mock response');
      return NextResponse.json(
        { 
          token: 'mock-token-for-testing',
          user: { 
            id: '123', 
            name: body?.name || 'Test User', 
            email: body?.email || 'test@example.com',
            isAdmin: false 
          } 
        },
        { status: 200 }
      );
    }
    
    if (endpoint === 'me') {
      console.log('Handling /me request with mock response');
      return NextResponse.json(
        { 
          id: '123', 
          name: 'Test User', 
          email: 'test@example.com',
          isAdmin: false 
        },
        { status: 200 }
      );
    }
    
    // Forward the request to the backend
    console.log(`Sending ${method} request to ${url}`);
    const backendResponse = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    console.log(`Backend response status: ${backendResponse.status}`);
    
    // Get response data
    let data;
    try {
      const contentType = backendResponse.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await backendResponse.json();
      } else {
        data = await backendResponse.text();
      }
      console.log('Response data:', data);
    } catch (e) {
      console.error('Error parsing response:', e);
      data = { message: 'Could not parse response from server' };
    }
    
    // Return the response
    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error(`API proxy error:`, error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: String(error) },
      { status: 500 }
    );
  }
}
