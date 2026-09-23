"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export function LocationPreviewMap({
  lat,
  lng,
  height = 200,
}: {
  lat: number;
  lng: number;
  height?: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-hk-champagne/40">
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        style={{ height, width: "100%" }}
        dragging={false}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={markerIcon} />
      </MapContainer>
    </div>
  );
}
