"""Build the in-site product catalogue from the factory photo folder.

    python -I tools/build_catalog.py [--cache DIR]

Reads   HIMALAY THERMOPLAST PNG FILES/   (transparent PNG cut-outs, not in git)
Writes  images/p/<product>/<colour>.webp      1200px, product page
        images/p/<product>/<colour>-sm.webp   520px, cards + thumbnails
        js/catalog-data.js                    categories → products → colour variants

Add a product or colour: drop the PNG in the right folder, add/adjust its entry in
PRODUCTS below, run this again, commit images/p and js/catalog-data.js.
--cache points at a folder of pre-trimmed masters (optional, only speeds up re-runs).
"""
import hashlib, json, os, re, sys
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "HIMALAY THERMOPLAST PNG FILES")
OUT_IMG = os.path.join(ROOT, "images", "p")
OUT_JS = os.path.join(ROOT, "js", "catalog-data.js")
BIG, SMALL = 1200, 520

ROOMS = [("bathroom", "Bathroom"), ("kitchen", "Kitchen & storage"), ("water", "Water"), ("cleaning", "Cleaning")]

CATEGORIES = [
    # id, name, room, blurb, search keywords, cover (product id, variant index)
    ("bathroom-sets", "Bathroom sets", "bathroom", "Matching tub, buckets, mugs, soap case and stool in one print. 11, 12, 6 and 4 piece sets.", "bath set bucket tub mug stool super jumbo oasis", ("ht-01", 0)),
    ("bathroom-essentials", "Bathroom essentials", "bathroom", "Single buckets, mugs, soap cases, scrubbers and stands, sold one piece at a time.", "bucket mug soap case brush stand scrubber dust pan tumbler", ("bath-bucket", 0)),
    ("patla", "Himalay patla", "bathroom", "Low bathroom stools with a firm grip, round and square.", "patla stool seat bath", ("ht-55", 0)),
    ("racks", "Storage racks", "kitchen", "Multi-tier racks for kitchens and bathrooms, round and square.", "rack shelf organiser stand", ("ht-58", 0)),
    ("pp-containers", "PP containers", "kitchen", "Printed polypropylene storage containers with tight lids.", "pp container jar storage flower jumbo", ("ht-38", 0)),
    ("pet-containers", "PET containers", "kitchen", "Clear PET jars with a spoon, from 250 ml to 2 litres, so you can see what's inside.", "pet container jar spoon clear 250 500 750 1000 1500 2000 ml", ("pet-set", 0)),
    ("storage", "Storage containers", "kitchen", "Stackable Rolex and Keeper container sets for the kitchen.", "storage container rolex keeper set box", ("rolex", 1)),
    ("lunch-boxes", "Lunch boxes", "kitchen", "Bento, Mello, Munch, Study Bites and Study Snack: leak-proof boxes for school and office.", "lunch box tiffin bento mello munch study bites snack school", ("mello", 0)),
    ("casserole", "Insulated casserole", "kitchen", "Keeps rotis and curries hot at the table.", "casserole hot pot insulated roti chapati", ("casserole", 0)),
    ("household-jugs", "Household jugs", "water", "Insulated water jugs for the home: Aquvo, Cool 8, Cool 12 and Himalay Gold.", "jug water cool aquvo gold insulated household", ("cool-12", 0)),
    ("commercial-jugs", "Commercial jugs", "water", "Large insulated jugs with a steel tap for shops and offices: 12, 15, 18 and 21 litres.", "commercial jug water 12 15 18 21 litre shop office", ("jug-18", 0)),
    ("dispensers", "Dispensers & bottles", "water", "Clear water dispenser with a tap and 20 litre PET bottles.", "dispenser water tap pet bottle 20 litre 8 litre", ("dispenser-8", 0)),
    ("fridge-bottles", "Fridge bottles", "water", "Slim bottles that fit the fridge door, single or in a set of six.", "fridge bottle water", ("ht-47", 0)),
    ("mops", "Mops", "cleaning", "Spin mops with steel or plastic handles.", "mop spin floor cleaning steel plastic", ("mop-steel", 0)),
    ("dustbins", "Pedal dustbins", "cleaning", "Foot-pedal dustbins in plain and dotted finishes, two sizes.", "dustbin bin pedal paddle waste 007 008", ("pedal-dustbin", 0)),
]

