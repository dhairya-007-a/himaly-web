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
- **Skiper 52 HoverExpand Gallery**: Smooth expanding accordion showcasing 9 distinct household product categories.
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

### Production Characteristics
- **Zero Build Dependencies**: Pure HTML5, CSS3, and ES6+ JavaScript. No npm build, webpack, or external compiler required.
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
- **Deploy prep**: initialized a git repo, added a `.gitignore` (excludes the `.claude-flow/` and `.remember/` tool-internal caches, OS junk files; keeps the site, the source PNG master folder, and the hero video since the ask was to carry the whole project), and made the first commit. See the repo root for `.gitignore`; nothing was pushed to a remote — that needs a GitHub repo URL from you first.

### Known follow-ups (not yet done)
- Gallery images (ring + Explore By Category) are still plain PNG — a WebP pass (with PNG fallback) would shrink them further; skipped this round to limit scope.
- The ring's side "enquiry list" drawer still has leftover clothing-cart plumbing (`cartState`, size picker UI) that now always resolves to "One size" — functions correctly but could be simplified/removed in a later pass since it's no longer doing real cart work.
- `images/category-bg.jpg` and `images/showcase-bg.jpg` source uploads were small (735×490 and 736×552) — fine blurred/scrimmed at current section sizes, would look soft if either section got taller or the overlay lighter.
- No photo exists yet for "Flower Pattern Dispenser, 10 Ltr." specifically or for the "Premium Water Jugs"/"Premium Water Dispenser" categories beyond the one dispenser shot reused in two places — worth a real photo for each once available.
- `images/hero.jpg` (the hero's static `<img>` fallback behind the video) still doesn't exist; harmless since the video is the real background and `onerror` removes the broken tag, but worth adding a real fallback frame for browsers that block autoplay video.
