import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const city = url.searchParams.get("city") ?? "";
  const category = url.searchParams.get("category") ?? "";
  const lang = url.searchParams.get("lang") ?? "";

  // CGI endpoint
  const upstream = new URL("https://uglydog.io/cgi-bin/hack.cgi");
  if (city) upstream.searchParams.set("city", city);
  if (category) upstream.searchParams.set("category", category);
  if (lang) upstream.searchParams.set("lang", lang);

  const res = await fetch(upstream.toString(), { cache: "no-store" });
  const contentType = res.headers.get("content-type") || "";

  // If upstream is already JSON, just pass it through
  if (contentType.includes("application/json")) {
    const data = await res.json();
    return NextResponse.json(data);
  }

  // Otherwise, it’s still in "preview mode" (returns text/html)
  const text = await res.text();

  // Return a consistent JSON shape so frontend can build now
  return NextResponse.json({
    meta: {
      count: 0,
      upstream_content_type: contentType,
      note: "Upstream not returning JSON yet (preview mode). Showing upstream text.",
    },
    results: [],
    debug: { upstream: upstream.toString(), text },
  });
}
