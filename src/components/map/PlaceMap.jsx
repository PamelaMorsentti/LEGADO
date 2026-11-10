import { MapContainer, TileLayer, CircleMarker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function PlaceMap({ lat, lng, onPick }) {
  function Catcher() {
    useMapEvents({
      click: (e) => onPick && onPick(e.latlng.lat, e.latlng.lng),
    });
    return null;
  }

  const hasPoint = typeof lat === "number" && typeof lng === "number";
  const center = hasPoint ? [lat, lng] : [-33.45, -70.66];

  return (
    <MapContainer
      center={center}
      zoom={hasPoint ? 9 : 4}
      scrollWheelZoom={false}
      className="h-72 w-full rounded-2xl border border-rose-100 z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Catcher />
      {hasPoint && (
        <CircleMarker
          center={[lat, lng]}
          radius={12}
          pathOptions={{ color: "#d16a8a", fillColor: "#f3a9c0", fillOpacity: 0.9, weight: 2 }}
        />
      )}
    </MapContainer>
  );
}