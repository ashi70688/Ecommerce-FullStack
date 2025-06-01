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
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    const endpoint = slugs.join('/');
    const url = `${backendUrl}/products/${endpoint}`;
    
    // Get request body for non-GET requests
    let body = null;
    if (method !== 'GET' && method !== 'HEAD') {
      const contentType = request.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        body = await request.json().catch(() => null);
      }
    }
    
    // Get query parameters for GET requests
    const searchParams = new URL(request.url).searchParams;
    let finalUrl = url;
    if (method === 'GET' && searchParams.toString()) {
      finalUrl = `${url}?${searchParams.toString()}`;
    }
    
    // Forward the request to the backend
    const backendResponse = await fetch(finalUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    // Get response data
    let data;
    const contentType = backendResponse.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await backendResponse.json().catch(() => null);
    } else {
      data = await backendResponse.text().catch(() => null);
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