B = "_01_BATHROOM SET/"
PRODUCTS = [
    # id, category, code, name, short line, blurb, facts, folder (or list of files), options
    # options: drop = words to strip from file names; only/skip = regex on file name; extra = [(file, variant name)]
    ("ht-01", "bathroom-sets", "HT-01", "Super Jumbo bathroom set with pedal bin", "11 pieces + pedal bin", "Tub, buckets, mugs, soap case, stool and a pedal dustbin, all in one matching print.", [("Pieces", "11 + pedal bin"), ("Size", "Super Jumbo")], B + "HT-01 - SUPER JUMBO B.T SET 11 PIC PADDLEBIN_/PNG", {}),
    ("ht-02", "bathroom-sets", "HT-02", "Super Jumbo bathroom set", "11 pieces", "Tub, buckets, mugs, soap case and stool in one matching print.", [("Pieces", "11"), ("Size", "Super Jumbo")], B + "HT-02 - SUPER JUMBO B.T. SET 11 PIC_/PNG", {}),
    ("ht-03", "bathroom-sets", "HT-03", "Jumbo bathroom set with pedal bin", "11 pieces + pedal bin", "The Jumbo set with a matching pedal dustbin.", [("Pieces", "11 + pedal bin"), ("Size", "Jumbo")], B + "HT-03 -  JUMBO B.T. SET 11 PIC PADDLEBIN/PNG", {}),
    ("ht-04", "bathroom-sets", "HT-04", "Jumbo bathroom set 11+1", "12 pieces", "Eleven matching pieces plus one extra.", [("Pieces", "11 + 1"), ("Size", "Jumbo")], B + "HT-04 - JUMBO B.T. SET 11+1_/PNG", {}),
    ("ht-05", "bathroom-sets", "HT-05", "Super bathroom set with pedal bin", "11 pieces + pedal bin", "The Super set with a matching pedal dustbin.", [("Pieces", "11 + pedal bin"), ("Size", "Super")], B + "HT-05 - SUPER B.T. SET 11 PIC  PADDLEBIN_/PNG", {}),
    ("ht-06", "bathroom-sets", "HT-06", "Super bathroom set", "11 pieces", "Eleven matching pieces in the Super size.", [("Pieces", "11"), ("Size", "Super")], B + "HT-06 - SUPER B.T. SET 11 PIC_/PNG", {}),
    ("ht-07", "bathroom-sets", "HT-07", "Bathroom set with pedal bin", "11 pieces + pedal bin", "Our standard set with a matching pedal dustbin.", [("Pieces", "11 + pedal bin"), ("Size", "Standard")], B + "HT-07 - B.T. SET 11 PIC PADDLEBIN_/PNG", {}),
    ("ht-08", "bathroom-sets", "HT-08", "Bathroom set 11+1", "12 pieces", "Eleven matching pieces plus one extra, standard size.", [("Pieces", "11 + 1"), ("Size", "Standard")], B + "HT-08 - B.T. SET 11+1_/PNG", {}),
    ("ht-09", "bathroom-sets", "HT-09", "Jumbo bathroom set 6 pcs with pedal bin", "6 pieces + pedal bin", "A smaller Jumbo set with a matching pedal dustbin.", [("Pieces", "6 + pedal bin"), ("Size", "Jumbo")], B + "HT-09 - JUMBO B.T. SET 6 PIC PADDLEBIN_/PNG", {}),
    ("ht-10", "bathroom-sets", "HT-10", "Jumbo bathroom set 6 pcs", "6 pieces", "Six matching pieces in the Jumbo size.", [("Pieces", "6"), ("Size", "Jumbo")], B + "HT-10 - JUMBO B.T. SET 6 PIC_/PNG", {}),
    ("ht-11", "bathroom-sets", "HT-11", "Bathroom set 6 pcs with pedal bin", "6 pieces + pedal bin", "Six matching pieces with a pedal dustbin, standard size.", [("Pieces", "6 + pedal bin"), ("Size", "Standard")], B + "HT-11 - B.T. SET 6 PIC PADDLEBIN_/PNG", {}),
    ("ht-12", "bathroom-sets", "HT-12", "Bathroom set 6 pcs", "6 pieces", "Six matching pieces, standard size.", [("Pieces", "6"), ("Size", "Standard")], B + "HT-12 - B.T. SET 6 PIC_/PNG", {}),
    ("oasis-6", "bathroom-sets", "HT-13", "Oasis bathroom set 6 pcs", "6 pieces", "Plain-colour Oasis set in brown, coco and grey.", [("Pieces", "6")], B + "OASIS-13-14_6PCS_4PCS/PNG", {"only": r"6 PCS"}),
    ("oasis-4", "bathroom-sets", "HT-14", "Oasis bathroom set 4 pcs", "4 pieces", "A compact plain-colour Oasis set.", [("Pieces", "4")], B + "OASIS-13-14_6PCS_4PCS/PNG", {"only": r"4 PCS"}),
    ("oasis-tub", "bathroom-sets", "", "Oasis bath tub", "Single tub", "The Oasis tub on its own.", [], B + "OASIS-13-14_6PCS_4PCS/PNG", {"only": r"TUB"}),

    ("bath-bucket", "bathroom-essentials", "", "Bath bucket", "Printed", "Printed bath bucket with a sturdy handle, matches the bathroom sets.", [], "_15_MIX_SINGLE_PRODUCT_DONE/PNG", {"only": r"(LIGHT PINK|WHITE BLUE|WHITE PINK) - BUCKET"}),
    ("bath-tub", "bathroom-essentials", "", "Bath tub", "Printed, up to 35 litres", "Wide printed tub for bathing and laundry.", [], "_15_MIX_SINGLE_PRODUCT_DONE/PNG", {"only": r"(- BLUE - BUCKET|35LTR)", "rename": [(r"BLUE - BUCKET", "Blue"), (r"35LTR", "Brown, 35 litres")]}),
    ("bath-stool", "bathroom-essentials", "", "Printed bathroom stool", "Round", "Round printed stool for the bathroom.", [], "_15_MIX_SINGLE_PRODUCT_DONE/PNG", {"only": r"ROUND  PATLA"}),
    ("bath-mug", "bathroom-essentials", "", "Bath mug", "Printed", "Bath mug that matches the bathroom sets.", [], "_15_MIX_SINGLE_PRODUCT_DONE/PNG", {"only": r"MUG"}),
    ("soap-case", "bathroom-essentials", "", "Soap case", "With drain lid", "Soap case that matches the bathroom sets.", [], "_15_MIX_SINGLE_PRODUCT_DONE/PNG", {"only": r"SOAP CASE"}),
    ("bathroom-dustbin", "bathroom-essentials", "", "Bathroom dustbin", "Open top", "Small dustbin for the bathroom.", [], "_15_MIX_SINGLE_PRODUCT_DONE/PNG", {"only": r"CREAM - DUSTBIN"}),
    ("printed-pedal-dustbin", "dustbins", "", "Printed pedal dustbin", "Floral print", "Foot-pedal dustbin with a floral print and lid.", [], "_15_MIX_SINGLE_PRODUCT_DONE/PNG", {"only": r"PADDLE DUSTBIN"}),
    ("dust-pan", "bathroom-essentials", "", "Dust pan", "With handle", "Dust pan with a long grip.", [], "_15_MIX_SINGLE_PRODUCT_DONE/PNG", {"only": r"DUST PAN"}),
    ("brush-stand", "bathroom-essentials", "", "Brush stand", "Toothbrush holder", "Toothbrush and paste stand.", [], "_15_MIX_SINGLE_PRODUCT_DONE/PNG", {"only": r"BRUSH STAND"}),
    ("body-scrubber", "bathroom-essentials", "", "Body scrubber", "Bath scrubber", "Soft-bristle body scrubber.", [], "_15_MIX_SINGLE_PRODUCT_DONE/PNG", {"only": r"BODY SCRUB"}),
    ("foot-scrubber", "bathroom-essentials", "", "Foot scrubber", "Bath scrubber", "Foot scrubber for the bathroom floor.", [], "_15_MIX_SINGLE_PRODUCT_DONE/PNG", {"only": r"FOOT"}),

    ("ht-55", "patla", "HT-55", "Round patla", "5 colours", "Round bathroom stool with a firm, non-slip grip.", [("Shape", "Round")], "_05_PATLA_DONE/HT-55 - ROUND - PATLA/PNG", {"extra": [("_05_PATLA_DONE/NEW/ROUND_/HT-01 - FLORAL -  CREAM.png", "Cream"), ("_05_PATLA_DONE/NEW/ROUND_/HT-01 - FLORAL - BABY PINK.png", "Baby pink"), ("_05_PATLA_DONE/NEW/ROUND_/HT-01 - FLORAL - LIGHT GREY.png", "Light grey")]}),
    ("ht-56", "patla", "HT-56", "Square patla", "5 colours", "Square bathroom stool with a firm, non-slip grip.", [("Shape", "Square")], "_05_PATLA_DONE/HT-56 - SQUARE - PATLA/PNG", {"extra": [("_05_PATLA_DONE/NEW/SQUARE/PNG/OASIS_4 PCS_BROWN_MERGE.png", "Brown"), ("_05_PATLA_DONE/NEW/SQUARE/PNG/OASIS_4 PCS_COCO_MERGE.png", "Coco"), ("_05_PATLA_DONE/NEW/SQUARE/PNG/OASIS_4 PCS_GRAY_MERGE.png", "Grey")]}),
    ("ht-58", "racks", "HT-58", "Round rack", "Multi-tier", "Round multi-tier rack for the kitchen or bathroom.", [("Shape", "Round")], "_06_RACK_DONE/HT-58 - ROUND - RACK/PNG", {}),
    ("ht-59", "racks", "HT-59", "Square rack", "Multi-tier", "Square multi-tier rack for the kitchen or bathroom.", [("Shape", "Square")], "_06_RACK_DONE/HT-59 - SQUARE - RACK/PNG", {}),

    ("ht-38", "pp-containers", "HT-38", "Flower pattern container", "Set of jars", "Printed storage jars with tight lids.", [], "_02_PP_CONTAINER_DONE/PNG", {"only": r"HT-38"}),
    ("ht-39", "pp-containers", "HT-39", "Flower pattern container set", "6 pieces", "Six printed containers in graded sizes.", [("Pieces", "6")], "_02_PP_CONTAINER_DONE/PNG", {"only": r"HT - 39"}),
    ("ht-40", "pet-containers", "HT-40", "PET container 250 ml", "250 ml", "Clear jar with a printed lid and spoon.", [("Capacity", "250 ml")], "_03_PET_CONTAINER_DONE/PNG", {"only": r"HT-40"}),
    ("ht-41", "pet-containers", "HT-41", "PET container 500 ml", "500 ml", "Clear jar with a printed lid and spoon.", [("Capacity", "500 ml")], "_03_PET_CONTAINER_DONE/PNG", {"only": r"HT-41"}),
    ("ht-42", "pet-containers", "HT-42", "PET container 750 ml", "750 ml", "Clear jar with a printed lid and spoon.", [("Capacity", "750 ml")], "_03_PET_CONTAINER_DONE/PNG", {"only": r"HT-42"}),
    ("ht-43", "pet-containers", "HT-43", "PET container 1 litre", "1000 ml", "Clear jar with a printed lid and spoon.", [("Capacity", "1000 ml")], "_03_PET_CONTAINER_DONE/PNG", {"only": r"HT-43"}),
    ("ht-44", "pet-containers", "HT-44", "PET container 1.5 litres", "1500 ml", "Clear jar with a printed lid and spoon.", [("Capacity", "1500 ml")], "_03_PET_CONTAINER_DONE/PNG", {"only": r"HT-44"}),
    ("ht-45", "pet-containers", "HT-45", "PET container 2 litres", "2000 ml", "Clear jar with a printed lid and spoon.", [("Capacity", "2000 ml")], "_03_PET_CONTAINER_DONE/PNG", {"only": r"HT-45"}),
    ("pet-set", "pet-containers", "HT-40–45", "PET container full range", "250 ml to 2 litres", "All six sizes together, blue or pink lids.", [("Sizes", "250, 500, 750, 1000, 1500, 2000 ml")], "_03_PET_CONTAINER_DONE/PNG", {"only": r"GROUP", "rename": [(r"BLUE", "Blue lids"), (r"PINK", "Pink lids")]}),
    # rolex + keeper photos and sizes come from 02_HIMALAY_CONTAINER_WEB.pdf (cut-outs split into the two stacks)
    ("rolex", "storage", "", "Rolex storage set", "4 or 7 pieces", "Transparent stackable containers in graded sizes with tight-fitting lids.", [("4 piece sizes", "999, 1000, 1100, 1200"), ("7 piece sizes", "222, 333, 444, 555, 666, 777, 888"), ("Smallest (222)", "138 × 107 × 66 mm"), ("Largest (1200)", "528 × 418 × 278 mm")], "_PDF_02_CONTAINER_WEB/ROLEX", {"tag": "-filled", "rename": [(r"4 PIC", "4 pieces"), (r"7 PIC", "7 pieces"), (r"ALL PIC", "Full set")]}),
    ("keeper", "storage", "", "Keeper storage set", "4 or 8 pieces", "Transparent stackable containers with clip-lock lids.", [("4 piece sizes", "99, 100, 110, 120"), ("8 piece sizes", "11, 22, 33, 44, 55, 66, 77, 88"), ("Smallest (11)", "90 × 49 × 25 mm"), ("Largest (120)", "445 × 297 × 137 mm")], "_PDF_02_CONTAINER_WEB/KEEPER", {"rename": [(r"4 PIC", "4 pieces"), (r"8 PIC", "8 pieces"), (r"ALL PIC", "Full set")]}),
    ("bento", "lunch-boxes", "", "Bento lunch box", "4 colours", "Steel compartments, clip-lock lid.", [], "_11_LUNCH_BOX_DONE/BENTO_BOX/PNG", {}),
    ("mello", "lunch-boxes", "", "Mello lunch box", "3 colours", "Leak-proof, stackable tiers.", [], "_11_LUNCH_BOX_DONE/MELLO_BOX/PNG", {}),
    ("munch", "lunch-boxes", "", "Munch lunch box", "4 colours", "Printed lid, clip-lock sides.", [], "_11_LUNCH_BOX_DONE/MUNCH_BOX/PNG", {}),
    ("study-bites", "lunch-boxes", "", "Study Bites lunch box", "3 colours", "Compact school box with a snack compartment.", [], "_11_LUNCH_BOX_DONE/STUDY_BITES/PNG", {}),
    ("study-snack", "lunch-boxes", "", "Study Snack lunch box", "4 colours", "School lunch box with a separate snack tray.", [], "_11_LUNCH_BOX_DONE/STUDY_SNACK/PNG", {"skip": r"CMYK"}),
    ("casserole", "casserole", "", "Printed casserole set", "Set of 4", "Four insulated casseroles with a floral print. Keeps rotis and curries hot.", [("Pieces", "4")], "_18_CASEROLL/PNG", {"only": r"MERGE"}),
    ("casserole-plain", "casserole", "", "Plain casserole set", "Set of 4", "Four insulated casseroles in solid colours with cream lids.", [("Pieces", "4")], "_18_CASEROLL/PNG", {"only": r"DSC", "rename": [(r"DSC0025[4-9]|DSC0026[01]", "Brown"), (r"DSC0026[4-9]|DSC00270", "Green"), (r"DSC002[78][0-9]", "Black")]}),

    ("aquvo", "household-jugs", "", "Aquvo jug", "4, 6 and 8 litres", "Insulated water jug; 4, 6 and 8 litre sizes share one look.", [("Sizes", "4, 6, 8 litres")], "_07_HOUSE_HOLD_JUG_DONE/AQUVO 4_6_8_ALL_SAME/PNG", {}),
    ("cool-12", "household-jugs", "", "Cool 12", "12 litres", "Insulated water cooler with a front tap.", [("Capacity", "12 litres")], "_07_HOUSE_HOLD_JUG_DONE/COOL_12/PNG", {"rename": [(r"WA0004", "Brown"), (r"WA0005", "Dark grey")]}),
    ("cool-8", "household-jugs", "", "Cool 8", "8 litres", "Insulated water cooler with a front tap.", [("Capacity", "8 litres")], "_07_HOUSE_HOLD_JUG_DONE/COOL_8/PNG", {}),
    ("himalay-gold", "household-jugs", "", "Himalay Gold", "Insulated jug", "Insulated water jug with a front tap.", [], "_07_HOUSE_HOLD_JUG_DONE/HIMALAY_GOLD/PNG", {}),
    ("jug-12", "commercial-jugs", "", "Commercial jug 12 litres", "12 litres", "Insulated, steel tap.", [("Capacity", "12 litres")], "_08_COMMERCIAL_JUG_DONE/12_LITER/PNG", {"extra": [("_08_COMMERCIAL_JUG_DONE/MIX_FROM_CLIENT/PNG/BLUE_12LTR copy.png", "Blue")]}),
    ("jug-15", "commercial-jugs", "", "Commercial jug 15 litres", "15 litres", "Insulated, steel tap.", [("Capacity", "15 litres")], "_08_COMMERCIAL_JUG_DONE/15 LITER/PNG", {}),
    ("jug-18", "commercial-jugs", "", "Commercial jug 18 litres", "18 litres", "Insulated, steel tap. Our best-selling commercial jug.", [("Capacity", "18 litres")], "_08_COMMERCIAL_JUG_DONE/18 LITER/PNG", {"extra": [("_08_COMMERCIAL_JUG_DONE/MIX_FROM_CLIENT/PNG/ORANGE_18LTR copy.png", "Orange")]}),
    ("jug-21", "commercial-jugs", "", "Commercial jug 21 litres", "21 litres", "Our largest insulated jug, steel tap.", [("Capacity", "21 litres")], "_08_COMMERCIAL_JUG_DONE/21_LITER/PNG", {}),
    ("dispenser-8", "dispensers", "", "Water dispenser 8 litres", "8 litres", "Clear PET body with a front tap.", [("Capacity", "8 litres")], "_09_10_COMMERCIAL_WATER_BOTTLE_&_DISPENSER_DONE/PNG", {"only": r"DISPENSER", "rename": [(r".", "Clear")]}),
    ("pet-bottle-20", "dispensers", "", "PET water bottle 20 litres", "20 litres", "Refillable 20 litre water bottle.", [("Capacity", "20 litres")], "_09_10_COMMERCIAL_WATER_BOTTLE_&_DISPENSER_DONE/PNG", {"only": r"PET", "rename": [(r".", "Clear, pack of 2")]}),
    ("ht-46", "fridge-bottles", "HT-46", "Fridge bottle", "Single", "Slim bottle that fits the fridge door.", [], "_04_FRIDGE_BOTTLE_DONE/PNG", {"only": r"HT-46", "rename": [(r".", "Smoke grey")]}),
    ("ht-47", "fridge-bottles", "HT-47", "Fridge bottle set of 6", "6 bottles", "Six fridge bottles in assorted colours.", [("Pieces", "6")], "_04_FRIDGE_BOTTLE_DONE/PNG", {"only": r"HT-47", "rename": [(r".", "Assorted")]}),

    ("mop-steel", "mops", "", "Spin mop, steel handle", "4 colours", "Spin mop with a steel handle and spin bucket.", [("Handle", "Steel")], "_16_MOP_DONE/PNG", {"only": r"STEEL"}),
    ("mop-plastic", "mops", "", "Spin mop, plastic handle", "4 colours", "Spin mop with a light plastic handle and spin bucket.", [("Handle", "Plastic")], "_16_MOP_DONE/PNG", {"only": r"PLASTIC"}),
    ("pedal-dustbin", "dustbins", "007 / 008", "Pedal dustbin", "Two sizes", "Foot-pedal dustbin with lid, in plain and dotted finishes.", [("Sizes", "007 and 008")], "_17_PADDLE _DUSTBIN_DONE/PNG", {}),
]

