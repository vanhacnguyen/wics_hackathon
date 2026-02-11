// app/api/search/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type ResourceRow = {
  id: string;
  name: string;
  categories: string | null; // for MVP we stored categories as text
  languages: string | null;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  phone: string | null;
  website: string | null;
  cost_notes: string | null;
  eligibility: string | null;
  lat: number | null;
  lng: number | null;
};

function toNumber(v: string | null): number | null {
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// Haversine distance in KM
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

// Rough bounding-box (km -> degrees)
function boundingBox(lat: number, lng: number, radiusKm: number) {
  const latDelta = radiusKm / 111.0; // ~111 km per 1 deg latitude
  const lngDelta = radiusKm / (111.0 * Math.cos((lat * Math.PI) / 180));
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = toNumber(url.searchParams.get("lat"));
  const lng = toNumber(url.searchParams.get("lng"));
  const category = (url.searchParams.get("category") || "").trim().toLowerCase();
  const radiusKm = toNumber(url.searchParams.get("radius_km")) ?? 5;
  const limit = toNumber(url.searchParams.get("limit")) ?? 50;

  if (lat === null || lng === null) {
    return NextResponse.json(
      { error: "Missing or invalid lat/lng. Example: /api/search?lat=37.33&lng=-121.88&category=food&radius_km=5" },
      { status: 400 }
    );
  }
  if (radiusKm <= 0 || radiusKm > 50) {
    return NextResponse.json({ error: "radius_km must be between 0 and 50" }, { status: 400 });
  }

  const box = boundingBox(lat, lng, radiusKm);

  // Pull candidates in bounding box
  let query = supabaseAdmin
    .from("resources")
    .select(
      "id,name,categories,languages,address_line1,city,state,postal_code,phone,website,cost_notes,eligibility,lat,lng"
    )
    .gte("lat", box.minLat)
    .lte("lat", box.maxLat)
    .gte("lng", box.minLng)
    .lte("lng", box.maxLng)
    .limit(limit);

  // Category filter (MVP: categories is a text column containing "food" or "health")
  // If you later store "food,health" in one field, switch to ilike() below.
  if (category) {
    // exact match or single-category storage
    query = query.ilike("categories", `%${category}%`);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data || []) as ResourceRow[];

  // Filter by true radius using Haversine
  const results = rows
    .filter((r) => typeof r.lat === "number" && typeof r.lng === "number")
    .map((r) => {
      const d = haversineKm(lat, lng, r.lat!, r.lng!);
      return { ...r, distance_km: d };
    })
    .filter((r) => r.distance_km <= radiusKm)
    .sort((a, b) => a.distance_km - b.distance_km);

  return NextResponse.json({
    center: { lat, lng },
    radius_km: radiusKm,
    category: category || null,
    count: results.length,
    results,
  });
}
