---
name: SCL Player Auction
description: The Samriddhi Champions League auction, kept as a scorer's book under floodlights.
colors:
  night: "#0a0f2c"
  night-2: "#10173d"
  night-3: "#18215a"
  rule: "#252e66"
  rule-strong: "#3a4590"
  ink: "#f1f2fa"
  ink-2: "#b4bbdd"
  ink-3: "#8a92c0"
  floodlight: "#e8317f"
  floodlight-strong: "#c81b68"
  violet: "#5b2a9e"
  ball: "#e0313a"
  ball-soft: "#ff8a90"
  turf: "#7ed957"
  cream: "#f7e6b5"
  cat-legend: "#ff5aa8"
  cat-youngstar: "#7ed957"
  cat-gold: "#f5c542"
  cat-silver: "#c3cce8"
  cat-bronze: "#ff8a3d"
typography:
  display:
    fontFamily: "Big Shoulders Display, system-ui, sans-serif"
    fontSize: "clamp(3.5rem, 7.4vw, 9.5rem)"
    fontWeight: 900
    lineHeight: 0.86
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Big Shoulders Display, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "0.025em"
  title:
    fontFamily: "Big Shoulders Display, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "0.025em"
  section-label:
    fontFamily: "Big Shoulders Display, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0.16em"
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.25
  numeral:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    fontFeature: "\"tnum\" 1"
  ledger-entry:
    fontFamily: "Barlow Condensed, Barlow, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.25
rounded:
  swatch: "2px"
  tag: "3px"
  DEFAULT: "4px"
  md: "6px"
  lg: "10px"
  full: "9999px"
spacing:
  row: "44px"
  panel-sm: "16px"
  panel: "20px"
  gutter: "24px"
  gutter-xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.floodlight-strong}"
    textColor: "#ffffff"
    rounded: "{rounded.DEFAULT}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.floodlight}"
  button-secondary:
    backgroundColor: "{colors.night-3}"
    textColor: "{colors.ink}"
    rounded: "{rounded.DEFAULT}"
    padding: "0 16px"
    height: "44px"
  button-ghost:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.DEFAULT}"
    padding: "0 16px"
    height: "44px"
  button-ghost-hover:
    backgroundColor: "{colors.night-3}"
    textColor: "{colors.ink}"
  button-danger:
    backgroundColor: "{colors.ball}"
    textColor: "#ffffff"
    rounded: "{rounded.DEFAULT}"
    height: "44px"
  input-field:
    backgroundColor: "{colors.night}"
    textColor: "{colors.ink}"
    rounded: "{rounded.DEFAULT}"
    padding: "0 12px"
    height: "44px"
  category-tag:
    textColor: "{colors.night}"
    typography: "{typography.section-label}"
    rounded: "{rounded.tag}"
    height: "20px"
    padding: "0 6px"
  filter-chip:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.full}"
    height: "36px"
    padding: "0 12px"
  filter-chip-on:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.night}"
  team-key:
    backgroundColor: "{colors.night}"
    textColor: "{colors.ink}"
    rounded: "{rounded.DEFAULT}"
    height: "40px"
    padding: "0 12px"
  ledger-sheet:
    backgroundColor: "{colors.night-2}"
    rounded: "{rounded.md}"
  ledger-cell:
    typography: "{typography.ledger-entry}"
    height: "44px"
    padding: "0 10px"
  dialog:
    backgroundColor: "{colors.night-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: SCL Player Auction

## Overview

**Creative North Star: "The Scorer's Ledger"**

The auction is a scorer's book written under floodlights. Every team is a ruled column of thirteen lines, and every sale is one inked entry in it. The ground is the night sky from the SCL logo: deep navy panels, hairline rules, and a magenta floodlight glow that only ever comes from the top edge. Nothing floats. Panels are ruled sheets with hairline borders, not lifted cards, and density comes from the grid, not from decoration.