# words stripped from file names before the rest is read as the colour
NOISE = r"\b(MERGE|COPY|OPTION|NO|LABEL|PNG|HT|SINGLE|PRODUCT|PADDLE|DUSTBIN|PIC|PCS|LTR|LITER|ML|FOR|BLUE BACKGROUND|SET|GOLD|COOL|AQUVO|MOP|STEEL|PLASTICL?|ROUND|SQUARE|RACK|PATLA|BENTO|MELLO|MUNCH|STUDY|BITES|SNACK|ROLEX|KEEPER|ALL|FRIDGE|BOTTLE|DISPENSER|PET|CONTAINER|BUCKET|MUG|SOAP|CASE|BRUSH|STAND|BODY|SCRUB|FOOT|FOLL|DUST|PAN|TUB|OASIS|CLIENT|DSC\d+|IMG|WA\d+|\d+PIC|\d+LTR|\d+ML|COOL\d+|\d+)\b"

COLOUR_NAMES = {
    "B GREEN": "Bottle green", "P GREEN": "Pista green", "PISTA GREEN": "Pista green", "L GRAY": "Grey",
    "LIGHT GREY": "Light grey", "GRAY": "Grey", "DRACK BLUE": "Dark blue", "GROUP": "All colours",
    "DOT GREY": "Dotted grey", "DOT BLACK RED": "Dotted black & red", "COCO": "Coco",
}
SWATCH = {
    "blue": "#2F6FD0", "pink": "#E889B0", "baby pink": "#F7C8D8", "cream": "#EEDFC0", "light grey": "#C8CDD3", "grey": "#9AA1A9",
    "brown": "#7B4A2D", "white blue": "linear-gradient(135deg,#fff 50%,#2F6FD0 50%)", "white orange": "linear-gradient(135deg,#fff 50%,#F08A24 50%)",
    "white pink": "linear-gradient(135deg,#fff 50%,#E889B0 50%)", "coco": "#5E3E2E", "bottle green": "#1E6B4F", "sky blue": "#86CBEE",
    "red": "#D33A3A", "coffee": "#6F4E37", "light pink": "#F5C4D0", "pista green": "#A9CB80", "orange": "#F08A24",
    "dark blue": "#1F3A75", "mint green": "#9FE0C5", "light orange": "#F7B26A", "black": "#222", "purple": "#7B57B5",
    "light blue": "#A9D4F5", "light green": "#B5E2A3", "yellow": "#F2C531", "white": "#F7F7F7", "dark grey": "#4A4F55", "smoke grey": "#6E7378", "green": "#5E9C80", "brown, 35 litres": "#C9B48F", "blue lids": "#2F6FD0", "pink lids": "#E889B0", "clear": "linear-gradient(135deg,#EAF4FB,#BFD9EA)", "clear, pack of 2": "linear-gradient(135deg,#EAF4FB,#BFD9EA)", "assorted": "conic-gradient(#2F6FD0,#86CBEE,#2F6FD0)", "full set": "linear-gradient(135deg,#F4F8FB,#D3E1EC)", "4 pieces": "linear-gradient(135deg,#F4F8FB,#D3E1EC)", "7 pieces": "linear-gradient(135deg,#F4F8FB,#D3E1EC)", "8 pieces": "linear-gradient(135deg,#F4F8FB,#D3E1EC)",
    "dotted grey": "radial-gradient(circle at 30% 30%,#fff 18%,transparent 20%) 0 0/8px 8px,#8E959C",
    "dotted black & red": "radial-gradient(circle at 30% 30%,#D33A3A 18%,transparent 20%) 0 0/8px 8px,#222",
    "all colours": "conic-gradient(#2F6FD0,#E889B0,#F2C531,#A9CB80,#2F6FD0)",
}


