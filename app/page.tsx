"use client";

import { useState } from "react";
import { getResources } from "@/lib/getResources";

// 1. Define Data Lists
const CITIES = [
  "Cupertino", "San Jose", "San Francisco", "Mountain View", 
  "Sunnyvale", "Palo Alto", "Fremont", "Oakland", "Berkeley", "Santa Clara"
];

const CATEGORIES = [
  "Food", "Health", "Legal", "Housing", 
  "Education", "Jobs", "Transit", "Emergency"
];

const LANGUAGES = [
  "English", "Spanish", "Vietnamese", "Chinese", "Tagalog", "Hindi"
];

interface SelectMenuProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}
// 2. Reusable Native Select Component
function SelectMenu({ label, value, options, onChange }: SelectMenuProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "200px" }}>
      <label 
        style={{ 
          fontSize: "12px", 
          fontWeight: "600", 
          marginBottom: "4px", 
          color: "#555" 
        }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ 
          width: "100%", 
          padding: "8px", 
          border: "1px solid #ccc", 
          borderRadius: "4px",
          backgroundColor: "white",
          cursor: "pointer",
          fontSize: "14px"
        }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

// 3. Main Page Component
export default function Home() {
  // Initialize with valid defaults from the lists
  const [city, setCity] = useState("Cupertino");
  const [category, setCategory] = useState("Food");
  const [lang, setLang] = useState("English");
  const [data, setData] = useState(null);

  async function onSearch() {
    const d = await getResources({ city, category, lang });
    setData(d);
  }

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: 24 }}>Community Resource Finder</h1>

      {/* Search Bar Container */}
      <div style={{ 
        display: "flex", 
        gap: 12, 
        alignItems: "flex-end", // Align input bottoms with button
        flexWrap: "wrap" 
      }}>
        
        <SelectMenu 
          label="City" 
          options={CITIES} 
          value={city} 
          onChange={setCity} 
        />
        
        <SelectMenu 
          label="Category" 
          options={CATEGORIES} 
          value={category} 
          onChange={setCategory} 
        />
        
        <SelectMenu 
          label="Language" 
          options={LANGUAGES} 
          value={lang} 
          onChange={setLang} 
        />
        
        <button 
          onClick={onSearch}
          style={{ 
            padding: "0 24px", 
            background: "#0070f3", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: "pointer",
            height: "35px", // Matches default select height
            fontWeight: "bold"
          }}
        >
          Search
        </button>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 12 }}>Results</h3>
        <pre style={{ 
          background: "#1e1e1e", 
          color: "#4caf50", 
          padding: 16, 
          borderRadius: 8, 
          overflowX: "auto",
          minHeight: "100px"
        }}>
          {data ? JSON.stringify(data, null, 2) : "Select options and click Search."}
        </pre>
      </div>
    </main>
  );
}