"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type MultiSelectProps = {
  label: string;
  placeholder?: string;
  options: string[];
  values: string[];                 // selected
  onChange: (next: string[]) => void;
};

function MultiSelect({ label, placeholder, options, values, onChange }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // close when clicking outside
  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  const available = useMemo(() => {
    const selected = new Set(values);
    return options
      .filter((o) => !selected.has(o))
      .filter((o) => o.toLowerCase().includes(q.trim().toLowerCase()));
  }, [options, values, q]);

  function add(opt: string) {
    if (values.includes(opt)) return;
    onChange([...values, opt]);
    setQ("");
    setOpen(false);
  }

  function remove(opt: string) {
    onChange(values.filter((v) => v !== opt));
  }

  return (
    <div ref={wrapRef} className="grid grid-cols-[140px_1fr] items-start gap-4">
      <label className="pt-3 text-left text-lg font-medium text-white/90">{label}</label>

      <div className="relative">
        {/* Input/chips box */}
        <div
          className="min-h-[48px] w-full rounded-xl bg-white/95 px-3 py-2 shadow-sm outline-none ring-1 ring-white/30 focus-within:ring-2 focus-within:ring-sky-200"
          onClick={() => setOpen(true)}
        >
          <div className="flex flex-wrap items-center gap-2">
            {/* chips */}
            {values.map((v) => (
              <span
                key={v}
                className="flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-slate-800 ring-1 ring-sky-200"
              >
                {v}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(v);
                  }}
                  className="grid h-5 w-5 place-items-center rounded-full text-slate-700 hover:bg-sky-200"
                  aria-label={`Remove ${v}`}
                >
                  ×
                </button>
              </span>
            ))}

            {/* search input */}
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder={values.length ? "" : placeholder ?? "Select…"}
              className="flex-1 min-w-[140px] bg-transparent py-1 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* dropdown */}
        {open && (
          <div className="absolute z-50 mt-2 max-h-64 w-full overflow-auto rounded-xl bg-white shadow-lg ring-1 ring-black/10">
            {available.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500">
                No options
              </div>
            ) : (
              <ul className="py-2">
                {available.map((opt) => (
                  <li key={opt}>
                    <button
                      type="button"
                      onClick={() => add(opt)}
                      className="w-full px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-100"
                    >
                      {opt}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


interface SelectMenuProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

function SelectMenu({ label, value, options, onChange }: SelectMenuProps) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-center gap-4">
      <label className="text-left text-lg font-medium text-white/90">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl bg-white/95 px-3 py-3 text-gray-800 shadow-sm outline-none ring-1 ring-white/30 focus:ring-2 focus:ring-sky-200"
        >
          <option value="">Select city</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
          ▾
        </span>
      </div>
    </div>
  );
}

type Resource = {
  city?: string;
  categories?: string[] | string;
  languages?: string[] | string;
};

export default function SearchPage() {
  const router = useRouter();
  

  // dropdown options loaded from backend
  const [cities, setCities] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  // selected filters
  const [city, setCity] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoadingMeta(true);

        const res = await fetch("/api/meta", { cache: "no-store" });
        const json = await res.json();

        if (cancelled) return;

        setCities((json.cities ?? []).sort());
        setCategories((json.categories ?? []).sort());
        setLanguages((json.languages ?? []).sort());
      } catch (e) {
        if (!cancelled) setError("Failed to load filter options.");
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function onSearch() {
    setError("");

    if (!city || selectedCategories.length === 0 || selectedLanguages.length === 0) {
      setError("Please select a city, at least one category, and at least one language.");
      return;
    }

    const params = new URLSearchParams();
    params.set("city", city);
    params.set("category", selectedCategories.join(",")); // or append multiple
    params.set("lang", selectedLanguages.join(","));

    router.push(`/result?${params.toString()}`);
  }

  return (
    <main
      className="relative min-h-[calc(100vh-72px)] bg-cover bg-center"
      style={{ backgroundImage: "url('/playground.jpg')" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Page content */}
      <div className="relative z-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-20">
          <h1 className="text-center text-5xl font-extrabold tracking-wide text-white drop-shadow-sm">
            FINDING RESOURCE
          </h1>

          <div className="mt-10 w-full max-w-3xl rounded-2xl bg-white/10 p-8 shadow-lg ring-1 ring-white/15 backdrop-blur-md">
            {loadingMeta ? (
              <p className="text-center text-white/80">Loading filters…</p>
            ) : (
              <div className="space-y-6">
                <SelectMenu label="City" options={cities} value={city} onChange={setCity} />
                <MultiSelect
                  label="Category"
                  placeholder="Select categories"
                  options={categories}
                  values={selectedCategories}
                  onChange={setSelectedCategories}
                />
                <MultiSelect
                  label="Language"
                  placeholder="Select languages"
                  options={languages}
                  values={selectedLanguages}
                  onChange={setSelectedLanguages}
                />
                <div className="pt-4 flex justify-center">
                  <button
                    onClick={onSearch}
                    className="w-full max-w-md rounded-full bg-sky-200 px-10 py-4 text-sm font-semibold tracking-[0.35em] text-slate-800 shadow-md ring-1 ring-sky-300 transition hover:scale-[1.01] hover:bg-sky-100"
                  >
                    SEARCH
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