PREFERRED = ["flower-blue", "flower-pink", "flower-brown", "flower-white-blue", "flower-white-orange", "flower-white-pink",
             "floral-cream", "floral-baby-pink", "floral-light-grey", "blue", "pink", "bottle-green", "pista-green", "orange"]


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def colour_of(fname):
    stem = os.path.splitext(fname)[0].upper()
    pattern = ""
    m = re.search(r"\b(FLORAL|FLOWER)\b", stem)
    if m:
        pattern = m.group(1).title()
        stem = stem.replace(m.group(1), " ")
    stem = re.sub(r"[_\-\.]+", " ", stem)
    stem = re.sub(NOISE, " ", stem)
    stem = re.sub(r"\s+", " ", stem).strip()
    name = COLOUR_NAMES.get(stem, stem.capitalize() if stem else "Standard")
    name = name[0].upper() + name[1:].lower() if name else name
    return pattern, name


def list_files(folder, opts):
    d = os.path.join(SRC, folder)
    fs = sorted(f for f in os.listdir(d) if f.lower().endswith(".png"))
    if "only" in opts:
        fs = [f for f in fs if re.search(opts["only"], f.upper())]
    if "skip" in opts:
        fs = [f for f in fs if not re.search(opts["skip"], f.upper())]
    def forced(f):
        for rx, nm in opts.get("rename", []):
            if re.search(rx, f.upper()):
                return nm
        return None
    return [(folder + "/" + f, forced(f)) for f in fs] + [(p, n) for p, n in opts.get("extra", [])]


