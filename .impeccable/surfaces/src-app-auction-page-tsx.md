---
version: 1
slug: "src-app-auction-page-tsx"
primary_target: "src/app/auction/page.tsx"
related_targets: ["src/app/stage/page.tsx","src/app/players/page.tsx","src/app/page.tsx"]
---

# Surface brief — SCL auction app (whole app: console, stage, players, home)

Mode: Operate (admin console, players, home) + a projected Stage route the room reads from distance.
Audience/job: one admin logs results of a chit-draw auction (player drawn → category announced → verbal bidding in the room → final hammer price logged). The screen never shows the bidding war, lot counters or "players remaining" calls. The room reads who is up and who bought them; residents check squads/purses on phones.
Constraints: logo palette pinned (user); dark night-stadium canvas everywhere (user); mobile numbers stay public (user). Season data from constants, not hard-coded copy.

## Direction contract
THESIS: The auction is a scorer's book written under floodlights: every team a ruled 13-line column, every sale one inked entry. Refuses the shadcn admin-card grid and the IPL-broadcast gradient-panel package.
OWN-WORLD: Night navy #0A0F2C ground, indigo banner panels, hairline ruled grid (Japanese-density raise: strict hairline module system, no floating cards). Magenta floodlight glow only at the top edge. Category inks: Legend magenta, Youngstar turf green, Gold gold, Silver steel, Bronze ribbon orange — always with a label. Ball red = SOLD stamp. Cream for money numerals. Big Shoulders Display (names, team names, SOLD) + Barlow (UI, tabular numerals).
STORY: Admin draws a chit, finds the name in two keystrokes, puts them on the block; the stage lights them up; admin taps the team, types the hammer price, Enter; the stage stamps SOLD; the ledger gains an entry.
FIRST VIEWPORT: Console: left 5/12 "On the block" (photo, name, category, base price) over the sale panel (7 team keys showing max bid, amount in Lakhs, Record sale); right 7/12 the squad ledger, category row labels in the shoulder. Stage: photo left 40%, name at ~7vw right, category ink label, base price; team purse strip along the bottom.
FORM: Scorer's ledger, candidate 5 of 7; seed key 62699514. Raises — lexicon: a head rule naming where you are (Season 6 · Auction · edit state); j-card: running totals right-aligned tight, purse must fit the squad.
SIGNATURE: the SOLD stamp — red rubber-stamp on stage over the entry, 6s, then the entry settles into the team column.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
