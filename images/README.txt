Himalay website images

images/p/<product>/          Product photos, one file per colour (generated, do not edit by hand)
                             <colour>.webp     1200 px, product page
                             <colour>-sm.webp  520 px, cards and thumbnails
images/gallery/item-1..9     "Explore by category" stage and the 3D ring (showcase.html)
images/new/, new-1..4.webp   "Fresh off the line" belt on the home page
images/best/                 Best sellers section on the home page
images/gst-certificate.webp  Preview of page 1 of the GST certificate (About section)
images/showcase-bg.jpg       Blurred backdrop behind the 3D ring

To add or change a product or colour:
  1. Put the transparent PNG in "HIMALAY THERMOPLAST PNG FILES" (kept out of git, it is 2.4 GB).
  2. Add or adjust its line in tools/build_catalog.py (PRODUCTS / CATEGORIES).
  3. Run:  python -X utf8 tools/build_catalog.py
  4. Commit images/p and js/catalog-data.js.
