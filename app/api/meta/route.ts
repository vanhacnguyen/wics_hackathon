import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// CSV parser supports quotes + commas in quotes
function parseCSV(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"' && inQuotes && next === '"') {
      cur += '"';
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      row.push(cur); cur = "";
      continue;
    }
    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i++;
      row.push(cur); cur = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
      continue;
    }
    cur += ch;
  }

  row.push(cur);
  if (row.some((c) => c.trim() !== "")) rows.push(row);

  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((cells) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => (obj[h] = (cells[idx] ?? "").trim()));
    return obj;
  });
}

export async function GET() {
  const csvPath = path.join(process.cwd(), "backend/data", "SantaClara.csv");

  if (!fs.existsSync(csvPath)) {
    return NextResponse.json(
      { error: "CSV not found", tried_path: csvPath, cwd: process.cwd() },
      { status: 500 }
    );
  }

  const csvText = fs.readFileSync(csvPath, "utf8");
  const rows = parseCSV(csvText);

  const citySet = new Set<string>();
  const catSet = new Set<string>();
  const langSet = new Set<string>();

  for (const r of rows) {
    if (r.city) citySet.add(r.city);

    String(r.categories ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((c) => catSet.add(c));

    String(r.languages ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((l) => langSet.add(l));
  }

  return NextResponse.json({
    cities: Array.from(citySet).sort(),
    categories: Array.from(catSet).sort(),
    languages: Array.from(langSet).sort(),
  });
}
