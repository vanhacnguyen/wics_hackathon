"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

const ResourceMap = dynamic(() => import("./ResourceMap"), { ssr: false });

type Resource = {
  name: string;
  categories?: string[];
  city: string;
  address_line1?: string;
  state?: string;
  postal_code?: string;
  languages?: string[];
  phone?: string;
  website?: string;
  cost_notes?: string;
  eligibility?: string;
  lat?: number | string;
  lng?: number | string;
};

type ApiResponse = {
  meta?: any;
  results: Resource[];
  debug?: any;
};

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  function toggleDetails(i: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  const city = searchParams.get("city") || "";
  const category = searchParams.get("category") || ""; // comma list
  const lang = searchParams.get("lang") || ""; // comma list

  const [data, setData] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState<string | null>(null);
    const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locErr, setLocErr] = useState<string | null>(null);

  function toNum(x: number | string | undefined) {
    const n = typeof x === "string" ? Number(x) : x;
    return Number.isFinite(n as number) ? (n as number) : null;
  }

  function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const R = 3958.8; // miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  function requestLocation() {
    setLocErr(null);

    if (!("geolocation" in navigator)) {
      setLocErr("Geolocation is not supported in this browser.");
      return;
    }

    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
      },
      (err) => {
        setLocLoading(false);
        // friendly messages
        if (err.code === err.PERMISSION_DENIED) setLocErr("Location permission denied.");
        else if (err.code === err.TIMEOUT) setLocErr("Location request timed out.");
        else setLocErr("Could not get your location.");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 }
    );
  }

  const apiUrl = useMemo(() => {
    if (!city && !category && !lang) return null;

    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (category) params.set("category", category);
    if (lang) params.set("lang", lang);
    return `/api?${params.toString()}`;
  }, [city, category, lang]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!apiUrl) {
        setLoading(false);
        setErr(null);
        setPreviewText(null);
        setData([]);
        return;
      }

      try {
        setLoading(true);
        setErr(null);
        setPreviewText(null);

        const res = await fetch(apiUrl, { cache: "no-store" });
        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const json: ApiResponse = await res.json();

        if (json?.results?.length === 0 && (json as any)?.upstream_preview) {
          setPreviewText((json as any).upstream_preview);
        }

        if (!cancelled) setData(json.results ?? []);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Failed to load results.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [apiUrl]);

  const displayData = useMemo(() => {
    // If user didn't allow location, keep original behavior
    if (!userPos) return data as any[];

    const withDistance = (data ?? [])
      .map((r) => {
        const lat = toNum(r.lat);
        const lng = toNum(r.lng);
        if (lat === null || lng === null) return { ...r, _distance: null as number | null };

        return {
          ...r,
          _distance: haversineMiles(userPos.lat, userPos.lng, lat, lng),
        };
      })
      // nearest first, missing lat/lng goes last
      .sort((a: any, b: any) => {
        const da = a._distance;
        const db = b._distance;
        if (da == null && db == null) return 0;
        if (da == null) return 1;
        if (db == null) return -1;
        return da - db;
      });

    return withDistance;
  }, [data, userPos]);


  // keep filters when going back
  const backParams = useMemo(() => {
    const p = new URLSearchParams();
    if (city) p.set("city", city);
    if (category) p.set("category", category);
    if (lang) p.set("lang", lang);
    return p.toString();
  }, [city, category, lang]);

  const mapCity = city || "San Jose";

  return (
    <main className="min-h-[calc(100vh-72px)] bg-white">
      {/* HERO IMAGE */}
      <section
        className="relative h-[300px] w-full bg-cover bg-center"
        style={{ backgroundImage: "url(/food.jpg)" }}>
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative mx-auto flex h-full max-w-6xl items-center justify-between px-6">
          <h1 className="text-6xl font-semibold tracking-wide text-white drop-shadow-md">
            Results for {city || "All Cities"}
          </h1>

          {/* Back to Search */}
          <Link
            href={backParams ? `/search?${backParams}` : "/search"}
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-100"
          >
            ← Back to Search
          </Link>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        {/* Header row */}
        <div className="flex items-center justify-between gap-4">
          {/* LEFT SIDE */}
          <div>
            <h2 className="text-2xl font-medium tracking-wide text-slate-900">
              RESULT:
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {loading
                ? "Loading…"
                : err
                ? "Error loading results"
                : `Found ${displayData.length} result${
                    displayData.length === 1 ? "" : "s"
                  }.`}
            </p>
          </div>

          {/* RIGHT SIDE - Use My Location */}
          <div className="flex items-center gap-3">
            <button
              onClick={requestLocation}
              disabled={locLoading}
              className="rounded-full bg-sky-200 px-5 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-sky-300 transition hover:bg-sky-100 disabled:opacity-60"
            >
              {userPos ? "Update Location": locLoading ? "Getting location…": "Use My Location"}
            </button>

            {userPos && (
              <button
                onClick={() => setUserPos(null)}
                className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 h-px w-full bg-slate-300" />

        {/* DEBUG */}
        {!loading && !err && previewText ? (
          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-slate-500">
              Upstream preview (HTML) — click to view
            </summary>
            <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-xs text-slate-700 ring-1 ring-slate-200">
              {previewText.slice(0, 3000)}
            </pre>
          </details>
        ) : null}

        {/* GRID: results + map */}
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1.0fr_1.0fr]">
          {/* LEFT: list */}
          <div>
            {loading ? <p className="text-slate-600">Loading results…</p> : null}
            {err ? <p className="text-red-600">{err}</p> : null}

            {!loading && !err && displayData.length === 0 ? (
              <p className="mt-6 text-slate-600">No results found matching your criteria.</p>
            ) : null}

            {!loading && !err && displayData.length > 0 ? (
              <div className="space-y-8">
                {(displayData as any[]).map((item: any, i) => {
                  const firstCat = item.categories?.[0] ?? "No Category Match";
                  const zip = item.postal_code ?? "—";
                  const isOpen = expanded.has(i);

                  return (
                    <div key={i}>
                      <div className="flex items-start justify-between gap-6">
                        <div>
                          <h3 className="text-xl font-medium text-slate-900">
                            {item.name} <span className="text-slate-500">- {zip}</span>
                          </h3>

                          <div className="mt-4 flex items-center gap-3">
                            <span className="text-slate-700">Category:</span>
                            <span className="inline-flex items-center rounded-sm bg-sky-200 px-4 py-1 text-sm font-medium text-slate-900">
                              {firstCat}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleDetails(i)}
                            className="flex items-center gap-2 rounded-sm bg-lime-200 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-lime-300"
                          >
                            {isOpen ? "Hide Details" : "View Details"}
                            <span className="text-slate-800">{isOpen ? "▴" : "▾"}</span>
                          </button>
                        </div>
                      </div>

                      {/* DETAILS GO RIGHT HERE */}
                      {isOpen && (
                        <div className="mt-6 rounded-xl bg-slate-50 p-5 text-sm text-slate-700 ring-1 ring-slate-200">
                          {item.phone && (
                            <div className="mb-2">
                              <span className="font-semibold">Phone:</span> {item.phone}
                            </div>
                          )}

                          {item.website && (
                            <div className="mb-2">
                              <span className="font-semibold">Website:</span>{" "}
                              <a
                                href={item.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-700 hover:underline"
                              >
                                {item.website}
                              </a>
                            </div>
                          )}

                          {item.cost_notes && (
                            <div className="mb-2">
                              <span className="font-semibold">Cost:</span> {item.cost_notes}
                            </div>
                          )}

                          {item.eligibility && (
                            <div>
                              <span className="font-semibold">Eligibility:</span> {item.eligibility}
                            </div>
                          )}

                          {!item.phone && !item.website && !item.cost_notes && !item.eligibility && (
                            <div className="text-slate-500">No additional details available.</div>
                          )}
                        </div>
                      )}

                      {/* Divider stays LAST */}
                      <div className="mt-8 h-px w-full bg-slate-300" />
                    </div>
                  );

                })}
              </div>
            ) : null}
          </div>

          {/* RIGHT: map (sticky) */}
          <aside className="lg:sticky lg:top-[92px]">
            <div className="h-[420px] overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 lg:h-[calc(100vh-160px)]">
              <ResourceMap city={mapCity} items={displayData as any} userPos={userPos} />
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Tip: click a marker to quickly locate a resource.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
