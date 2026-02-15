"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from "react-leaflet";
import L from "leaflet";

type Item = {
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

// Fix default marker icons (common issue in Next)
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const CITY_CENTER: Record<string, [number, number]> = {
  "San Jose": [37.3382, -121.8863],
  "Santa Clara": [37.3541, -121.9552],
  "Sunnyvale": [37.3688, -122.0363],
  "Mountain View": [37.3861, -122.0839],
  "Palo Alto": [37.4419, -122.1430],
  "Milpitas": [37.4323, -121.8996],
  "Campbell": [37.2872, -121.9500],
  "Cupertino": [37.3229, -122.0322],
  "Los Gatos": [37.2358, -121.9624],
  "Saratoga": [37.2638, -122.0230],
  "Los Altos": [37.3852, -122.1141],
  "Morgan Hill": [37.1305, -121.6544],
  "Gilroy": [37.0058, -121.5683],
};

function FitToPoints({
  city,
  points,
  userPos,
} : {
  city: string;
  points: [number, number][];
  userPos?: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    const center = CITY_CENTER[city] ?? CITY_CENTER["San Jose"];

    const allPoints = [...points];
    if (userPos) allPoints.push([userPos.lat, userPos.lng]);

    if (allPoints.length > 0) {
      map.fitBounds(allPoints, { padding: [30, 30] });
    } else {
      map.setView(center, 12);
    }
  }, [city, points, userPos, map]);

  return null;
}


export default function ResourceMap({
  city,
  items,
  userPos,
}: {
  city: string;
  items: Item[];
  userPos?: { lat: number; lng: number } | null;
}) {
  const center = useMemo(() => CITY_CENTER[city] ?? CITY_CENTER["San Jose"], [city]);

  const markers = useMemo(() => {
    return (items ?? [])
      .map((it) => ({
        ...it,
        latNum: typeof it.lat === "string" ? Number(it.lat) : it.lat,
        lngNum: typeof it.lng === "string" ? Number(it.lng) : it.lng,
      }))
      .filter((it) => Number.isFinite(it.latNum) && Number.isFinite(it.lngNum));
  }, [items]);

  const points = useMemo<[number, number][]>(() => markers.map((m) => [m.latNum as number, m.lngNum as number]), [markers]);

  return (
    <div className="h-full w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
    <MapContainer center={center} zoom={12} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToPoints city={city} points={points} userPos={userPos} />

      {/* USER LOCATION MARKER */}
      {userPos && (
        <CircleMarker
          center={[userPos.lat, userPos.lng]}
          radius={8}
          pathOptions={{
            color: "#2563eb",
            fillColor: "#60a5fa",
            fillOpacity: 0.9,
          }}>
          <Popup>
            <div style={{ minWidth: 160 }}>
              <div style={{ fontWeight: 700 }}>You are here</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                Showing nearest resources
              </div>
            </div>
          </Popup>
        </CircleMarker>
      )}

        {markers.map((it, idx) => {
            const cat = Array.isArray(it.categories) ? it.categories.join(", ") : "";
            const addr = it.address_line1 ?? "";

            return (
                <Marker key={`${it.name}-${idx}`} position={[it.latNum as number, it.lngNum as number]}>
                <Popup>
                    <div style={{ minWidth: 220 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{it.name}</div>

                    <div style={{ fontSize: 12, marginBottom: 6 }}>
                        {cat} • {it.city}
                    </div>

                    <div style={{ fontSize: 12 }}>📍 {addr}</div>

                    {it.phone ? <div style={{ fontSize: 12, marginTop: 4 }}>📞 {it.phone}</div> : null}

                    {it.website ? (
                        <div style={{ marginTop: 8 }}>
                        <a href={it.website} target="_blank" rel="noopener noreferrer">
                            Website
                        </a>
                        </div>
                    ) : null}
                    </div>
                </Popup>
                </Marker>
            );
        })}

    </MapContainer>
    </div>
  );
}
