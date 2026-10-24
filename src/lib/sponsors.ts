/**
 * Partners and sponsors shown under the hero.
 *
 * Add a real partner here once they have agreed, and put their logo file in /public/sponsors/.
 * Use a transparent PNG or SVG, ideally wider than tall (about 240 x 80 px).
 * While this list is empty, the strip shows clearly marked "Your logo here" slots. Do not add
 * logos of organisations that have not given their permission.
 *
 * Example:
 *   { name: "Paws Vet Clinic", logo: "/sponsors/paws-vet.svg", href: "https://example.com" },
 */
export type Sponsor = { name: string; logo: string; href?: string };

export const sponsors: Sponsor[] = [];
