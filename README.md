# Portfolio — Luis De La Torre

Portfolio personal bilingüe (ES/EN) con **CMS propio**: edita el contenido desde
un panel `/admin`, pulsa **Publicar** y sale en vivo. Sin escribir código.

- **Sitio:** https://luisdelatorre.dev
- **Panel:** https://luisdelatorre.dev/admin (login con Google)
- **Stack:** Expo Router + React Native Web · Firebase (Firestore, Functions,
  Hosting, Auth) · TypeScript

---

## ✍️ Editar el contenido (uso diario)

1. Abre **https://luisdelatorre.dev/admin** e **inicia sesión con Google**
   (solo `luis.atorred24@gmail.com` está autorizado).
2. Elige el **idioma** (`ES` / `EN`) — cada idioma se edita por separado.
3. Elige la **sección** (Nav, Hero, Servicios, Impacto, Stack, Experiencia,
   Proyectos, Certificaciones, Contacto).
4. Edita los campos. En las listas: **↑ / ↓** reordenar · **✕** borrar ·
   **+ Añadir**.
5. Pulsa **Guardar** — el cambio queda en la base de datos (todavía no en vivo).
6. Pulsa **Publicar** — *"Publicación iniciada (~2-3 min)"*. Espera y recarga
   el sitio → cambios en vivo. 🚀

> **Guardar ≠ Publicar.** Guardar persiste en Firestore; Publicar despliega el
> sitio real. Puedes guardar varias secciones/idiomas y publicar una sola vez.

## 📊 Métricas

En `/admin` → botón **"Métricas"**: total de visitas, últimos ~30 días y ranking
de secciones más vistas. Cada visitante cuenta una vez por sesión. Sin cookies
ni datos personales.

## 🛟 Si algo falla

- **"Publicar" falla:** suele ser un flake transitorio de CI → vuelve a pulsar
  Publicar, o re-lanza el workflow en GitHub → **Actions → Deploy → Run**.
- **No entras a `/admin`:** usa la cuenta Google autorizada.
- **No ves los cambios:** ¿pulsaste **Publicar** tras Guardar? Tarda 2-3 min.

---

## 🧑‍💻 Desarrollo (cambios de código/diseño)

```bash
npm install
npm run web      # abre en http://localhost:8081
npx tsc --noEmit # type-check
```

**Publicar desde la máquina** (equivale al botón Publicar):

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$PWD/service-account.json"
npm run deploy   # pull de Firestore → build web → firebase deploy (hosting)
```

Requiere `service-account.json` en la raíz (no se commitea; está en `.gitignore`).

### Scripts útiles

| Comando | Qué hace |
|---|---|
| `npm run web` | Sitio en local (Expo web) |
| `npm run content:seed` | Sube el contenido semilla (`src/content/seed`) a Firestore |
| `npm run content:pull` | Baja Firestore → `src/content/published/*.json` |
| `npm run deploy` | Pull + build + deploy de hosting |

## 🏗️ Arquitectura

El sitio público es **estático y sin Firebase en el bundle**: el contenido de
Firestore se **hornea en el build** (no hay lecturas en runtime → rápido + SEO).
El panel `/admin` carga Firebase de forma perezosa (chunk aparte).

```
Firestore (content/es, content/en)         ← fuente de verdad, editable en /admin
   │  npm run content:pull (build-time)
   ▼
src/content/published/{es,en}.json  →  el sitio estático los importa
   │  Publicar (/admin) → Cloud Function → GitHub Actions → deploy
   ▼
Firebase Hosting  (luisdelatorre.dev)

Analítica:  sitio → POST /api/visit → Cloud Function recordVisit → Firestore analytics/summary → /admin
```

- **Contenido:** Firestore `content/{es,en}` (editable); `src/content/published/`
  es lo publicado (commiteado).
- **Publicar:** Cloud Function `publish` dispara el workflow `deploy.yml`.
- **Analítica:** Cloud Function `recordVisit` cuenta visitas/secciones.
- **Auth/seguridad:** solo el owner puede leer/escribir `content/*` y
  `analytics/*` (reglas de Firestore). El sitio público no lee Firestore.

## 📁 Estructura

```
src/
  app/                  Rutas (Expo Router): index (portfolio) · admin
  content/              Tipos + seed + JSON publicado + i18n dictionary
  i18n/                 Proveedor de idioma ES/EN
  theme/                Tokens de diseño + tipografía fluida
  features/portfolio/   Secciones del sitio público
  analytics/            Tracker de visitas (sin Firebase)
  admin/                Panel: auth, formularios, publicar, métricas
functions/              Cloud Functions (publish, recordVisit)
docs/superpowers/       Specs y planes de cada fase
```

## 🧭 Documentación de diseño

Cada fase tiene su spec y plan en `docs/superpowers/`:
portfolio · CMS Firestore (Fase 1) · panel admin (2A login, 2B formularios,
2C publicar) · analítica (Fase 3).