def load_master(rel, cache):
    if cache:
        p = os.path.join(cache, hashlib.md5(rel.encode()).hexdigest()[:10] + ".webp")
        if os.path.exists(p):
            return Image.open(p).convert("RGBA")
    im = Image.open(os.path.join(SRC, rel)); im.load(); im = im.convert("RGBA")
    bb = im.split()[-1].point(lambda v: 255 if v > 8 else 0).getbbox()
    if bb:
        im = im.crop(bb)
    im.thumbnail((1400, 1400), Image.LANCZOS)
    return im


def export(im, dst_base):
    out = {}
    for suffix, size, q in (("", BIG, 82), ("-sm", SMALL, 80)):
        c = im.copy(); c.thumbnail((size, size), Image.LANCZOS)
        path = dst_base + suffix + ".webp"
        if not os.path.exists(path):
            c.save(path, "WEBP", quality=q, method=6)
        out[suffix] = (os.path.relpath(path, ROOT).replace(os.sep, "/"), c.size)
    return {"src": out[""][0], "sm": out["-sm"][0], "w": out[""][1][0], "h": out[""][1][1]}


def main():
    cache = None
    if "--cache" in sys.argv:
        cache = sys.argv[sys.argv.index("--cache") + 1]
    products = []
    for pid, cat, code, name, short, blurb, facts, folder, opts in PRODUCTS:
        variants, order = {}, []
        for rel, forced in list_files(folder, opts):
            pattern, colour = colour_of(os.path.basename(rel))
            vname = forced or (f"{pattern} · {colour}" if pattern else colour)
            vid = slug(vname)
            if vid not in variants:
                variants[vid] = {"id": vid, "name": vname, "sw": SWATCH.get(colour.lower() if not forced else forced.lower(), "#B9C6D3"), "imgs": [], "_files": []}
                order.append(vid)
            variants[vid]["_files"].append(rel)
        os.makedirs(os.path.join(OUT_IMG, pid), exist_ok=True)
        for vid in order:
            v = variants[vid]
            for i, rel in enumerate(v.pop("_files")):
                # "tag" renames the files when a photo is replaced, so browsers can't keep showing the cached old one
                base = os.path.join(OUT_IMG, pid, vid + opts.get("tag", "") + (f"-{i + 1}" if i else ""))
                v["imgs"].append(export(load_master(rel, cache), base))
        # same colour order on every product (so cards line up), "All colours" group shots last
        vs = sorted((variants[k] for k in order),
                    key=lambda v: (v["id"] == "all-colours", PREFERRED.index(v["id"]) if v["id"] in PREFERRED else len(PREFERRED)))
        products.append({"id": pid, "cat": cat, "code": code, "name": name, "short": short, "blurb": blurb,
                         "facts": facts, "variants": vs})
        print(f"{pid:16} {len(vs):2} colours  " + ", ".join(v["name"] for v in vs), flush=True)

    by_id = {p["id"]: p for p in products}
    cats = []
    for cid, cname, room, blurb, kw, (cover_p, cover_v) in CATEGORIES:
        p = by_id[cover_p]
        im = p["variants"][min(cover_v, len(p["variants"]) - 1)]["imgs"][0]
        cats.append({"id": cid, "name": cname, "room": room, "blurb": blurb, "keywords": kw,
                     "cover": {"src": im["src"], "sm": im["sm"], "w": im["w"], "h": im["h"]}})
    data = {"rooms": [{"id": r, "name": n} for r, n in ROOMS], "categories": cats, "products": products}
    with open(OUT_JS, "w", encoding="utf-8") as f:
        f.write("/* Generated by tools/build_catalog.py — do not edit by hand. */\n")
        f.write("window.HIMALAY_CATALOG = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
    n_img = sum(len(v["imgs"]) for p in products for v in p["variants"])
    print(f"\n{len(cats)} categories, {len(products)} products, {sum(len(p['variants']) for p in products)} colours, {n_img} photos")


if __name__ == "__main__":
    main()
