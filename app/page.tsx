"use client";

import { useState } from "react";
import { getResources } from "@/lib/getResources";

export default function Home() {
  const [city, setCity] = useState("Cupertino");
  const [category, setCategory] = useState("food");
  const [lang, setLang] = useState("English");
  const [data, setData] = useState<any>(null);

  async function onSearch() {
    const d = await getResources({ city, category, lang });
    setData(d);
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Community Resource Finder</h1>

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
        <input value={lang} onChange={(e) => setLang(e.target.value)} placeholder="Lang" />
        <button onClick={onSearch}>Search</button>
      </div>

      <pre style={{ marginTop: 16, background: "#111", color: "#0f0", padding: 12, overflowX: "auto" }}>
        {data ? JSON.stringify(data, null, 2) : "Click Search"}
      </pre>
    </main>
  );
}