Two reading distances govern every choice. The console is read at laptop distance by one operator working fast. The stage is read from the back of a hall, often through a washed-out projector, so names, team names, and money are set in a tall condensed display face at viewport-relative sizes. Colour carries meaning, never ornament. The five category inks name the squad places, cream marks money, and ball red marks a sale or a destructive action. Each one always comes with a written word.

The system rejects the generic admin-card grid and the glossy broadcast package of gradient panels. It borrows its signature from the scorebook and the rubber stamp: the SOLD stamp lands, holds, and the entry then settles into its column.

**Key Characteristics:**
- Night-navy ground with three panel steps and two hairline rule weights
- Top-edge floodlight glow (magenta into violet), never behind content
- Tall condensed display caps for names, teams, and big numerals; Barlow for UI; Barlow Condensed for ledger entries
- Category inks always paired with their written label
- Cream reserved for money; ball red reserved for SOLD and destructive/error states
- Ruled 13-line ledger grid on desktop, a single ruled stack on phones

## Colors

A night-stadium palette lifted from the league logo: navy ground, a magenta floodlight, and five category inks, each with one fixed job.

### Primary
- **Floodlight Magenta** (floodlight): the operator's commit colour. It marks the active nav underline, the selected team key and its number chip, text selection, the caret, and the hover state of the primary button. It also tints the top-edge glow. The resting primary button uses **Floodlight Deep** (floodlight-strong) so that white label text holds contrast.
- **Logo Violet** (violet): used only as the outer falloff of the floodlight glow (at 12–35% alpha). Never a fill or text colour.

### Secondary
- **Scorebook Cream** (cream): money, and only money. Purses, max bids, base prices, hammer prices, and sold amounts are set in cream; so is the "Season 6" lexicon line. It is also the keyboard focus outline and the "on" fill of filter chips.
- **Ball Red** (ball): the SOLD stamp on the stage, plus the danger button and the "reconnecting" dot. **Ball Pink** (ball-soft) is its text-weight companion on navy: error messages, danger-quiet buttons, remove-entry hovers, and the error toast icon.
- **Turf Green** (turf): the "Live" connection dot and success toast. It shares its value with the Youngstar ink.

### Tertiary: Category Inks
- **Legend Pink** (cat-legend), **Youngstar Turf** (cat-youngstar), **Gold** (cat-gold), **Steel Silver** (cat-silver), **Bronze Orange** (cat-bronze): category identity. They appear as a solid tag with navy text, as a 10px square swatch beside the written label in ledger row headers and filter chips, as a dashed outline marking open places, and as a low-strength wash (13–16% alpha, defined beside each ink in the category metadata) behind filled ledger lines.

### Neutral
- **Night** (night): page ground, input wells, unselected team keys, the SOLD takeover backdrop.
- **Night Panel** (night-2): ledger sheets, dialogs, the on-the-block panel, the purse strip.
- **Night Banner** (night-3): ledger column headers (at 60%), the sale panel (at 40%), hover fills, secondary buttons, the team-name banner in the SOLD takeover, and photo wells.
- **Hairline** (rule): the default border everywhere, including ledger cell rules.
- **Strong Rule** (rule-strong): outer sheet borders, category group dividers, header bottoms, field strokes, scrollbars.
- **Floodlit Ink** (ink), **Muted Ink** (ink-2), **Faint Ink** (ink-3): primary text, secondary text and labels, then hints, placeholders, and disabled or "can't bid" states.

### Named Rules
**The Labelled Ink Rule.** A category colour never appears without its written name (Legend, Youngstar, Gold, Silver, Bronze) somewhere in the same row or tag. In ledger rows where the label is shown only once per group, the other rows carry it as screen-reader text.

**The Cream Is Money Rule.** If a number is a rupee amount, it is cream. Counts (2/13, 18 sold) are ink or muted ink, never cream.

**The Red Means Gone Rule.** Ball red marks a sale or something destructive or broken. It never decorates, and it never identifies a category or a team. The ledger's settle flash uses floodlight magenta, not red.

