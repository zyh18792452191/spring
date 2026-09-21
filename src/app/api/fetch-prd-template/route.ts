import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    let textContent = '';

    if (contentType.includes('text') || contentType.includes('json') || contentType.includes('xml')) {
      textContent = await response.text();
    } else {
      textContent = `[Binary content: ${contentType}]`;
    }

    return NextResponse.json({
      title: url.split('/').pop() || 'Unknown',
      content: textContent,
      url: url,
      filetype: contentType,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
