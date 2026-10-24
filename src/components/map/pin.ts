import L from "leaflet";

/** Map pin as an inline SVG icon, so we do not depend on Leaflet's image files. */
export function createPinIcon(color = "#e4572e") {
  return L.divIcon({
    className: "sarana-pin",
    html: `<svg width="40" height="48" viewBox="0 0 40 48" aria-hidden="true">
      <path d="M20 46C20 46 3 29 3 17a17 17 0 0 1 34 0c0 12-17 29-17 29z" fill="${color}" stroke="#fff" stroke-width="3"/>
      <circle cx="20" cy="17" r="6.5" fill="#fff"/>
    </svg>`,
    iconSize: [40, 48],
    iconAnchor: [20, 46],
  });
}

/** Centre of Sri Lanka, used before we know where the person is. */
export const SRI_LANKA_CENTER: [number, number] = [7.8731, 80.7718];
export const SRI_LANKA_ZOOM = 7;

export const OSM_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
