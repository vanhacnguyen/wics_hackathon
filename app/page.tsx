"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CITIES, CATEGORIES, LANGUAGES } from "./csvdata.js"; // Import shared data

interface SelectMenuProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

// Reusable Select Component
function SelectMenu({ label, value, options, onChange }: SelectMenuProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "200px" }}>
      <label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px", color: "#555" }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
      >
        <option value="">All</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

export default function SearchPage() {
  const router = useRouter();
  const [city, setCity] = useState("San Jose");
  const [category, setCategory] = useState("food");
  const [lang, setLang] = useState("English");

  function onSearch() {
    // Navigate to the new page with query parameters
    // Example: /results?city=San%20Jose&category=food&lang=English
    const params = new URLSearchParams({ city, category, lang });
    router.push(`/results?${params.toString()}`);
  }

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto", textAlign: "center", marginTop: "100px" }}>
      <h1 style={{ marginBottom: 32 }}>Community Resource Finder</h1>

      <div style={{ 
        display: "flex", 
        gap: 12, 
        justifyContent: "center",
        alignItems: "flex-end", 
        flexWrap: "wrap",
        background: "#f9f9f9",
        padding: "40px",
        borderRadius: "12px"
      }}>
        
        <SelectMenu label="City" options={CITIES} value={city} onChange={setCity} />
        <SelectMenu label="Category" options={CATEGORIES} value={category} onChange={setCategory} />
        <SelectMenu label="Language" options={LANGUAGES} value={lang} onChange={setLang} />
        
        <button 
          onClick={onSearch}
          style={{ 
            padding: "0 24px", background: "#0070f3", color: "white", 
            border: "none", borderRadius: "4px", cursor: "pointer", 
            height: "35px", fontWeight: "bold"
          }}
        >
          Find Resources
        </button>
      </div>
    </main>
  );
}