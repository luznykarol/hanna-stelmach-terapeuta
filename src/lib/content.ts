/**
 * Content provider.
 *
 * Fetches the "home" story from Storyblok and merges it over the placeholder
 * defaults in src/data/content.ts. Every field falls back to the default when
 * missing/empty, so the site always builds — even before content is published.
 *
 * Alongside the content it exposes `editable`: precomputed `data-blok-*`
 * attributes (from storyblokEditable) that components spread onto their root
 * element to enable click-to-edit in the Storyblok Visual Editor. The `class`
 * key is stripped so it never clobbers our Tailwind classes; the data
 * attributes alone are enough for the editor to map clicks to fields.
 *
 * The result is memoised so Storyblok is queried once per build.
 */
import { useStoryblokApi, storyblokEditable } from '@storyblok/astro';
import {
  site as siteDefault,
  hero as heroDefault,
  about as aboutDefault,
  therapy as therapyDefault,
  ctaBanner as ctaBannerDefault,
  pricing as pricingDefault,
  reviews as reviewsDefault,
  contact as contactDefault,
  business as businessDefault,
  composeAddress,
  composeMapEmbedUrl,
} from '../data/content';

type Blok = Record<string, any> & { component: string };
type Attrs = Record<string, string>;

type EditableMap = {
  siteSettings: Attrs;
  hero: Attrs;
  about: Attrs;
  therapy: Attrs;
  therapyItems: Attrs[];
  ctaBanner: Attrs;
  pricing: Attrs;
  pricingItems: Attrs[];
  reviews: Attrs;
  contact: Attrs;
};

/** Return the Storyblok string if non-empty, otherwise the fallback. */
const str = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value.trim() !== '' ? value : fallback;

/** Extract an asset filename from a Storyblok asset field, else fallback. */
const asset = (value: any, fallback: string): string =>
  value && typeof value === 'object' && value.filename ? value.filename : fallback;

const findBlok = (body: Blok[], component: string): Blok | undefined =>
  body.find((b) => b?.component === component);

/** data-blok-* attributes for click-to-edit; empty when not in the editor. */
const editableAttrs = (blok: Blok | undefined): Attrs => {
  if (!blok || !blok._editable) return {};
  const { class: _dropClass, ...dataAttrs } = storyblokEditable(blok) as Attrs;
  return dataAttrs;
};

export type SiteContent = {
  site: typeof siteDefault;
  hero: typeof heroDefault;
  about: typeof aboutDefault;
  therapy: typeof therapyDefault;
  ctaBanner: typeof ctaBannerDefault;
  pricing: typeof pricingDefault;
  reviews: typeof reviewsDefault;
  contact: typeof contactDefault;
  business: typeof businessDefault;
  editable: EditableMap;
};

function emptyEditable(): EditableMap {
  return {
    siteSettings: {},
    hero: {},
    about: {},
    therapy: {},
    therapyItems: [],
    ctaBanner: {},
    pricing: {},
    pricingItems: [],
    reviews: {},
    contact: {},
  };
}

function buildDefaults(): SiteContent {
  // Structured clone keeps the memoised object independent from the source module.
  return structuredClone({
    site: siteDefault,
    hero: heroDefault,
    about: aboutDefault,
    therapy: therapyDefault,
    ctaBanner: ctaBannerDefault,
    pricing: pricingDefault,
    reviews: reviewsDefault,
    contact: contactDefault,
    business: businessDefault,
    editable: emptyEditable(),
  });
}

