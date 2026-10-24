import L from "leaflet";

/** Map pin as an inline SVG icon, so we do not depend on Leaflet's image files. */
export function createPinIcon(color = "#e4572e") {
  return L.divIcon({
    className: "sarana-pin",
    html: `<svg width="40" height="48" viewBox="-3 -3 46 54" style="overflow:visible" aria-hidden="true">
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

/**
 * A pet's pin: a teardrop in the colour of its status, with a paw in the middle.
 * Urgent animals get a pulsing ring. The selected pin grows (see .pet-pin in globals.css).
 */
export function createPetIcon(color: string, urgent: boolean, selected: boolean) {
  return L.divIcon({
    className: `pet-pin${selected ? " is-selected" : ""}`,
    html: `${urgent ? '<span class="pin-ring"></span>' : ""}<span class="pin-body"><svg width="38" height="46" viewBox="-3 -3 46 54" style="overflow:visible" aria-hidden="true">
      <path d="M20 46C20 46 3 29 3 17a17 17 0 0 1 34 0c0 12-17 29-17 29z" fill="${color}" stroke="#fff" stroke-width="3"/>
      <g fill="#fff"><circle cx="14" cy="15" r="2.3"/><circle cx="19" cy="11.5" r="2.3"/><circle cx="24" cy="11.5" r="2.3"/><circle cx="29" cy="15" r="2.3"/>
      <path d="M21.5 17.5c-3 0-6 3.6-6 6 0 1.4 1.1 2.4 2.5 2.4 1.2 0 2-.6 3.5-.6s2.3.6 3.5.6c1.4 0 2.5-1 2.5-2.4 0-2.4-3-6-6-6z" transform="translate(-1.5 0)"/></g>
    </svg></span>`,
    iconSize: [38, 46],
    iconAnchor: [19, 44],
  });
}

/** The blue pulsing dot for "you are here". */
export function createYouIcon() {
  return L.divIcon({ className: "you-dot", html: "<span></span>", iconSize: [24, 24], iconAnchor: [12, 12] });
}
