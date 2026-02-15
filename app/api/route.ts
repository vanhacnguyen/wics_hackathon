import { NextResponse } from "next/server";

const UPSTREAM = "https://uglydog.io/cgi-bin/hack.cgi";

export async function GET(req: Request) {
  const incoming = new URL(req.url);

  const city = incoming.searchParams.get("city") ?? "";

  const category =
    incoming.searchParams.get("category") ??
    incoming.searchParams.get("categories") ??
    "";

  const lang =
    incoming.searchParams.get("language") ??
    incoming.searchParams.get("languages") ??
    incoming.searchParams.get("lang") ??
    "";

  // ✅ No params → return empty JSON (never HTML)
  if (!city && !category && !lang) {
    return NextResponse.json({
      meta: { count: 0, note: "No filters provided. Add ?city=...&category=...&lang=..." },
      results: [],
    });
  }

  const upstream = new URL(UPSTREAM);
  if (city) upstream.searchParams.set("city", city);
  if (category) upstream.searchParams.set("category", category);
  if (lang) upstream.searchParams.set("language", lang);

  try {
    const r = await fetch(upstream.toString(), {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    const ct = r.headers.get("content-type") || "";
    const text = await r.text();

    // ✅ Try parse JSON even if content-type is wrong (common for CGI)
    try {
      const parsed = JSON.parse(text);

      // If upstream returns { meta, results } you're good.
      // If it returns something else, still forward it so you can see it.
      return NextResponse.json(parsed, { status: 200 });
    } catch {
      // Upstream not JSON → return debug but keep status 200 so frontend doesn't hard-fail
      return NextResponse.json({
        meta: {
          count: 0,
          upstream_url: upstream.toString(),
          upstream_status: r.status,
          upstream_content_type: ct,
          note: "Upstream response was not valid JSON. See preview.",
        },
        results: [],
        upstream_preview: text.slice(0, 1200),
      });
    }
  } catch (e: any) {
    // Also return 200 with debug JSON (less annoying in browser)
    return NextResponse.json({
      meta: {
        count: 0,
        upstream_url: upstream.toString(),
        upstream_status: 0,
        upstream_content_type: "none",
        note: "Failed to reach upstream (network issue or blocked).",
      },
      results: [],
      error: String(e?.message || e),
    });
  }
}