function applyStoryblok(content: SiteContent, body: Blok[]): void {
  const settings = findBlok(body, 'site_settings');
  if (settings) {
    content.editable.siteSettings = editableAttrs(settings);
    content.site.logoLine1 = str(settings.logo_line1, content.site.logoLine1);
    content.site.logoLine2 = str(settings.logo_line2, content.site.logoLine2);
    content.site.bookingUrl = str(settings.booking_url, content.site.bookingUrl);
    content.site.bookingLabel = str(settings.booking_label, content.site.bookingLabel);
    if (Array.isArray(settings.nav) && settings.nav.length > 0) {
      content.site.nav = settings.nav.map((n: Blok, i: number) => ({
        label: str(n.label, content.site.nav[i]?.label ?? ''),
        href: str(n.href, content.site.nav[i]?.href ?? '#'),
      }));
    }
  }

  const hero = findBlok(body, 'hero');
  if (hero) {
    content.editable.hero = editableAttrs(hero);
    content.hero.title = str(hero.title, content.hero.title);
    content.hero.subtitle = str(hero.subtitle, content.hero.subtitle);
  }

  const about = findBlok(body, 'about');
  if (about) {
    content.editable.about = editableAttrs(about);
    content.about.heading = str(about.heading, content.about.heading);
    content.about.text = str(about.text, content.about.text);
    content.about.image = asset(about.image, content.about.image);
  }

  const therapy = findBlok(body, 'therapy');
  if (therapy) {
    content.editable.therapy = editableAttrs(therapy);
    content.therapy.heading = str(therapy.heading, content.therapy.heading);
    content.therapy.intro = str(therapy.intro, content.therapy.intro);
    if (Array.isArray(therapy.items) && therapy.items.length > 0) {
      content.therapy.items = therapy.items.map((it: Blok) => ({
        image: asset(it.image, ''),
        imageAlt: str(it.name, ''),
        name: str(it.name, 'terapia nazwa'),
        description: str(it.description, ''),
      }));
      content.editable.therapyItems = therapy.items.map((it: Blok) => editableAttrs(it));
    }
  }

  const cta = findBlok(body, 'cta_banner');
  if (cta) {
    content.editable.ctaBanner = editableAttrs(cta);
    content.ctaBanner.heading = str(cta.heading, content.ctaBanner.heading);
  }

  const pricing = findBlok(body, 'pricing');
  if (pricing) {
    content.editable.pricing = editableAttrs(pricing);
    content.pricing.heading = str(pricing.heading, content.pricing.heading);
    content.pricing.intro = str(pricing.intro, content.pricing.intro);
    if (Array.isArray(pricing.items) && pricing.items.length > 0) {
      content.pricing.items = pricing.items.map((it: Blok) => ({
        name: str(it.name, 'rodzaj terapii'),
        price: str(it.price, ''),
        duration: str(it.duration, ''),
      }));
      content.editable.pricingItems = pricing.items.map((it: Blok) => editableAttrs(it));
    }
  }

  const reviews = findBlok(body, 'reviews');
  if (reviews) {
    content.editable.reviews = editableAttrs(reviews);
    content.reviews.heading = str(reviews.heading, content.reviews.heading);
    content.reviews.znanylekarzProfileUrl = str(
      reviews.znanylekarz_profile_url,
      content.reviews.znanylekarzProfileUrl,
    );
  }

  const contact = findBlok(body, 'contact');
  if (contact) {
    content.editable.contact = editableAttrs(contact);
    content.contact.heading = str(contact.heading, content.contact.heading);
    content.contact.phone.label = str(contact.phone_label, content.contact.phone.label);
    content.contact.phone.value = str(contact.phone_value, content.contact.phone.value);
    content.contact.phone.href = `tel:${str(contact.phone_value, content.contact.phone.value).replace(/\s+/g, '')}`;
    content.contact.email.label = str(contact.email_label, content.contact.email.label);
    content.contact.email.value = str(contact.email_value, content.contact.email.value);
    content.contact.email.href = `mailto:${str(contact.email_value, content.contact.email.value)}`;
    content.contact.address.label = str(contact.address_label, content.contact.address.label);
    content.contact.social.label = str(contact.social_label, content.contact.social.label);
    content.contact.directionsTitle = str(contact.directions_title, content.contact.directionsTitle);
    content.contact.directions = str(contact.directions, content.contact.directions);

    // Structured NAP + geo — the CMS is the source of truth, code values are the
    // fallback. The visible address, the Google Maps embed and the JSON-LD are
    // all DERIVED from this merged `business`, so they can never diverge.
    content.business.street = str(contact.street, content.business.street);
    content.business.floor = str(contact.floor, content.business.floor);
    content.business.postalCode = str(contact.postal_code, content.business.postalCode);
    content.business.city = str(contact.city, content.business.city);
    content.business.region = str(contact.region, content.business.region);
    content.business.country = str(contact.country, content.business.country);
    content.business.latitude = str(contact.latitude, String(content.business.latitude ?? ''));
    content.business.longitude = str(contact.longitude, String(content.business.longitude ?? ''));
    content.contact.address.value = composeAddress(content.business);
    content.contact.mapEmbedUrl = composeMapEmbedUrl(content.business);
  }
}

// Memoise the in-flight promise (not just the result) so concurrent component
// renders share a single Storyblok fetch per build instead of racing.
// In dev we skip the cache so every preview reload fetches fresh content —
// otherwise saved/published CMS changes wouldn't show without restarting the
// dev server.
let cache: Promise<SiteContent> | null = null;

export function getContent(): Promise<SiteContent> {
  if (import.meta.env.DEV) return loadContent();
  if (!cache) cache = loadContent();
  return cache;
}

async function loadContent(): Promise<SiteContent> {
  const content = buildDefaults();

  try {
    const api = useStoryblokApi();
    const version = import.meta.env.DEV ? 'draft' : 'published';
    const { data } = await api.get('cdn/stories/home', { version });
    const body = (data?.story?.content?.body ?? []) as Blok[];
    if (Array.isArray(body) && body.length > 0) {
      applyStoryblok(content, body);
    }
  } catch (error) {
    // No token, network error, or story not published yet → keep placeholder defaults.
    const status = (error as { status?: number })?.status;
    const reason = status
      ? `HTTP ${status}${status === 404 ? ' (story „home” not published yet)' : ''}`
      : error instanceof Error
        ? error.message
        : 'unknown error';
    console.warn(`[content] Storyblok unavailable — using placeholder defaults: ${reason}`);
  }

  return content;
}
