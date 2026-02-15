// export type Resource = {
//   name: string;
//   lat: number;
//   lng: number;
//   city?: string;
//   categories?: string[] | string;
//   languages?: string[] | string;
//   address?: string;
//   phone?: string;
//   website?: string;
//   distance_km?: number;
// };

// export async function fetchResources(params: {
//   city?: string;
//   category?: string;
//   language?: string;
// }) {
//   const base = "https://uglydog.io/cgi-bin/hack.cgi";

//   const url = new URL(base);
//   if (params.city) url.searchParams.set("city", params.city);
//   if (params.category) url.searchParams.set("category", params.category);
//   if (params.language) url.searchParams.set("language", params.language);

//   const res = await fetch(url.toString(), { cache: "no-store" });

//   // Once backend returns JSON, it will work.
//   const data = await res.json();

//   return data; // expect { meta, results }
// }

export async function fetchResources(params: {
  city?: string;
  category?: string;   // from UI
  language?: string;   // from UI
}) {
  const base = "https://uglydog.io/cgi-bin/hack.cgi";
  const url = new URL(base);

  if (params.city) url.searchParams.set("city", params.city);
  if (params.category) url.searchParams.set("categories", params.category);
  if (params.language) url.searchParams.set("languages", params.language);

  const res = await fetch(url.toString(), { cache: "no-store" });

  // IMPORTANT: inspect content-type before calling json()
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!ct.includes("application/json")) {
    return {
      meta: { count: 0, upstream_content_type: ct },
      results: [],
      note: "Upstream did not return JSON",
      upstream_preview: text.slice(0, 400),
    };
  }

  return JSON.parse(text); // expect { meta, results }
}
