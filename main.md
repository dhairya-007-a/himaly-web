# HIMALAY THERMOPLAST — Technical Architecture & Design System Documentation

> **Official Web Platform & Interactive 3D Product Catalog**  
> **Brand**: Himalay Thermoplast (Morbi, Gujarat, India)  
> **Repository Root**: [`c:\Users\asus\Downloads\himalay-web`](file:///c:/Users/asus/Downloads/himalay-web)  
> **Local Server URL**: [http://localhost:8000/](http://localhost:8000/)

---

## 1. Executive Summary & Purpose

This web application is the unified digital storefront and interactive product catalog for **Himalay Thermoplast**, a plastic household manufacturing enterprise based in Morbi, Gujarat.

The platform bridges corporate identity with interactive 3D digital experiences:
- **Corporate Landing Page**: Full-bleed edge-to-edge layout, responsive modern typography, and fast lead generation.
- **Kinetic 3D Product Ring**: Embedded 3D kinetic harmonic-physics engine for spinning and exploring product collections.
- **Explore by Category stage**: full-screen section that recolours (cobalt / lagoon / mist) as each of 9 categories is picked, with a large product photo. Replaced the old HoverExpand gallery on 2026-11-22 (see Pass 6).
- **Direct Commercial Pipelines**: Lead capture for catalogue download, native `<dialog>` modal for dealer applications, and one-tap WhatsApp/email connectivity.

---

## 2. Directory & File Organization

```
himalay-web/
├── index.html                   # Main production landing page (Full bleed, integrated sections)
├── showcase.html                # Kinetic 3D Interactive Product Ring (Standalone & iframe embedded)
├── main-bg-video.mp4            # Ambient video background for the full-height hero section
├── main.md                      # Comprehensive technical architecture & design specification
├── css/
│   └── style.css                # Global styles, Misty Sea design tokens, and layout resets
├── js/
│   └── main.js                  # Frontend interactions, filters, modals, and HoverExpand scripts
├── images/
│   ├── hero.jpg                 # Fallback cover photo for hero section
│   ├── new-1.jpg .. new-4.jpg   # Product photography for New Arrivals grid
│   ├── product-main.jpg         # Primary image for Featured Product interactive customizer
│   ├── product-thumb-1..4.jpg   # Gallery thumbnails for Featured Product
│   ├── categories/              # Category preview cards for the 13-item catalog grid
│   └── gallery/                 # 9 high-resolution extracted transparent PNG product cutouts
│       ├── item-1.png           # Super Jumbo Bathroom Set
│       ├── item-2.png           # PP Storage Containers 6-Piece Set
│       ├── item-3.png           # PET Container with Spoon Set
│       ├── item-4.png           # Premium Fridge Drinkware Bottle
│       ├── item-5.png           # Himalay Bathroom Patla Stool
│       ├── item-6.png           # Multi-Tier Round Storage Rack
│       ├── item-7.png           # Household Aquvo 4L Water Jug
│       ├── item-8.png           # Heavy Duty 12L Commercial Water Jug
│       └── item-9.png           # Plain Water Dispenser 8L
└── HIMALAY THERMOPLAST PNG FILES/ # Master source directory of 16 categorized manufacturer cutouts
    ├── _01_BATHROOM SET/
    ├── _02_PP_CONTAINER_DONE/
    ├── _03_PET_CONTAINER_DONE/
    ├── _04_FRIDGE_BOTTLE_DONE/
    ├── _05_PATLA_DONE/
    ├── _06_RACK_DONE/
    ├── _07_HOUSE_HOLD_JUG_DONE/
    ├── _08_COMMERCIAL_JUG_DONE/
    ├── _09_10_COMMERCIAL_WATER_BOTTLE_&_DISPENSER_DONE/
    ├── _11_LUNCH_BOX_DONE/
    ├── _12_STORAGE_CONTAINER_ROLEX_/
    ├── _13_STORAGE_CONTAINER_KEEPER_13-5-2026_DONE/
    ├── _15_MIX_SINGLE_PRODUCT_DONE/
    ├── _16_MOP_DONE/
    ├── _17_PADDLE _DUSTBIN_DONE/
    └── _18_CASEROLL/
```

---

## 3. Design System & CSS Token Architecture

The design follows the **Misty Sea** palette tailored for modern household manufacturing:

### 3.1 Color Palette
| Token | Hex / Value | Usage |
| :--- | :--- | :--- |
| `--bg` | `#F4F7F8` | Clean off-white porcelain background for cards and canvas |
| `--surface` | `#D5E3E8` | Soft sea-spray blue accent for download card & borders |
| `--ink` | `#15304F` | Deep dark slate for primary body text and dark backgrounds |
| `--head` | `#1B3B4F` | Navy tone for headers, titles, and hover buttons |
| `--line` | `#8FB3C2` | Ice-line border tone for forms, outlines, and dividers |
| `--tide` | `#4A7C94` | Maritime ocean blue for primary CTA buttons and accent text |
| Full Bleed Navy | `#15304F` | Edge-to-edge dark navy for Features Bar (`.feat`) and Footer (`#contact`) |

### 3.2 Typography
- **Headings & Numbers**: `Cormorant Garamond`, Georgia, serif (500 weight, letter-spacing `0.015em`).
- **Body & Controls**: `DM Sans`, system-ui, sans-serif (400 regular & 500 medium weights, line-height `1.65`).

### 3.3 Layout & Containment Strategy
1. **Edge-to-Edge Full Bleed**:
   - `body`: `margin: 0; padding: 0; background: var(--bg); overflow-x: hidden;`
   - `.wrap`: `width: 100%; max-width: 100%; margin: 0; padding: 0; overflow-x: hidden;`
   - `.card`: `width: 100%; max-width: 100%; margin: 0; border-radius: 0; position: relative;`
   - No outer margins or wrapper padding visible; every section's background color reaches `0px` to the rightmost viewport boundary.
2. **Centered Content Container (`.c-wrap`)**:
   ```css
   .c-wrap {
     width: 100%;
     max-width: 1180px;
     margin-left: auto;
     margin-right: auto;
     padding-left: clamp(16px, 3.5vw, 40px);
     padding-right: clamp(16px, 3.5vw, 40px);
     box-sizing: border-box;
   }
   ```
   This guarantees that on wide monitors (1440px to 4K), text, cards, forms, and product grids remain centered and readable without awkward horizontal stretching.

---

## 4. Component-by-Component Specifications

### 4.1 Majestic Video Hero Section (`#top`)
- **Positioning**: Starts at exact `top: 0`, `left: 0`, reaching both edges of the viewport.
- **Dimensions**: `height: clamp(700px, 92vh, 920px); min-height: 640px;`
- **Background**: Ambient loop video [`main-bg-video.mp4`](file:///c:/Users/asus/Downloads/himalay-web/main-bg-video.mp4) (`autoplay`, `muted`, `loop`, `playsinline`) overlaid with a triple-stop linear gradient (`rgba(21,48,79,.6)` to `rgba(21,48,79,.75)`).
- **Navigation (`nav`)**:
  - Border-bottom spans 100% edge-to-edge.
  - Content wrapped in `.c-wrap .nav-inner` (Logo on the left, anchor navigation in the center, "Become a distributor" button & search icon on the right).
  - Responsive mobile drawer triggered via `#mb` button.
- **Hero Messaging (`.hc-wrap`)**:
  - Positioned at the bottom of the hero inside `.c-wrap`.
  - Eyebrow: `Himalay Thermoplast · Morbi, Gujarat`.
  - Title: `OBJECTS FOR EVERYDAY LIVING`.
  - Action buttons: `Explore 3D Showcase` (smooth scroll to `#showcase`) and `All Products` (scroll to `#catalog`).

### 4.2 Why Himalay Features Bar (`.feat`)
- **Background**: Full-bleed `#15304F` dark navy spanning 100% screen width.
- **Inner Content**: Centered 3-column responsive grid (`.feat-inner`) inside `.c-wrap`.
- **Cleaned Visual Design**: Minimalist and modern; descriptions and numbers have been removed to highlight the core icons and uppercase titles:
  1. **Durability** — Verified security badge SVG
  2. **Recyclability** — Continuous cycle loop SVG
  3. **Go Green** — Botanical eco-leaf SVG

### 4.3 Kinetic 3D Interactive Product Ring Showcase (`#showcase`)
- **Embedded Engine**: Loaded via sandboxed responsive iframe linking to [`showcase.html`](file:///c:/Users/asus/Downloads/himalay-web/showcase.html).
- **Physics**: Zero-dependency harmonic oscillator physics simulation (`STIFF = 95` spring stiffness with critical damping).
- **Interactivity**:
  - Pointer/mouse/touch drag for 3D rotation in perspective space (`preserve-3d`).
  - View switcher: Toggle between 3D Circular Ring and 2D Planar Grid.
  - Standard Cursor: Obtrusive 80px circle overlay removed; standard cursor restored.
  - Minimalist Top Bar: Centered `Himalay®` branding. Removed all mock status symbols (19:6 clock, signal bars, battery, bag tally).
  - "Product" Drawer Trigger: Clicking the "Product" button slides out the left drawer displaying all 25 official Himalay catalog products.

### 4.4 The Official 25 Himalay Catalog Products
The 25 products configured in the interactive catalog:
1. Flower Pattern Container
2. Himalay Cool 8
3. Plain Water Dispenser – 8 Ltr.
4. Plain Water Dispenser(02) – 8 Ltr.
5. Flower Pattern Dispenser – 8 Ltr.
6. Plain Water Dispenser – 10 Ltr.
7. Flower Pattern Dispenser – 10 Ltr.
8. Pedal Dustbin (7 products)
9. Himalay Patla (6 products)
10. Premium Pet Bottle (6 products)
11. Himalay Bucket (5 products)
12. Himalay Rack (5 products)
13. Premium Water Dispenser (5 products)
14. Bucket Set (4 products)
15. Deluxe Bucket Set (4 products)
16. Bath Tub (3 products)
17. Bathroom Stool (3 products)
18. Bathroom Tubler (3 products)
19. Himalay Cool 8 (3 products)
20. Himalay Cool 12 (3 products)
21. Premium Water Jugs (3 products)
22. Water Dispenser (3 products)
23. Instuleted Hot Pot (2 products)
24. Jumbo Container Set (1 product)
25. Pet Container with Spoon Set (1 product)

### 4.5 Skiper 52 `HoverExpand_001` Category Gallery (`#collection-expand`)
- **Component**: Pure Vanilla CSS and JavaScript implementation of the Skiper 52 expanding accordion.
- **Physics & Transitions**:
  - Idle cards: `width: 5rem; flex: 0 0 5rem; height: 24rem; border-radius: 1.5rem;`
  - Active expanded card: `width: 24rem; flex: 0 0 24rem;` with smooth `cubic-bezier(0.4, 0, 0.2, 1)` easing.
  - Active card exhibits elevated shadow (`box-shadow: 0 16px 36px rgba(21, 48, 79, 0.16)`) and subtle `scale(1.04)` image zoom.
  - Bottom vignette gradient overlay fades in with category title and collection code badge.
- **9 Extracted Product Cutouts**:
  - Card 0: `images/gallery/item-1.png` — **Bathroom Set** (`# 01 · Bath Collection`)
  - Card 1: `images/gallery/item-2.png` — **PP Containers** (`# 02 · 6-Piece Set`) *(Default active)*
  - Card 2: `images/gallery/item-3.png` — **PET Container** (`# 03 · Pantry Spoon Set`)
  - Card 3: `images/gallery/item-4.png` — **Fridge Bottle** (`# 04 · Premium Drinkware`)
  - Card 4: `images/gallery/item-5.png` — **Himalay Patla** (`# 05 · Bathroom Stool`)
  - Card 5: `images/gallery/item-6.png` — **Storage Rack** (`# 06 · Multi-Tier Round`)
  - Card 6: `images/gallery/item-7.png` — **Household Jug** (`# 07 · Aquvo 4L`)
  - Card 7: `images/gallery/item-8.png` — **Commercial Jug** (`# 08 · Heavy Duty 12L`)
  - Card 8: `images/gallery/item-9.png` — **Water Dispenser** (`# 09 · Plain Dispenser 8L`)

### 4.6 New Arrivals Grid (`#new`)
- 4-card responsive product showcase:
  - Flower Pattern Container
  - Himalay Cool 8
  - Plain Water Dispenser, 8 Ltr.
  - Flower Pattern Dispenser, 10 Ltr.
- Features hover-zoom imagery, outbound links, and direct modal trigger buttons (`data-enq="..."`).

### 4.7 Featured Product Interactive Customizer (`#product`)
- Highlighted product: **Flower Pattern Dispenser**.
- **Interactive Thumbnails**: 4 preview angles swapping into the primary display element (`#main`).
- **Interactive Color Swatches**:
  - *Tide blue* (`#4A7C94`)
  - *Sea glass* (`#8FB3C2`)
  - *Foam* (`#F4F7F8`)
  - Toggling swatches dynamically updates CSS custom properties `--ph1` and `--ph2` on the main card background.
- **Quantity Selector**: Accessible increment (`#qp`) / decrement (`#qm`) inputs with validation bounds (1 to 999).
- **Expandable Accordion Specs**: Native `<details>` toggles for Specifications, Dimensions, and Distributor logistics.

### 4.8 Search & Category Catalog (`#catalog`)
- Real-time instant search input (`#q`) filtering 13 official manufacturer categories:
  - Deluxe Bucket Set, Bucket Set, Insulated Hot Pot, Jumbo Container Set, Pet Container with Spoon Set, Bath Tub, Bath Bucket, Bathroom Stool, Bathroom Tumbler, Pedal Dustbin, Premium Pet Bottle, Premium Water Jugs, Premium Water Dispenser.
- Live accessible status counter (`#cn`) announcing filtered results dynamically.

### 4.9 Catalogue Download Section (`#download`)
- Full-bleed `--surface` (`#D5E3E8`) background section.
- Direct lead generation form (`#df`): Captures Name (`dn`) and Phone number (`dp`).
- On submit, renders instant confirmation message and digital catalogue link button (`CAT`).

### 4.10 Become a Distributor Modal (`#dd`)
- Native accessible HTML5 `<dialog>` component with backdrop blur.
- Dual submission paths:
  1. **Direct Email Dispatch (`#cf`)**: Automatically formats user payload (Role, Name, Business, Phone, Email, City, Product, Message) into a pre-filled `mailto:himalaythermoplast@gmail.com` enquiry.
  2. **WhatsApp Direct Connect**: One-click direct link to official business WhatsApp channel (`+91 99790 11141`).

### 4.11 Full-Bleed Navy Footer (`#contact`)
- Background: `#15304F !important` full-bleed edge-to-edge dark navy.
- 4-column responsive grid inside `.c-wrap`:
  - **Company Identity**: Himalay logo, mission statement, Instagram and Facebook links.
  - **Quick Links**: Section anchors and distributor modal trigger.
  - **Product Categories**: Deep links to official online categories.
  - **Contact & Factory Location**:
    - Address: *Dharti Industrial Estate, Plot No. 12, Rajpar – Khanpar Road, Morbi – 363641, Gujarat, India*
    - Phone: `+91 99790 11141`
    - Email: `himalaythermoplast@gmail.com`
- Bottom bar (`.fb`): Copyright notice and location declaration.

---

## 5. Local Development & Deployment

### Running Locally
To launch and view the site locally with Python's HTTP server:
```powershell
cd c:\Users\asus\Downloads\himalay-web
python -m http.server 8000
```
Open your browser to: **`http://localhost:8000/`**

If a page looks old after a change, hard-refresh with **Ctrl+Shift+R** (the browser caches CSS/JS).

### Live site (GitHub Pages)
- Repo: `dhairya-007-a/himaly-web`, branch `main`, served from the repo root.
- URL: **https://dhairya-007-a.github.io/himaly-web/** · products: `/products.html`
- Deploy = commit + `git push origin main`; Pages rebuilds in ~1 minute. Check with `gh api repos/dhairya-007-a/himaly-web/pages/builds/latest`.

### Updating products
1. Put the transparent PNG in `HIMALAY THERMOPLAST PNG FILES/` (not in git, 2.4 GB).
2. Add/adjust its line in `tools/build_catalog.py` (`PRODUCTS`, `CATEGORIES`).
3. `python -X utf8 tools/build_catalog.py` → writes `images/p/` and `js/catalog-data.js`.
4. Commit both, push.

### Production Characteristics
- **No build step for the site itself**: pure HTML, CSS and JavaScript. Only the product catalogue is generated (Python + Pillow, run by hand when photos change).
- **Asset Self-Sufficiency**: All local images and scripts are self-contained within the project root.
- **Responsive Viewport Support**: Tested and verified across desktop (1440px+), tablet (820px), and mobile (375px - 520px) screens.

---

## 6. Changelog — Session Work Log

### 2026-11-21 — Pass 1: Fullscreen, smoothness, glass buttons
- `.hero` changed from a clamped `92vh` box to true `100vh`/`min-height:100vh` at every breakpoint — real fullscreen landing.
- `#showcase` iframe wrapper pulled out of `.c-wrap` so it is edge-to-edge full width and `100vh` tall, border/box/grey-bg removed — the 3D ring now reads as part of the page instead of a boxed widget.
- `#collection-expand` (Explore By Category) gallery: tile images switched `object-fit:contain` → `cover` with a `scale(1.1 → 1.18)` zoom so the product image fills the full tile instead of floating on a radial-gradient backdrop; expand transition eased to `cubic-bezier(.16,1,.3,1)` at .55–.6s for a smoother feel; added momentum/smooth scroll on the row.
- Removed the `# 01 · Bath Collection`-style code labels from all 9 gallery cards (kept just the title).
- Global easing pass: `.btn` and `.ph img` hover transitions moved to eased cubic-bezier curves with a subtle lift on buttons.
- Added a CSS frosted-glass `.btn.glass` utility (backdrop-filter blur+saturate, translucent border, inset highlight — a plain-CSS stand-in for a React/WebGL `GlassSurface`, since this project has no build step) and applied it to the hero CTAs, the nav "Become a distributor" button, and the distributor-modal action buttons.

### 2026-11-21 — Pass 2: Real product photos in the 3D ring + category background
- **Interactive 3D ring (`showcase.html`) was still the original Skiper demo**: it pulled 9 fashion/clothing model cutouts from a remote CDN (`d8j0ntlcm91z4.cloudfront.net`) with clothing items (tops, jeans, shoes, sizes S/M/L, $ pricing). This has been fully replaced:
  - `CUTS` array now points at the 9 local Himalay product cutouts in `images/gallery/item-1.png` … `item-9.png` (same assets used by the Explore By Category gallery, so the ring and the gallery are visually consistent).
  - `px()` helper simplified to just return the local path (no more remote CDN/query-string wrapping).
  - `LOOKS` array renamed from clothing "fits" (Somewhere Else, Dial-Up, Rewind…) to the real 9 product categories: Bathroom Set, PP Containers, PET Container, Fridge Bottle, Himalay Patla, Storage Rack, Household Jug, Commercial Jug, Water Dispenser — each with one product item instead of a 3-piece clothing outfit.
  - `CLOTH`/`SHOE` size arrays removed (no more S/M/L or shoe sizes); everything uses `ONE` ("One size").
  - `money()` now returns **"Price on request"** when price is `0` (matches the rest of the site's copy) instead of printing `$0`; the "Add whole fit to bag" / subtotal / dealer-discount panel in the side drawer was reworded to "Add to enquiry list" / "Price" / "Dealer discount" so it reads as an enquiry tool, not a clothing checkout.
  - Removed the now-unused `SHEETS` sprite array (walking-figure sprite sheet for clothing) and simplified the "pieces" thumbnail renderer to show the product cutout directly instead of a 3×3 sprite crop.
  - Deck intro copy changed from "Stay out of the loop, pal." to "Objects for everyday living." (matches the hero headline); hint text changed from "shop the item" to "enquire".
- **Image weight fix**: the 9 gallery PNGs (also now used by the ring) were raw manufacturer exports at up to **7952×5304px and 17MB each**. Downscaled to a 1600px long edge and re-optimized — now 0.4–1.2MB each (10–20× smaller), which is most of the "make it smooth" win since those files were blocking first paint on both the gallery and the ring.
- **Explore By Category background**: user-uploaded `Explore By Category-bg.jpeg` moved into `images/category-bg.jpg` (re-encoded to JPEG q85). Wired in as the `#collection-expand` section background via `linear-gradient(navy scrim) + url(...) center/cover`, so the existing Misty Sea navy palette sits as an overlay on top of the photo — no new colors introduced, just a photographic backdrop behind the gallery row. Header text (`eyebrow`, `h2`) recolored light (`#8FB3C2`/`#F4F7F8`) for contrast against the new background; `background-attachment: fixed` disabled on mobile (`scroll`) to avoid iOS jank.

### 2026-11-21 — Pass 3: Real photos everywhere, white-bg fix, ring size, section redesign, deploy prep
- **Audit found New Arrivals / Featured Product / Our Products (13 category tiles) were all showing nothing.** Every `<img>` in those three sections pointed at a `.jpg` that never existed on disk (`images/new-1.jpg`…`new-4.jpg`, `images/product-main.jpg`, `images/product-thumb-1..4.jpg`, `images/categories/*.jpg`) — the `onerror="this.remove()"` fallback was silently deleting all of them, so those sections had been rendering as empty boxes this whole time.
- Sourced real photos for all of them from `HIMALAY THERMOPLAST PNG FILES/` (266 master PNGs across 16 category folders), picked the best representative shot per slot, auto-cropped the transparent-cutout bounding box, resized to the actual on-page display size (categories/new-arrivals ~760–900px long edge, featured-product main/thumbs 700–1000px — the originals were full manufacturer exports, several at 4500×3002 and up), and re-saved optimized. Total new-asset weight: ~9.4MB across 21 images (was 27MB before the second size pass), and everything is `loading="lazy"` so only what scrolls into view is fetched. New files live at `images/new-1..4.png`, `images/product-main.png`, `images/product-thumb-1..4.png`, `images/categories/*.png` (13 files) — all references in `index.html` switched from the dead `.jpg` paths to these `.png` ones.
  - Featured Product thumbnail `alt` text was claiming "front view / side view / detail / in use" for what are actually four different colour-cutout photos (no multi-angle photography exists for this product) — reworded to describe what's actually shown (colour options) instead of a false claim.
  - New Arrivals' 4th card ("Flower Pattern Dispenser, 10 Ltr.") and Our Products' "Premium Water Dispenser" tile currently share the one dispenser photo we have — there's no 10 Ltr-specific or jug-specific shot in the source folder for every slot; flagged below.
- **Fixed the white background behind Explore By Category tiles**: `.hover-expand-card` had `background:#fff`, and the product photos are genuine alpha-transparent cutouts (verified: corner pixels are `(0,0,0,0)`) — so every bit of padding around the product rendered as a visible white box once the tile switched to `object-fit:cover`. Swapped the card background to a frosted navy glass (`rgba(21,48,79,.3)` + `backdrop-filter:blur(6px)`) matching the rest of the glass treatment — no more white shade, and it now reads as one surface with the new photo background behind it.
- **Interactive Product Ring background**: moved the uploaded `Interactive Product Ring-bg.jpeg` to `images/showcase-bg.jpg` and added it as a `.deck::before` layer inside `showcase.html` — `blur(26px)` + `opacity:.6`, sitting behind the (opaque) product cutouts so the ring stays sharp while the backdrop is a soft blurred photo instead of flat `#ececec` grey. Palette untouched (`--studio`/`--ink` tokens unchanged) — this is a texture layer under the existing color, not a new color.
- **Bigger ring images**: the model height was already computed from the stage's actual pixel height (`modelH = (stageHeight - padding) / 1.12`), so making the showcase section full-viewport in Pass 1 already grew it — tightened further by trimming `topPad`/`bottomPad` (136/120 → 116/104) and changing the divisor to `0.98`, so each product cutout now claims noticeably more of the stage.
- **Redesigned New Arrivals**: was 4 equal tiles, now an editorial asymmetric grid — the first item (Flower Pattern Container) spans a tall 2-row feature tile with its caption overlaid on a navy gradient at the bottom, the other 3 sit beside it in a narrower column. Collapses to 2-col then 1-col on mobile.
- **Redesigned Our Products grid**: each tile now gets a glass "View range →" overlay (navy + blur) that slides up over the image on hover/focus instead of a plain text link underneath, plus a `translateY(-4px)` lift on hover — same interaction language as the glass buttons from Pass 1, no markup duplication (done with a CSS `::after`, the real link underneath still works for keyboard/no-hover).
- **Added a scroll-reveal animation** (the "quick animation" ask): `.tile`, New Arrivals cards, and the three Durability/Recyclability/Go Green feature blocks now fade-and-rise into view via `IntersectionObserver` as you scroll to them, staggered ~70ms apart per item (`js/main.js`). Falls back to instantly-visible if `IntersectionObserver` is unavailable; respects the existing global `prefers-reduced-motion` kill-switch in `css/style.css`.
- **Deploy prep**: initialized a git repo and made the first commit (45 files, `05fea16`). `.gitignore` excludes the `.claude-flow/` and `.remember/` tool-internal caches, OS junk, **and the `HIMALAY THERMOPLAST PNG FILES/` master folder** — that folder alone is 2.4GB of raw unoptimized manufacturer exports; committing it made `git add -A` hang and would make the repo nearly impossible to push. Confirmed with you first: the folder stays on disk untouched (nothing deleted, all photos still there), it's just not version-controlled, since every photo actually used on the site is already committed in `images/` at web-appropriate sizes. Tracked repo is ~50MB (site + optimized images + the 34MB hero video). First `git add -A` attempt (before the PNG folder was ignored) left ~1GB of orphaned loose objects in `.git/objects`; cleaned with `git gc --prune=now`. Nothing pushed to a remote yet — that needs a GitHub repo URL from you.

### 2026-11-22 — Pass 4: Claude Code skills installed (tooling, not site code)
Installed via `npx skills add <repo> --skill <name>` (the [skills.sh](https://skills.sh) CLI), all passed their Gen/Socket/Snyk risk checks (Safe or Low Risk except `hallmark` at Med Risk on the Gen score — worth a glance at its skills.sh page before leaning on it):
- **interface-design** (`Dammyjay93/interface-design`) — craft-first UI design skill for dashboards/admin/SaaS/tools; its own description says it's *not* for marketing/landing pages, so it doesn't apply to this site.
- **hallmark** (`nutlope/hallmark`) — "make it look designed, not generated" skill for *new* builds; explicitly opts out of touching existing designs unless invoked by name (`/hallmark redesign <path>`), so won't auto-apply here either.
- **mobile-native** (`emilkowalski/skills`, skill `mobile-native`) — the actually-relevant one: fixes for the "feels like a website, not an app" gap on phones (100vh bug, tap-highlight flashes, sticky hover states, inputs that zoom the page, notch/safe-area, etc.). Worth running a pass with this over `index.html`/`showcase.html` given the site is mobile-first for a manufacturer catalogue — not done yet this session.

All three ended up installed **globally** (`~/.agents/skills/`, re-run with `-g` after the first project-local install), so they're available in every project, not just this one. Project-local copies were initially created in `himalay-web/.agents/skills/` before the global reinstall — those are redundant now but harmless, and `.gitignore` already excludes `.agents/`, `.claude/`, and `skills-lock.json` so none of this tooling noise reaches the repo.

### 2026-11-22 — Pass 5: Logo + favicon (`8286390`)
- `logo/himalaya-new-logo.png` replaces the text wordmark in the index nav + footer and the showcase header + receipt slip. Footer copy is turned white with `filter:brightness(0) invert(1)` because blue/teal on the navy footer was unreadable.
- `logo/fvicon-icon.png` (192×192) is now the favicon and apple-touch-icon on both pages (was a 💧 emoji SVG).

### 2026-11-22 — Pass 6: Redesign, Explore by Category → footer (`1e7d7b5`)
Built first as `preview.html`, approved, then promoted to `index.html`. Hero, feature strip and 3D ring were left as they were (on request).
- **Design tokens** (`css/redesign.css`, everything scoped under `.rx`): colours sampled from the logo — cobalt `#488ACF`, deep cobalt `#2C6198`, lagoon `#41BCCF`, ink `#15304F`, paper `#F5F8FB`, mist `#E3ECF4`. Type: Archivo (variable width + weight) — wide heavy headings echo the blocky logo letters; sentence case, no all-caps eyebrows.
- **Explore by Category**: the signature section. Big type index of 9 categories on the left, product photo on the right; the *whole section* background changes colour per category (`data-tone` on the `<section>`, set in `js/redesign.js`). Text, marker bar and button flip light/dark per tone. Phones: names become swipeable pill buttons under the photo.
- Catalogue download is a full-width cobalt band; footer opens with the factory phone number in large type; enquiry dialog restyled to match.

### 2026-11-22 — Pass 7: Bigger ring, new sections, product sheet removed, speed + mobile pass
- **Interactive Product Ring — images much bigger** (`showcase.html`). Root cause: each ring slot was a tall 4:7 portrait box, but the product cutouts are landscape (~3:2), so `object-fit:contain` shrank every product to roughly a third of its slot. Slots are now 3:2 (`MODEL_AR` constant, used by ring, grid and focus views), the front item is up to 40% of stage height (30% on phones) capped so it never spills sideways, and the ring is wider.
- **Featured product section deleted** (Flower pattern dispenser spec sheet with price/colour/qty) — markup and CSS removed.
- **New arrivals redesigned**: each product on its own colour panel (deep / lagoon / mist, same language as the category stage), big photo with soft drop shadow, name + one-line description + Enquire button. 4 across on desktop (first one wider for the wide storage-jar set), 2×2 on tablet, swipe carousel on phones. Captions written from what each photo actually shows.
- **Every category redesigned**: taller 4:5 photo tiles in three alternating soft tints, product much larger, name inside the tile, product count as a pill; whole tile is the link. 4 / 3 / 2 columns for desktop / tablet / phone.
- **`js/main.js` rewritten** with null-guards on every element (old version crashed the rest of the script if any section was removed — deleting the product sheet would have broken search, the enquiry dialog and the forms). Enquire buttons now use one delegated click handler that reads `data-enq` at click time. The scroll-reveal animation was removed (its CSS would have left the feature strip invisible, and it hid content until scrolled).
- **Speed**:
  - Product photos converted to WebP and resized to display size: **14.6 MB → 1.3 MB** (gallery 1200px, categories 640px, new arrivals 900px). Original PNGs kept on disk; both pages now point at the `.webp` files (all modern browsers).
  - Hero video `preload="auto"` → `preload="metadata"`, and it now pauses when scrolled off-screen (saves CPU/battery). The file itself is still **34 MB** — see follow-ups.
  - Google Fonts merged into one request with `preconnect`.
  - Category stage preloads its 9 photos only when you scroll within ~600px of it (was: on page load).
  - ~230 lines of dead inline CSS removed (old HoverExpand gallery, old New Arrivals grid, old product grid, scroll-reveal).
  - Removed the `images/hero.jpg` fallback `<img>` that 404'd on every page load.
- **Robustness**: photo areas use absolutely-positioned `object-fit:contain` images so they size the same in every browser (percentage `max-height` inside flexible grid rows is unreliable). Tap targets ≥44px on phone pills. Reduced-motion turns off all transitions in the new sections.
- Checked: no broken `#anchors`, no missing files referenced by either page, all JS parses. **Not yet checked visually in a real browser by Claude** (browser extension not connected) — verify on desktop, tablet and phone.

### 2026-11-22 — Pass 8: Durability / Recyclability / Go green strip redesigned
- Old navy bar with thin outline icons + all-caps serif labels replaced by three full-width colour panels (deep cobalt / lagoon / mist — the same tones as the category stage), each with a heavier icon and an Archivo heading (explanation lines removed on request — icon + word only, centred on one row). Desktop/tablet: 3 across; phones (≤760px): stacked rows, icon left of text.
- Markup: `<section class="rx-feat">` in `index.html`; styles at the top of `css/redesign.css`. Old `.feat` inline CSS removed.

### 2026-11-22 — Pass 9: Ring photos toned down
- Pass 7 made the front ring item too large. Front item now up to 32% of stage height on desktop (was 40%) and 25% on phones (was 30%); width cap 34% / 52% of stage width (was 42% / 62%). Still roughly 2× the original pre-Pass-7 size. Tweak in `showcase.html` → `layoutRing()` → `frontH`.

### 2026-11-22 — Pass 10: New arrivals → "Fresh off the line" conveyor
- Colour-panel cards (Pass 7) replaced: they repeated the category stage's look. New arrivals now ride a moving conveyor belt — product cutouts standing on a dark striped belt that scrolls in step with them, caption (name, one line, Enquire) under each. Factory-floor idea, fits a manufacturer.
- Loop: the 4 items are duplicated (copies are `aria-hidden` + `inert`, so screen readers and keyboard see each product once) and the track slides −50% over 46s (36s on phones). Pauses on hover, keyboard focus, tap on empty belt space (`is-paused`, `js/redesign.js`), and automatically when scrolled off-screen (`is-offscreen`).
- Reduced motion: belt stands still, becomes a normal horizontal scroller, duplicates hidden.
- Markup `section.rx-line` in `index.html`; CSS section 2 of `css/redesign.css`. Speed/size knobs: `--speed`, `--item-w`, `--obj-h` on `.rx-line__belt`.

### 2026-11-22 — Pass 11: Catalogue band made compact
- "Get the full catalogue" band cut to roughly a third of its height: padding 32–48px (was 56–112px), heading 26–38px (was up to 92px), one-line description. Desktop: heading left, name + phone + button on one row right. Tablet: heading above the row. Phone: fields stack. Labels kept for screen readers (visually hidden), placeholders show on screen.

### 2026-11-22 — Pass 12: Belt you can scroll, 10 new products, ring title, smaller footer call
- **New arrivals belt** now has **14 products**. 10 new photos taken from the master folder (`HIMALAY THERMOPLAST PNG FILES/`), auto-cropped to the product, resized to 900px, saved as WebP in `images/new/` (30–150 KB each): Bento, Munch, Mello and Study Snack lunch boxes, insulated casserole set, Rolex and Keeper clear storage sets, spin mop, pedal dustbin, 21 L commercial jug. Mixed in with the original 4 so colours alternate.
- Belt rebuilt as a **real horizontal scroller**: swipe on touch, drag with the mouse, trackpad/wheel, left/right keys, and new round **‹ › arrow buttons** (one product per press). It still glides on its own (38 px/s, `js/redesign.js` sets `scrollLeft` each frame); any user input pauses gliding for 2.5 s, hovering pauses it, and it stops when off-screen. The striped belt is now drawn on the track itself, so it moves exactly with the products. A drag never triggers a click on a product link. Seamless loop via the duplicated second half (`aria-hidden` + `inert`).
- **Interactive Product Ring**: the header above the iframe ("Interactive 3D Showcase" label, title, and the "Drag to spin ring · Toggle Ring / Grid · Tap Product for 25-item list" hint) is deleted. The title now sits **inside the ring**, in its centre, replacing leftover template copy "Stay out of the loop". Screen-reader heading/labels updated to match.
- **Footer call block** shrunk to one line: "Dealer or distributor? Call the factory." + phone in normal-size bold (was up to 64px) + small "Become a distributor" button. Footer top padding reduced.

### 2026-11-22 — Pass 13: "All products" redesign (main catalogue)
- Was "Every category": 13 identical tiles. Now **All products** with **22 ranges**: the 13 from himalaythermoplast.com plus 9 the factory makes but the site didn't show — bathroom sets (13 sets), patla, lunch boxes (5 ranges), casserole set, storage containers (Rolex/Keeper), storage rack, commercial water jugs (12–21 L), fridge bottle, spin mop. Photos reuse the optimised WebPs already in `images/`.
- **Room filters** (All · Bathroom · Kitchen & storage · Water · Cleaning) work together with **search**; search also matches extra keywords per tile (e.g. "tiffin" finds lunch boxes, "bin" finds pedal dustbin). Live count ("22 ranges"), and an empty state with "Show all products" when nothing matches. Logic in `js/redesign.js` (search removed from `main.js`).
- **Mixed-size grid**: wide group photos (bathroom set, storage containers, PET containers, pedal dustbin) span two columns; `grid-auto-flow:dense` fills gaps. 4 / 3 / 2 columns for desktop / tablet / phone.
- Each tile: tinted photo panel, name, count/detail line, and an action — **View range** (opens the category on the main site) or **Enquire** (opens the enquiry form with the range pre-filled) for ranges with no page there yet. The whole tile is the click target. Hover lifts the tile and fills the action button.
- Phones: filter chips become one swipeable row, search goes full width, action button moves under the name.
- Nav/footer link text "All categories" → "All products".

### 2026-11-22 — Pass 14: Best sellers, About + GST certificate, reviews (content parity with live site)
Compared against himalaythermoplast.com (home, about, products, category, product, catalogue, contact pages). Added the three gaps picked by the owner:
- **Best sellers** (`#best`, after New arrivals): the live site's 5 best-selling dispensers — Plain 8 L, Plain (02) 8 L, Flower pattern 8 L, Plain 10 L, Flower pattern 10 L — linked to their real product pages, each with Enquire. Shown **to scale** on a dark band: 8 L photos at 80% of the 10 L height, capacity badge under each. Phones/tablets: swipe row.
  - ⚠️ No real photo of a *flower-pattern* dispenser exists (the live site uses stand-ins too). Using the clear plain dispenser for the 3 plain ones and the "Himalay Gold" insulated dispenser (green / orange) for the 2 flower-pattern ones. Replace when real photos exist.
- **About Himalay** (`#about`, after All products): what the company makes, where (Morbi), recyclable material + checked before dispatch, supplies dealers/distributors/shops. Facts: 22 ranges, 64+ products (live site count), factory in Morbi. No founding year / capacity / owners — not provided.
- **GST certificate** beside About: card with a tilted preview of the certificate, registered name **Himalay Thermoware LLP**, GSTIN **24AARFH8821R1ZI**, LLP, registered since 27 March 2025, and "View certificate (PDF)". GSTIN + legal name also added to the footer's bottom line.
  - Only **page 1** is published (`docs/gst-certificate.pdf`, preview `images/gst-certificate.webp`). Page 3 of the original lists the designated partners with names and photos — kept off the site. The original `GST CERTIFICATE.pdf` is in `.gitignore`.
- **Reviews** (`#reviews`): the 3 testimonials from the live site, verbatim (Neha Sharma, Rajesh Kumar, Anjali Verma), as cards on a mist band. Note they say "Himalay Plastics".
- Nav: "About" added; footer "On this page" gets "About us".

### 2026-11-22 — Pass 15: Address confirmed
- Owner confirmed the site address: **Dharti Industrial Estate, Plot No. 12, Rajpar – Khanpar Road, Morbi – 363641 (Guj.) INDIA**. Footer now uses exactly this wording and line breaks. (The GST certificate lists a different registered address; the certificate itself is unchanged and the card on the site shows only name, GSTIN, type and date.)

### 2026-11-22 — Pass 16: Bigger footer
- Footer enlarged: text 16–18px (was 15px), column headings 18–21px heavy, logo 56–72px tall (was 48px), more padding top (56–96px) and between columns/rows, bottom line 14px. The one-line "Call the factory" block stays compact.

### 2026-11-22 — Pass 17: Reviews made richer
- "What customers say" cards now use the site's three tones (deep cobalt / lagoon / white), each with a crisp quote mark at the top and a large faint one in the corner, bigger review title + text, and a round initials badge beside the name. Middle card sits lower on desktop for rhythm; cards lift on hover. Subtitle added under the heading. Review wording unchanged; no star ratings added (none exist on the live site). Phones/tablets: stacked.

### 2026-11-22 — Pass 18: Best sellers rebuilt as a ranked top 7
- Replaces Pass 14's five-dispenser row (and its stand-in flower-pattern photos). Now one best seller from each range, ranked 01–07 on the ink band:
  - **01 Super Jumbo bathroom set** (11 pcs, 9 colours) — big lagoon hero card spanning two rows, huge "01" numeral, description and a full "Enquire about this set" button.
  - **02–07** in a 3×2 grid beside it: Cool 12 jug, Commercial jug 18 L, Water dispenser 8 L, Mello box, Paddle dustbin, Spin mop — tag, name, one-line detail, Enquire link.
- Photos: 7 new trimmed WebP cut-outs in `images/best/` exported from `HIMALAY THERMOPLAST PNG FILES` (with `width`/`height` set to prevent layout shift).
- Header: new subtitle + "See all products" link to `#catalog`.
- Responsive: tablet = hero full-width (photo beside text) + 3 columns; phone = hero stacked with full-width button + 2 columns. Card photo area is `flex:1`, so Enquire links line up even when a name wraps.
- Verified in Chrome at 1535 / 900 / 390 px: all images load, no horizontal scroll, Enquire opens the dialog pre-filled with the product.
- `.gitignore`: added `.claude/settings.local.json` and `.playwright-mcp/` (local screenshot folder).

### 2026-11-22 — Debug + security check
- **Debug:** full-page scroll on localhost: 0 console errors, 0 broken images, all local `src`/`href` paths exist, all 54 Enquire buttons wired to one dialog. Only oddity: local `python -m http.server` sometimes answers 503 on the 34 MB hero video before serving it (206) — local server limit, not a site bug; GitHub Pages serves it normally.
- **Security:**
  - No API keys, tokens, passwords or private keys in tracked files.
  - Full `GST CERTIFICATE.pdf` (partner names/photos) and `.claude/` stay untracked; only page 1 is published.
  - Every `target="_blank"` link has `rel="noopener"`.
  - No third-party scripts or iframes (only Google Fonts CSS).
  - `innerHTML` in `showcase.html` only renders hardcoded product arrays — no URL, storage or form input reaches it, so no XSS path.
  - Enquiry form builds a `mailto:` with `encodeURIComponent` — no injection.
  - Not done: a Content-Security-Policy. GitHub Pages can't send headers; a `<meta>` CSP would need `'unsafe-inline'` (inline styles/scripts in both pages), so little gain for a static brochure site with no logins or user data.

### 2026-11-22 — Pass 19: Every product on our own site (no more links to the old website)
- **New page `products.html`** with three views, all on this site:
  - `products.html` — all 15 ranges as tiles, room filter (Bathroom / Kitchen & storage / Water / Cleaning) + search (names, codes like `HT-01`, keywords).
  - `products.html?c=<range>` — every product in that range; colour dots under each card preview that colour's photo on hover/tap.
  - `products.html?p=<product>[&v=<colour>]` — product page: big photo, every colour as a swatch (swaps the photo and updates the URL so a colour can be shared), extra angles as thumbnails, code/size/pieces facts, **Enquire** (form pre-filled with code + name + colour) and **Ask on WhatsApp** (message pre-filled the same way), then "More in this range".
- **All 266 factory photos** from `HIMALAY THERMOPLAST PNG FILES` used: trimmed and converted to WebP at 1200 px + 520 px → `images/p/<product>/<colour>.webp` (33 MB total, was 2.4 GB). Result: **15 ranges, 63 products, 245 colours, 262 photos.** Left out on purpose: one CMYK duplicate, two non-final casserole shots, one mixed group photo.
  - Photo checks that changed the data: the "SINGLE PRODUCT – BLUE – BUCKET" and "BROWN – 35 LTR" photos are tubs (→ *Bath tub*); the grey/light-pink "paddle dustbin" singles are a printed model (→ *Printed paddle dustbin*); `_05_PATLA_DONE/NEW/` holds extra patla colours with wrong file names (round: cream, baby pink, light grey; square: brown, coco, grey); `_18_CASEROLL/DSC…` is a second, plain casserole set (brown / green / black, 4 angles each); Cool 12 `IMG-…WA0004/5` are brown and dark grey.
- **`tools/build_catalog.py`** is the single source: it maps folders → ranges → products → colours, exports the images and writes `js/catalog-data.js`. Add a photo → edit one line → re-run (see `images/README.txt`).
- **Home page links now stay on the site:** nav "Our Products" + hero "All Products" → `products.html`; New-arrivals titles, Best-seller cards (whole card clickable) and "See all 9 colours" → their product pages; Explore-by-category stage gets a **View range** button that follows the selected range; All-products tiles on the home page are generated from the same data and open the range page; footer "Popular" → range pages; About facts read from the data (15 ranges, 63 products). The catalogue form now asks the factory for the PDF on WhatsApp and links to `products.html` (it used to send people to the old site's download page).
- **Fixes:** removed the thin white line under the landing-page menu bar (`nav` border in `css/style.css`); clicking a name in "Explore by category" no longer opens the enquiry form (buttons used `data-enq`, now `data-range`); the hidden "Search products" label no longer peeks in at the left edge on wide screens.
- **Structure clean-up:** removed `himalay-site/` (an old copy of the whole site that GitHub Pages was still publishing at `/himalay-site/`) and 46 unused images (old category/gallery PNGs, product thumbs, `category-bg.jpg`, the old best-seller dispensers). All recoverable from git history.
- **Checked:** every link on `index.html` and `products.html` resolves to a real product, range or section; all 524 image files load; all 80 page variants (15 ranges, 63 products, not-found, and a script-injection attempt in the URL) render without errors; phone width 390 px has no sideways scroll, 2-column cards, 1-column product page.

### 2026-11-23 — Pass 20: Native feel on phones and tablets
- **Stuck hover fixed:** on a phone, a tap triggered the hover effect (lifted cards, zoomed photos) and it stayed stuck. Every `:hover` rule in `css/style.css`, `css/redesign.css`, `css/products.css`, `index.html` and `showcase.html` is now wrapped in `@media (hover:hover) and (pointer:fine)`, so mice and trackpads keep it and fingers don't. Done by `tools/gate_hover.py` (safe to re-run). The New arrivals belt (`.rx-line`, `.rx-arrow`) was left exactly as it was, on request.
- **New `css/mobile.css`** (loaded last on `index.html` and `products.html`): no grey tap flash, no 300 ms tap delay (`touch-action: manipulation`), long-press doesn't select button labels, inputs are 16 px on touch screens so iOS stops zooming into the forms, 44 px tap targets for the search/menu icons and dialog close, press-down feedback (`:active`) on buttons/cards/chips, notch and home-bar padding (`env(safe-area-inset-*)`), `100dvh` dialog, tablet 3-column product grid between 641–900 px.
- **Heights:** hero, 3D ring frame and "Explore by category" use `svh` instead of `vh`, so the mobile address bar no longer pushes the bottom of the hero off screen.
- **Bug fixed — "Explore by category" was 1,300 px wide on phones/tablets:** the single-column grid used `1fr`, which can't shrink below the 1600 px photo inside it. Changed to `minmax(0,1fr)` for every single-column grid in `redesign.css` and `products.css`.
- **Status bar colour:** `theme-color #15304F` added to both pages.
- **Checked (Playwright, Chromium):** 360, 390, 768, 1024 px on home, a range page and a product page; no sideways scroll, no element past the screen edge. Still needs a real phone: tap highlight, input zoom, safe areas and the address-bar height can't be reproduced in a desktop browser.

### Deploy log
| Date | Commit | What went live | Checked |
|---|---|---|---|
| 2026-11-22 | `7cd888c` | First public deploy (redesign up to Pass 17) | home 200 |
| 2026-11-22 | `f6fe8fa` | Pass 18 best sellers + debug/security notes | hero card + new photos 200 |
| 2026-11-22 | `2c16f83` | Pass 19 product pages, all photos, link fixes, clean-up | `products.html`, data, product photos 200; `/himalay-site/` now 404; 0 old-site links on home |

## Site structure

```
index.html            Home: hero, 3D ring, explore by category, new arrivals, best sellers, all ranges, about, reviews, catalogue, footer
products.html         All ranges / one range / one product (rendered by js/products.js)
showcase.html         3D product ring (loaded in an iframe on the home page)
css/style.css         Base + hero/nav (original)
css/redesign.css      Sections from "Explore by category" down, dialog, footer
css/products.css      products.html only
css/mobile.css        Phone/tablet layer (touch, safe areas), loaded last
js/main.js            Menu, enquiry dialog + forms (both pages)
js/redesign.js        Home: category stage, new-arrivals belt, range tiles + filters
js/products.js        products.html views
js/catalog-data.js    GENERATED catalogue (ranges, products, colours, image sizes)
tools/gate_hover.py   Wraps :hover rules for mouse only (re-run after adding hover CSS)
tools/build_catalog.py  Builds images/p + js/catalog-data.js from the factory PNG folder
images/p/<product>/   GENERATED product photos per colour
docs/gst-certificate.pdf  Page 1 of the GST certificate
```

### Known follow-ups (not yet done)
- **Product details are short on purpose:** sizes, piece counts and codes come from the photo folder names; capacities for Aquvo/Cool/Gold, mug and bucket sizes, materials and prices were not available. Add them as `facts` in `tools/build_catalog.py` when the factory confirms them.
- **No PDF catalogue is hosted yet** — the form requests it on WhatsApp. Put the PDF in `docs/` and link it when available.
- **Hero video is 34 MB** — biggest remaining speed problem. Re-encoding to ~720p H.264, no audio, CRF ~28 would get it to roughly 3–5 MB. Needs `ffmpeg` (not installed on this machine). A poster frame (`images/hero-poster.jpg`) should be added at the same time so something shows before the video starts.
- Hero + 3D ring still use the old Cormorant / DM Sans type; kept on request, so the top and bottom halves of the page use different fonts.
- `css/style.css` still contains rules for removed sections (`.prod`, `.cgrid`, `.new-grid`, `.sec-prod`) — small, harmless, could be trimmed.
- Enquiry form relies on the visitor's email app (WhatsApp button works).
- The ring's side "enquiry list" drawer still has leftover clothing-cart plumbing (`cartState`, size picker UI) that now always resolves to "One size" — functions correctly but could be simplified.
- `images/showcase-bg.jpg` source upload was small (736×552) — fine blurred at the current size.
- "Explore by category" and the 3D ring still use the 9 older gallery photos; they could switch to the new per-colour photos.