## Typography

**Display Font:** Big Shoulders Display, weights 600–900 (with system-ui fallback)
**Body Font:** Barlow, weights 400–700 (with system-ui fallback)
**Ledger Font:** Barlow Condensed, weights 500–600 (falling back to Barlow)

**Character:** Big Shoulders is the tall, narrow stadium-signage face: names, team names, category tags, and big numerals in uppercase, read from across a hall. Barlow is the same family's plain-spoken working voice for every control and sentence, and its condensed cut lets thirteen-line ledger columns hold real names.

### Hierarchy
- **Display** (900, clamp(3.5rem, 7.4vw, 9.5rem), 0.86): the player's name on the stage and the team name in the SOLD takeover. The money numerals on stage use the same face at clamp(4rem, 9vw, 12rem). The home page's league name uses clamp(3rem, 7vw, 5.75rem).
- **Headline** (900, 1.875rem, uppercase, tracking 0.025em): page section heads such as Teams and Squad rules, and empty-state titles (800, 1.5rem).
- **Title** (800, 17px console / clamp(1.4rem, 1.6vw, 2.1rem) stage, 0.95, uppercase): team names in ledger headers, team keys (700, 15px), and dialog titles (700, 1.5rem).
- **Section label** (700, 0.875rem, uppercase, tracking 0.16em, muted ink): the real `h1` or `h2` that names a working region ("On the block", "Squads"). The same treatment at 0.12–0.14em names ledger row groups and the "Season 6 · Player auction" lexicon line.
- **Body** (400, 15px, 1.5): descriptions, hints, and sentences. At 1.125rem on the home page.
- **Label** (600, 0.875rem, muted ink): field labels, legends, and table column heads, in sentence case.
- **Numeral** (600, tabular figures): every number that sits in a column. The body turns tabular figures off, and the `.tabular` utility turns them back on.
- **Ledger entry** (Barlow Condensed 600, 14px console / clamp(1.05rem, 1.25vw, 1.5rem) stage): scorebook names in ledger cells.

### Named Rules
**The Scorebook Name Rule.** In tight ledger cells a player is written the way a scorer writes them: initial and surname ("D. Chaudhari", with the "Dr" title dropped). The full title-cased name stays in the cell as screen-reader text and in the `title` attribute. Wider layouts (the phone stack, the pool list, the stage) use the full name.

**The Shout In Caps Rule.** Big Shoulders is always uppercase, and Barlow is always sentence case. Running text title-cases stored upper-case names ("Khalsa Warriors").

## Layout

The console is a two-column split at `lg` (1024px): the on-the-block panel and sale panel sit in a left column fixed at 24rem (28rem at `xl`), and the squad ledger fills the rest. The shell runs at up to 1920px wide for the console and up to 72rem (max-w-6xl) for the home and players pages, with 16px gutters (24px from `sm`).

The ledger is a CSS grid: a 6.5rem row-header shoulder (9rem on stage) plus one equal column per team. It has one 44px line per squad place, grouped by category in squad order, with a strong rule between groups. Below `lg` the grid gives way to a single ruled stack: one `details` sheet per team that lists its entries and then its open places by category.

The stage is a 100vh composition measured entirely in vw/vh. A photo column sized in vh (36vh, then 52vh at `lg`) sits beside the name block, with a purse strip of equal team columns along the bottom.

Spacing follows the Tailwind 4px scale. The recurring steps are 44px rows and controls, 16/20px panel padding, 12px for inner gaps, and 24/32px between the columns.

**The Ruled Sheet Rule.** Group content into ruled sheets (a strong-rule outer border, hairline inner rules), not into separate cards with gaps between them. Adjacent cells share a border.

## Elevation & Depth

