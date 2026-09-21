import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { url } = await request.json();
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ error: `Fetch failed: ${response.status}` }, { status: response.status });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    return NextResponse.json({
      title: url.split('/').pop() || 'Unknown',
      content: buffer.toString('base64'),
      filetype: contentType,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
