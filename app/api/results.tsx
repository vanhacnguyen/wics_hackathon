"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { RESOURCES } from "./csvdata.js";

export default function ResultsPage() {
  const searchParams = useSearchParams();
  
  // Read filters from the URL
  const city = searchParams.get("city");
  const category = searchParams.get("category");
  const lang = searchParams.get("lang");

  // Filter Logic
  const data = RESOURCES.filter((item) => {
    const cityMatch = !city || item.city === city;
    const catMatch = !category || item.category === category;
    const langMatch = !lang || item.languages.includes(lang);
    return cityMatch && catMatch && langMatch;
  });

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Results for {city || "All Cities"}</h1>
        
        {/* Link back to the search page */}
        <Link 
          href="/"
          style={{ 
            textDecoration: "none", color: "#0070f3", fontWeight: "bold",
            border: "1px solid #0070f3", padding: "8px 16px", borderRadius: "4px"
          }}
        >
          ← Back to Search
        </Link>
      </div>

      {/* The Grid Layout */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
        gap: "20px" 
      }}>
        {data.length > 0 ? data.map((item, i) => (
          <div key={i} style={{ 
            border: "1px solid #e0e0e0", borderRadius: "8px", padding: "20px", 
            backgroundColor: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
          }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "18px", color: "#111" }}>{item.name}</h4>
            
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px", fontSize: "12px" }}>
              <span style={{ background: "#e3f2fd", color: "#0070f3", padding: "4px 8px", borderRadius: "12px", textTransform: "capitalize" }}>
                {item.category}
              </span>
              <span style={{ background: "#f5f5f5", color: "#666", padding: "4px 8px", borderRadius: "12px" }}>
                {item.city}
              </span>
            </div>

            <div style={{ fontSize: "14px", color: "#444", marginBottom: "16px", lineHeight: "1.5" }}>
               <div style={{ marginBottom: "4px" }}>📍 {item.address}</div>
               <div style={{ marginBottom: "4px" }}>📞 {item.phone}</div>
               <div style={{ color: "#666", fontStyle: "italic" }}>"{item.notes}"</div>
            </div>

            <a 
              href={item.website} 
              target="_blank" 
              style={{ 
                display: "inline-block", fontSize: "14px", color: "white", 
                backgroundColor: "#0070f3", padding: "8px 16px", 
                borderRadius: "4px", textDecoration: "none" 
              }}
            >
              Visit Website
            </a>
          </div>
        )) : (
          <p style={{ color: "#666", gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
            No results found matching your criteria.
          </p>
        )}
      </div>
    </main>
  );
}