Depth comes from tone. Night, night-2, and night-3 stack as ground, sheet, and banner, and the sticky header is a translucent night (85%) over a 12px backdrop blur. Shadows are rare and always soft and dark, with deep negative spread. They appear only where something genuinely sits over the ground: dialogs, toasts, the stage photo, and the home logo. The primary and danger buttons carry a soft coloured under-glow in their own hue.

### Shadow Vocabulary
- **Overlay** (`box-shadow: 0 30px 80px -20px rgba(0,0,0,0.8)`): dialogs. The scrim behind them is #05081c at 80% with a 2px blur.
- **Toast** (`box-shadow: 0 16px 40px -12px rgba(0,0,0,0.8)`): stacked toasts.
- **Stage photo** (`box-shadow: 0 40px 90px -30px rgba(0,0,0,0.9)`): the on-stage portrait, with a 1px strong-rule ring.
- **Floodlight glow** (`box-shadow: 0 6px 20px -8px rgba(232,49,127,0.7)`): primary button. Danger uses the same shape in ball red.
- **Logo glow** (`box-shadow: 0 30px 70px -25px rgba(232,49,127,0.55)`): the league logo on the home page.

### Named Rules
**The Floodlight From Above Rule.** Atmospheric glow is a radial gradient anchored above the top edge (magenta at 22–32% fading into violet). It never sits behind body content, and it never becomes a panel fill. The SOLD takeover is the one exception: its glow is a centred ball-red radial at 22%.

## Shapes

Corners are small and practical. Controls, fields, and team keys use 4px. Ledger sheets, the sale panel container, toasts, and the SOLD stamp use 6px. Dialogs and photos use 10px. Category tags use 3px, and the ink swatches and open-place outlines use 2–3px. Fully rounded pills are kept for status pills, filter chips, and the stage's full-screen button.

Two silhouettes come straight from the logo and the scorebook. The **banner** is the team name in the SOLD takeover, set on night-3 with a square start, a swallowtail notch at the end (`clip-path: polygon(0 0, 100% 0, calc(100% - 0.35em) 50%, 100% 100%, 0 100%)`), and a magenta underline inset. The **stamp** is a ball-red bordered box rotated −8°, with a doubled inner rule.

Open squad places are drawn as dashed outlines in the category ink at 55% opacity, like empty lines waiting for an entry.

## Components

### Buttons
Firm, condensed, and quick to read under pressure.
- **Shape:** gently squared (4px). Heights are 36px (sm), 44px (md), and 56px (lg), and Barlow 600 is set with slight tracking.
- **Primary:** floodlight deep with white text and a magenta under-glow, brightening to floodlight on hover. Use one per view for the commit action (Record sale, Go to the auction).
- **Secondary (default):** night-3 fill with a strong-rule border. On hover the border lifts to faint ink.
- **Ghost:** muted ink text on no fill, gaining a night-3 fill on hover (Undo, Cancel).
- **Danger / Danger-quiet:** a solid ball fill for the confirming destructive action. The quiet version is a ball outline at 50% with ball-pink text, for the action that opens the confirmation.
- **Focus / Disabled:** the global 2px cream outline at a 2px offset. Disabled buttons drop to 45% opacity.

### Chips
- **Category tag:** a solid category ink with uppercase Big Shoulders in navy text, 3px corners, in four sizes up to a viewport-scaled stage tag. The label is always written out.
- **Filter chip:** a pill with a strong-rule border, a 2px-corner ink swatch, the label, and a tabular count in faint ink. When on, it fills with cream and the text turns night.
- **Status pill:** a 24px pill with uppercase 12px tracked text, in neutral, sold (ball wash), or live (turf wash).

### Cards / Containers
- **Corner Style:** 6px sheets and 10px dialogs.
- **Background:** night-2 sheets and night-3 header bands. The sale panel is night-3 at 40% under a strong top rule.
- **Shadow Strategy:** none on sheets (see Elevation & Depth).
- **Border:** a 1px strong-rule outline with hairline inner rules.
- **Internal Padding:** 16px, or 20px from `sm`. Dialogs use 24px.

