# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Auction admin / organiser.** Runs the live auction from a laptop: picks the player on the block, sees each team's maximum allowable bid, records the sale, and undoes mistakes. Unlocks edit access with a password; everything else is read-only.
- **The room.** Team owners and residents in the hall watching the projected or cast screen while players are sold. They read from a distance and need to follow who is up, what they went for, and where each team stands.
- **Residents and team owners on phones.** Open the public link during and after the event to check squads, remaining purses, and the player pool.

## Product Purpose

Runs the player auction for the Samriddhi Champions League (SCL), the cricket league of the Samriddhi housing society. It manages the player pool, enforces squad rules while the bidding is live, and keeps every team's purse and composition accurate so the auction runs fast and nobody can dispute it. Success means the auction finishes with valid 13-player squads for every team, no manual spreadsheet reconciliation, and a room that can follow along.

## Positioning

A purpose-built tool for one community league's auction format. The rules are encoded and the bids are validated as they happen: each team's maximum bid is calculated from its remaining purse, plus the budget it must reserve to fill its mandatory category slots. Generic auction or spreadsheet tools don't know these rules.

## Operating Context

- Used live, in person, on auction day (the 2027 event is 17 Jan 2027). One admin operates while the screen is projected to a room. Others watch on their phones through the public link.
- Reused every season. Teams, team names, purse, categories, limits, and minimum bids may change from one season to the next, so treat the current values as season data rather than permanent fixtures.
- Players are society residents and are identified by wing and flat number, playing role, age, and photo.

## Capabilities and Constraints

- **Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 3, MongoDB via Mongoose, Vercel Blob for player photos, lucide-react icons. Deployed on Vercel.
- **Screens:** Home (overview and rules), Players (search, filter by category, add, remove unsold, upload photos, view details), Team Auction (select player, max bid per team, record sale, undo last sale, team squads and purses, player view modal).
- **Edit access:** client-side password gate (`NEXT_PUBLIC_LOCAL_PASSWORD`). Viewers are read-only. Destructive actions (reset database, delete player, undo sale) require edit mode and confirmation.
- **2026 season rules** (in `src/lib/constants.ts`): 7 teams, ₹2 Cr purse each, squads of exactly 13 (1 Legend, 1 Youngstar, 2 Gold, 5 Silver, 4 Bronze). Minimum bids: Gold ₹15 L, Silver ₹10 L, Legend/Youngstar/Bronze ₹5 L.
- **Terminology:** categories are LEGEND, YOUNGSTAR, GOLD, SILVER, BRONZE. Roles are Batsman, Bowler, Allrounder. Money is shown in Indian units (Lakhs, Crores).
- **Open:** whether squads should ever allow 11 to 13 players (the README says 11–13, the code enforces 13). Fixed at 13 for now, to be decided later. The README's description of localStorage persistence is out of date; data lives in MongoDB.

## Brand Commitments

- League identity: "Samriddhi Champions League", short form "SCL", Season 7, 2027. The season emblem is drawn in code (`src/components/SeasonLogo.tsx`) from the `SEASON` settings, in the style of the original 2026 artwork (`public/images/logo.jpg`, kept for reference). The society's name and line ("Samriddhi: Peace, Prestige & Prosperity") appear inside it.
- A "Powered by iotric" credit with `public/images/iotric.webp` appears on the app's screens.
- Team names (2026): Gujarat Lions, Chhava Sena, Team Lagaan, Pratham 11, Yohan's Warriors, Khalsa Warriors, Shree Siddhivinayak Strikers.

## Evidence on Hand

- Real player pool with photos: `mongoplayers.json` and `src/lib/players-seed.ts`, with images on Vercel Blob.
- League logo and sponsor mark in `public/images/`.
- No team logos, sponsor list beyond iotric, past-season results, or testimonials. Do not fabricate any of them.

## Product Principles

1. **The rules are the product.** Every action must keep squads valid; show constraints before they're broken, not after.
2. **Legible to the room.** What's on the block, the sale price, and team standings must read from the back of a hall, not only at laptop distance.
3. **Fast and forgiving for the operator.** One person runs a live event under pressure: few steps per sale, clear confirmation, reliable undo.
4. **Public by default, editable by one.** Anyone can watch and check; only the unlocked admin can change anything.
5. **Season-portable.** Teams, rules, and branding are season data. Don't hard-wire the 2026 values into the experience.

## Accessibility & Inclusion

- Projected use: high contrast and large type for key auction information, robust to washed-out projectors and bright halls.
- Category identity must not rely on colour alone (it is currently colour-coded); always pair it with a label.
- Audience includes older residents (the Legend category covers players in their late 40s and up). Phone views should not depend on small text.
