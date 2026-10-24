# Sarana – street animal help website

Sarana helps street animals in Sri Lankan towns. Anyone who sees a dog or cat in trouble takes a photo, adds the location, and posts it. Nearby volunteers see it on a map and help (food, vet care, transport, foster), and the community helps find the animal a home.

The site is a **mobile-first website** (no app download). Later it becomes a PWA.

## Tech stack (everything must stay on free tiers)

- **Next.js (App Router) + TypeScript + Tailwind CSS**
- **Supabase** (free plan): Postgres database, Auth (Google + phone/email), Storage for photos
- **Leaflet + OpenStreetMap** for maps (no Google Maps: it needs billing)
- **GSAP + ScrollTrigger** for the home page scroll story and animations
- **Lucide** icons
- Hosting on **Vercel** (free)
- Compress every photo in the browser before upload (target about 200 KB, max width 1600 px)

Never add a paid service or anything that needs a credit card without asking first.

## Languages

- UI in **Sinhala and English** from day one (Tamil later). Default language: Sinhala.
- Keep all UI text in translation files (`/messages/si.json`, `/messages/en.json`), never hard-coded.
- Fonts: Bricolage Grotesque (headings), Noto Sans Sinhala, Noto Sans Tamil (Google Fonts).

## Pages

### Phase 1 (build first)
1. `/` Home: the Brownie scroll story (see `reference/sarana-story.html`), "Report a pet" button, a few nearby pets, stats
2. `/map` Map + list of pets, filters: dogs / cats / urgent / needs a home
3. `/report` Photo → location (GPS + draggable pin) → details (animal, condition chips, note). Works without login; phone or email optional
4. `/pet/[id]` Photos, location, status timeline, "I'll help" and "Give a home" buttons, updates, share to WhatsApp / Facebook
5. `/volunteer` Volunteer sign-up: skills (feeding, transport, foster, vet care) and area
6. `/login` Google login + phone/email
7. `/profile` My reports, animals I helped, settings
8. `/about` About + contact

### Phase 2 (later)
`/community`, `/adopt`, `/lost` (lost pets), `/vets` (vets and shelters), `/stories` (success stories), `/admin` (moderation).
Even in Phase 1, keep a simple way for an admin to hide fake or spam posts.

## Pet status flow

`reported` → `help_on_the_way` → `safe` (fed / vet checked) → `adopted`
Urgent is a separate flag (injured, sick, puppies/kittens).

## Design system

Theme idea: the story goes from a dark rainy night to a warm home. The site uses the same feeling.

| Token | Hex | Use |
|---|---|---|
| coral | `#E4572E` | Primary buttons, "Report", urgent |
| midnight | `#182033` | Text, headings |
| brownie | `#D99A57` | Highlights, illustrations |
| cream | `#FBEBD6` | Warm section backgrounds |
| blue | `#2E6BD8` | Status: help on the way |
| green | `#1F8A70` | Status: safe / volunteers |
| gold | `#F2B544` | Status: adopted |
| night | `#0F1630` | Dark mode background |

- Radius: cards 20px, buttons 16px. Soft warm shadows.
- Touch targets at least 44px. The "Report" button is always reachable at the bottom on mobile.
- Support dark mode and `prefers-reduced-motion` (turn animations off).
- Text must be readable outdoors in sunlight (good contrast).

## Mascot: Brownie

A tan street dog with a green collar and gold tag. Built as an SVG rig with fixed joints
(ear joint on the head outline, head pivots at the neck, tail at its root) so parts never drift apart.
Use the rig from `reference/sarana-story.html`.
- Page loader: Brownie's head, the drooped ear slowly lifts while loading; both ears up when done
- Empty state: Brownie sleeping happily ("everyone near you is safe")
- Error state: one ear down, friendly retry message
- 404: Brownie sniffing around
- Success: paw-print confetti + tail wag
- Eyes follow the cursor (or touch point on phones); clicking Brownie makes him bark with an open mouth

## Loading and motion rules

- Lists and map: skeleton cards with shimmer, never empty spinners
- Photos: blurred small preview first, then fade into the full photo
- Report upload: paw prints walk along the progress bar
- Buttons: inline loader and disabled while submitting (no double submit)
- Durations: hover/click 0.2s, cards/popups 0.3s with a light spring, page transitions 0.4s fade + slide

## How to work in this project

- Work in small steps. Plan first, then build one page or feature at a time.
- After each feature: run the dev server, check it on a phone-width screen, then commit with git.
- Ask before adding new libraries or changing the database schema.
- Keep secrets in `.env.local` and never commit them.
