# SEO + Social Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** luisdelatorre.dev ships real SEO: static title/description/OG/Twitter tags in the exported HTML, `lang="es"`, JSON-LD Person, a branded 1200×630 og.png, robots.txt and sitemap.xml; `/admin` is noindexed.

**Architecture:** `src/app/+html.tsx` customizes the static shell (lang, theme-color, JSON-LD); `Head` from `expo-router/head` adds per-page meta in `index.tsx` (full OG set) and `admin/index.tsx` (noindex). Static assets live in `public/` (copied verbatim into `dist`). The OG image is generated once with PIL from the repo's real fonts and committed.

**Tech Stack:** expo-router static rendering (`+html.tsx` + `Head`, verified in docs.expo.dev/router/web/static-rendering.md), PIL 12 for the one-off image.

**Verification note:** No jest. Verify with `npx tsc --noEmit`, `npx expo export -p web` and **greps against `dist/*.html`** (the payload must be in static HTML, not just JS). Do NOT run `npx expo lint`.

---

### Task 1: OG image + robots + sitemap (`public/`)

**Files:**
- Create: `public/og.png` (generated), `public/robots.txt`, `public/sitemap.xml`
- Scratchpad (not committed): `<scratchpad>/make-og.py`

- [ ] **Step 1: Write `<scratchpad>/make-og.py` with EXACTLY:**

```python
from PIL import Image, ImageDraw, ImageFont

ROOT = '/Volumes/VIMKODEX 1/Personal/portfolio-dt'
W, H = 1200, 630
BG = (10, 11, 14)          # #0a0b0e
ACCENT = (228, 227, 87)    # #e4e357
TEXT = (245, 246, 247)
MUTED = (154, 160, 166)

img = Image.new('RGB', (W, H), BG)
draw = ImageDraw.Draw(img, 'RGBA')

# subtle 48px grid (rgba(255,255,255,0.03))
for x in range(0, W, 48):
    draw.line([(x, 0), (x, H)], fill=(255, 255, 255, 8), width=1)
for y in range(0, H, 48):
    draw.line([(0, y), (W, y)], fill=(255, 255, 255, 8), width=1)

# soft accent radial glow, top-center (concentric ellipses, low alpha)
glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
cx, cy, rx, ry = W // 2, 40, 620, 360
steps = 60
for i in range(steps, 0, -1):
    a = int(18 * (1 - i / steps))
    gd.ellipse(
        [cx - rx * i / steps, cy - ry * i / steps, cx + rx * i / steps, cy + ry * i / steps],
        fill=(228, 227, 87, a),
    )
img = Image.alpha_composite(img.convert('RGBA'), glow).convert('RGB')
draw = ImageDraw.Draw(img, 'RGBA')

# logo in a rounded surface box, top-left
logo = Image.open(f'{ROOT}/assets/images/logo.png').convert('RGBA')
logo = logo.resize((96, 98))
box_xy = (90, 84)
draw.rounded_rectangle([box_xy[0], box_xy[1], box_xy[0] + 128, box_xy[1] + 130], radius=24,
                       fill=(13, 15, 19, 255), outline=(255, 255, 255, 24), width=2)
img.paste(logo, (box_xy[0] + 16, box_xy[1] + 16), logo)

F = f'{ROOT}/node_modules/@expo-google-fonts'
name_font = ImageFont.truetype(f'{F}/space-grotesk/700Bold/SpaceGrotesk_700Bold.ttf', 84)
role_font = ImageFont.truetype(f'{F}/jetbrains-mono/400Regular/JetBrainsMono_400Regular.ttf', 30)
stack_font = ImageFont.truetype(f'{F}/ibm-plex-sans/400Regular/IBMPlexSans_400Regular.ttf', 27)
domain_font = ImageFont.truetype(f'{F}/jetbrains-mono/400Regular/JetBrainsMono_400Regular.ttf', 24)

draw.text((90, 268), 'Luis De La Torre', font=name_font, fill=TEXT)
draw.text((90, 382), 'SENIOR FULL-STACK & MOBILE DEVELOPER', font=role_font, fill=ACCENT)
draw.text((90, 436), 'Web · Móvil · AR/3D · Microservicios · IA', font=stack_font, fill=MUTED)
# accent divider + domain, bottom-left
draw.line([(90, 524), (150, 524)], fill=ACCENT + (255,), width=3)
draw.text((90, 544), 'luisdelatorre.dev', font=domain_font, fill=ACCENT)

img.save(f'{ROOT}/public/og.png', 'PNG')
print('og.png:', img.size)
```

- [ ] **Step 2: Run it and verify:**

```bash
python3 <scratchpad>/make-og.py
python3 -c "from PIL import Image; im = Image.open('public/og.png'); print(im.size, im.format)"
```
Expected: `(1200, 630) PNG`. Read the PNG visually (Read tool) — name, accent role line, logo and domain must be legible; tweak coordinates only if something overlaps.

