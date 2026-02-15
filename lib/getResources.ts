export async function getResources(params: { city?: string; category?: string; lang?: string }) {
  const url = new URL("/api", location.origin);
  if (params.city) url.searchParams.set("city", params.city);
  if (params.category) url.searchParams.set("category", params.category);
  if (params.lang) url.searchParams.set("lang", params.lang);

  const res = await fetch(url.toString(), { cache: "no-store" });
  return res.json(); // expects { meta, results }
}
