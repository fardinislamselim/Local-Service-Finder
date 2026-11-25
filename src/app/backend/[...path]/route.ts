import { NextResponse, type NextRequest } from "next/server";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://local-service-finder-system.onrender.com/api/v1"
).replace(/\/+$/, "");

// Headers that must not be forwarded verbatim to the backend.
const SKIPPED_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "accept-encoding",
  "origin",
  "referer",
]);

// Headers that must not be copied back to the browser (the body is already decoded).
const SKIPPED_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
]);

async function forward(request: NextRequest, path: string[]) {
  // Preserve the trailing slash: Django endpoints rely on it (APPEND_SLASH redirects otherwise).
  const targetPath = path.join("/");
  const hasTrailingSlash = request.nextUrl.pathname.endsWith("/");
  const search = request.nextUrl.search;
  const targetUrl = `${API_URL}/${targetPath}${hasTrailingSlash ? "/" : ""}${search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!SKIPPED_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const method = request.method.toUpperCase();
  const body =
    method === "GET" || method === "HEAD" ? undefined : Buffer.from(await request.arrayBuffer());

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, {
      method,
      headers,
      body,
      redirect: "manual",
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { detail: "Unable to reach the service API. Please try again." },
      { status: 502 }
    );
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!SKIPPED_RESPONSE_HEADERS.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  return forward(request, (await params).path);
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  return forward(request, (await params).path);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  return forward(request, (await params).path);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  return forward(request, (await params).path);
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  return forward(request, (await params).path);
}

export async function OPTIONS(request: NextRequest, { params }: RouteContext) {
  return forward(request, (await params).path);
}
