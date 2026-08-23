# hanna-stelmach-terapeuta

Strona-wizytówka gabinetu psychoterapeutycznego (one-page). Zbudowana w **Astro**
+ **Tailwind CSS v4**, hostowana na **Netlify**. Treści docelowo zarządzane w
**Storyblok** (CMS).

## Wymagania

- Node **22** (patrz `.nvmrc`) — `nvm use`
- npm

## Uruchomienie

```bash
nvm use          # Node 22
npm install
npm run dev      # http://localhost:4321
npm run build    # build produkcyjny do ./dist
npm run preview  # podgląd builda
```

## Struktura

```
src/
  data/content.ts       # JEDNO źródło treści (placeholdery) — docelowo zasilane ze Storyblok
  layouts/Layout.astro  # <head>, SEO, fonty
  components/            # sekcje: Header, Hero, About, Therapy, CtaBanner,
                         #         Pricing, Reviews, Faq, Contact, Footer
  styles/global.css      # tokeny designu (kolory, fonty) w @theme (Tailwind v4)
  pages/index.astro      # złożenie strony
public/
  favicon.svg
  fonts/                 # docelowe pliki fontów (Bodoni URW, Optimistic)
```

## Do zrobienia / notatki

### Fonty
Projekt zakłada **Bodoni URW** (nagłówki) i **Optimistic** (paragrafy) — oba
komercyjne/niepubliczne. Tymczasowo ładujemy darmowe zamienniki z Google Fonts
(**Bodoni Moda** + **Mulish**) w `Layout.astro`. Po dostarczeniu licencjonowanych
plików: wrzuć je do `public/fonts`, dodaj `@font-face` w `global.css` i podmień
zmienne `--font-display` / `--font-body`.

### Paprocie (tło)
Dekoracyjne — **świadomie poza CMS**. Obecnie placeholdery (gradienty). Po eksporcie
z Figmy wstaw grafiki paproci w Hero / CtaBanner / sekcjach zielonych.

### Opinie — widget ZnanyLekarz
Sekcja „opinie" korzysta z oficjalnego widgetu ZnanyLekarz. Wygeneruj go
(ZnanyLekarz → „Kanały umawiania" → „Utwórz widget" → Opinie) i wklej kod w
`src/components/Reviews.astro` (ustaw `widgetInstalled = true`).

### Rezerwacja („umów wizytę")
Obecnie przycisk linkuje do profilu ZnanyLekarz (`site.bookingUrl` w `content.ts`).
Docelowo — do ustalenia z klientką (Calendly lub inny kalendarz); wystarczy zmienić
`bookingUrl`.

### Storyblok (CMS)
Integracja jest już w kodzie: `src/lib/content.ts` pobiera story `home` i mapuje
bloki na strukturę z `content.ts`, z fallbackiem per-pole do placeholderów.
Region: **EU**. Token (Preview) trzymany w `.env` jako `STORYBLOK_TOKEN`.

**Jednorazowa konfiguracja przestrzeni** (space ID `294737692191178`):

```bash
# 1. Wgraj schematy komponentów (wymaga logowania do Storyblok)
npx storyblok@3 login --region eu
npx storyblok@3 push-components ./storyblok/components.json --space 294737692191178
```

Następnie w panelu Storyblok: otwórz story **Home** → usuń demowe bloki
(teaser/grid) → w polu `body` dodaj bloki: `site_settings`, `hero`, `about`,
`therapy`, `cta_banner`, `pricing`, `reviews`, `contact` → uzupełnij treści →
**Publish**.

**Netlify:**
- `STORYBLOK_TOKEN` w *Site settings → Environment variables* (bez tego build
  używa placeholderów).
- Build Hook (*Build & deploy → Build hooks*) → wklej URL w Storyblok jako webhook
  (*Settings → Webhooks*), aby publikacja treści przebudowywała stronę.

## Deploy (Netlify)
Konfiguracja w `netlify.toml` (build `npm run build`, publish `dist`, Node 22).
Podłącz repo w panelu Netlify — kolejne pushe na `main` deployują się automatycznie.