- [ ] **Step 3: Create `public/robots.txt` with EXACTLY:**

```
User-agent: *
Allow: /
Disallow: /admin

Sitemap: https://luisdelatorre.dev/sitemap.xml
```

- [ ] **Step 4: Create `public/sitemap.xml` with EXACTLY:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://luisdelatorre.dev/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

- [ ] **Step 5: Commit**

```bash
git add public/og.png public/robots.txt public/sitemap.xml
git commit -m "feat(seo): OG card image, robots.txt and sitemap.xml"
```

---

### Task 2: HTML shell + per-page Head

**Files:**
- Create: `src/app/+html.tsx`
- Modify: `src/app/index.tsx`, `src/app/admin/index.tsx` (full rewrites, tiny files)

- [ ] **Step 1: Create `src/app/+html.tsx` with EXACTLY the code from the spec** (§ `src/app/+html.tsx`): lang="es", charset, X-UA-Compatible, viewport, theme-color `#0a0b0e`, `ScrollViewStyleReset`, JSON-LD `Person` script with name/jobTitle/url/image/email/address (Quito, EC)/sameAs (LinkedIn + GitHub)/knowsLanguage.

- [ ] **Step 2: Replace `src/app/index.tsx` with EXACTLY the code from the spec** (§ `src/app/index.tsx`): `Head` with title `Luis De La Torre — Senior Full-Stack & Mobile Developer`, meta description, canonical, og:type/url/title/description/image (+width/height)/site_name/locale es_EC + alternate en_US, twitter summary_large_image set, then `<PortfolioScreen />`.

- [ ] **Step 3: Replace `src/app/admin/index.tsx` with EXACTLY the code from the spec** (§ `src/app/admin/index.tsx`): `Head` with title `Console — Luis De La Torre` + `robots noindex, nofollow`, then `<AdminScreen />`.

- [ ] **Step 4: Build + static-output verification:**

```bash
npx tsc --noEmit && npx expo export -p web
grep -c '<title>Luis De La Torre' dist/index.html          # ≥1
grep -c 'og:image' dist/index.html                          # ≥1
grep -c 'application/ld+json' dist/index.html               # ≥1
grep -c 'lang="es"' dist/index.html                         # ≥1
grep -rc 'noindex' dist/admin.html dist/admin/index.html 2>/dev/null | grep -v ':0'  # ≥1 in whichever exists
ls dist/og.png dist/robots.txt dist/sitemap.xml
grep -lE 'initializeApp|firebase/auth' dist/_expo/static/js/web/*.js   # only firebase-client-*.js
```

- [ ] **Step 5: Commit**

```bash
git add src/app/
git commit -m "feat(seo): static meta shell, OG/Twitter tags and JSON-LD; noindex admin"
```

---

### Task 3: Preview verify + finish

- [ ] **Step 1: Preview:** `/` → `document.title` = `Luis De La Torre — Senior Full-Stack & Mobile Developer`, exactly one `<title>`, `document.querySelector('meta[property="og:title"]')` present; `/admin` → title `Console — Luis De La Torre`, `meta[name="robots"]` = `noindex, nofollow`. No console errors.

- [ ] **Step 2: Finish.** superpowers:finishing-a-development-branch → push + PR. After merge: `gh workflow run deploy.yml --ref main`, watch; live check `curl -s https://luisdelatorre.dev/ | grep -o '<title>[^<]*'`, og:image/JSON-LD greps, `curl -I` 200 on `/og.png`, `/robots.txt`, `/sitemap.xml`. Then hand the user the Search Console steps (add property `luisdelatorre.dev`, DNS or hosting verification, submit sitemap).

---

## Self-Review

**1. Spec coverage:** og.png PIL desde fuentes reales (T1 S1-2) ✓ · robots con Disallow /admin + sitemap (T1 S3-4) ✓ · +html shell lang=es/theme-color/ScrollViewStyleReset/JSON-LD (T2 S1) ✓ · Head público OG/Twitter/canonical (T2 S2) ✓ · admin noindex (T2 S3) ✓ · verificación en HTML estático + assets en dist (T2 S4) ✓ · preview single-title + live checks + Search Console (T3) ✓.
**2. Placeholders:** ninguno — el código de rutas vive completo en el spec (referenciado sección por sección) y el script PIL está completo aquí.
**3. Type consistency:** `Root({ children }: PropsWithChildren)` y `Head` de `expo-router/head` según docs v57 ✓; rutas `src/app/{+html,index,admin/index}.tsx` coinciden con el árbol real ✓; fuentes TTF verificadas en node_modules ✓; logo en `assets/images/logo.png` (288×294) ✓.