### Inputs / Fields
- **Style:** 44px tall, a night well, a 1px strong-rule stroke, and 4px corners at 15px text. The caret is floodlight, and placeholders are faint ink. Selects share the field style and add an SVG chevron.
- **Focus:** the stroke turns cream. The hammer-price field is 56px tall with 24px tabular numerals, framed by a rupee prefix and a "Lakh" suffix.
- **Error / Disabled:** `aria-invalid` turns the stroke ball red, and the message sits below in ball pink. Disabled fields drop to 50%.
- **Field:** a label (600, muted), then the control, then a hint in faint ink or an error in ball pink, all wired with `htmlFor` and aria.

### Navigation
A 64px sticky header in translucent night with a backdrop blur. "SCL" is set in display 900 at 28px, followed by "Season 6" in cream tracked caps. Nav links are Barlow 600 at 15px in muted ink. The active link turns ink and gets a 2px floodlight underline sitting on the header rule. A live dot (turf with a soft halo, ball red while reconnecting) and the edit-access control sit on the right. The footer carries the league line and the "Powered by iotric" mark on a white plate.

### Team Keys (signature)
The sale panel's radio group has one 40px row per team. Each row has a numbered key chip (1–7, matching keyboard shortcuts), the team name in display caps, and "up to ₹X" in cream on the right. When selected, the row border and a 15% fill turn floodlight, and the number chip goes solid floodlight with white text. A team that cannot bid is disabled and states the reason ("Gold full", "Purse too low") in faint ink.

### Squad Ledger (signature)
The ruled 13-line grid. Column headers carry the team name, the purse in cream, the count (2/13), and the max bid when a player is on the block. Filled cells show a category wash, the scorebook name in Barlow Condensed, and the sold amount in cream. Open places in the on-the-block category show as dashed ink outlines. In edit mode, each cell reveals a remove button on hover or focus.

### SOLD Takeover (signature)
On the stage, a sale replaces the view with a full-bleed night panel that holds for 6s. It shows the photo, the player's name, a red stamp that lands with `stamp-in` (520ms, scaling from 1.9× and −14° with a blur to rest at −8°), "to", the team name on the swallowtail banner, and the amount in cream at display scale. When it clears, the new ledger entry plays `ink-settle`: it holds a 55% floodlight fill for the first 30% of 3s, then eases (cubic-bezier(0.33, 1, 0.68, 1)) into its category wash.

### Player Photo
Portrait crops are 4:5 and anchored to the top, sitting on a night-3 well. Without an image, the well shows the player's initials in display 900, sized to the container (38cqmin) in faint ink.

## Do's and Don'ts

### Do:
- **Do** set every rupee amount in cream with tabular figures, formatted in Indian units (₹42 L, ₹1.25 Cr, with no trailing ".0").
- **Do** pair every category ink with its written label, using a solid tag, a 10px swatch plus the label, or screen-reader text for repeated rows.
- **Do** build regions as ruled sheets (a strong-rule outer border and hairline inner rules on night-2) that share borders between cells.
- **Do** size stage type in vw/vh clamps so names and money read from the back of a hall.
- **Do** write names in tight ledger cells as scorebook names ("D. Chaudhari") and keep the full name for assistive tech.
- **Do** keep the cream focus outline (2px, 2px offset) on every interactive element. Motion collapses to 1ms under `prefers-reduced-motion`.
- **Do** read season, league, and team values from season data, never from hard-coded copy.

### Don't:
- **Don't** use ball red for anything but SOLD, destructive actions, and error or offline states.
- **Don't** use cream for counts, labels, or decoration. It means money.
- **Don't** float content in separate shadowed cards with gaps between them, and don't fill panels with gradients. The glow belongs to the top edge.
- **Don't** set Barlow in tracked uppercase as display type, or set Big Shoulders in sentence case.
- **Don't** show the bidding war, lot numbers, or "players remaining" counters on any surface. The screen records results, not the bidding.
