/**
 * Content provider.
 *
 * Fetches the "home" story from Storyblok and merges it over the placeholder
 * defaults in src/data/content.ts. Every field falls back to the default when
 * missing/empty, so the site always builds — even before content is published.
 *
 * The result is memoised so Storyblok is queried once per build.
 */
import { useStoryblokApi } from '@storyblok/astro';
import {
  site as siteDefault,
  hero as heroDefault,
  about as aboutDefault,
  therapy as therapyDefault,
  ctaBanner as ctaBannerDefault,
  pricing as pricingDefault,
  reviews as reviewsDefault,
  contact as contactDefault,
  footer as footerDefault,
} from '../data/content';

type Blok = Record<string, any> & { component: string };

/** Return the Storyblok string if non-empty, otherwise the fallback. */
const str = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value.trim() !== '' ? value : fallback;

/** Extract an asset filename from a Storyblok asset field, else fallback. */
const asset = (value: any, fallback: string): string =>
  value && typeof value === 'object' && value.filename ? value.filename : fallback;

const findBlok = (body: Blok[], component: string): Blok | undefined =>
  body.find((b) => b?.component === component);

export type SiteContent = {
  site: typeof siteDefault;
  hero: typeof heroDefault;
  about: typeof aboutDefault;
  therapy: typeof therapyDefault;
  ctaBanner: typeof ctaBannerDefault;
  pricing: typeof pricingDefault;
  reviews: typeof reviewsDefault;
  contact: typeof contactDefault;
  footer: typeof footerDefault;
};

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
    footer: footerDefault,
  });
}

function applyStoryblok(content: SiteContent, body: Blok[]): void {
  const settings = findBlok(body, 'site_settings');
  if (settings) {
    content.site.logoLine1 = str(settings.logo_line1, content.site.logoLine1);
    content.site.logoLine2 = str(settings.logo_line2, content.site.logoLine2);
    content.site.bookingUrl = str(settings.booking_url, content.site.bookingUrl);
    content.site.bookingLabel = str(settings.booking_label, content.site.bookingLabel);
    content.footer.text = str(settings.footer_text, content.footer.text);
    if (Array.isArray(settings.nav) && settings.nav.length > 0) {
      content.site.nav = settings.nav.map((n: Blok, i: number) => ({
        label: str(n.label, content.site.nav[i]?.label ?? ''),
        href: str(n.href, content.site.nav[i]?.href ?? '#'),
      }));
    }
  }

  const hero = findBlok(body, 'hero');
  if (hero) {
    content.hero.title = str(hero.title, content.hero.title);
    content.hero.subtitle = str(hero.subtitle, content.hero.subtitle);
  }

  const about = findBlok(body, 'about');
  if (about) {
    content.about.heading = str(about.heading, content.about.heading);
    content.about.text = str(about.text, content.about.text);
    content.about.image = asset(about.image, content.about.image);
  }

  const therapy = findBlok(body, 'therapy');
  if (therapy) {
    content.therapy.heading = str(therapy.heading, content.therapy.heading);
    content.therapy.intro = str(therapy.intro, content.therapy.intro);
    if (Array.isArray(therapy.items) && therapy.items.length > 0) {
      content.therapy.items = therapy.items.map((it: Blok) => ({
        image: asset(it.image, ''),
        imageAlt: str(it.name, ''),
        name: str(it.name, 'terapia nazwa'),
        description: str(it.description, ''),
      }));
    }
  }

  const cta = findBlok(body, 'cta_banner');
  if (cta) {
    content.ctaBanner.heading = str(cta.heading, content.ctaBanner.heading);
  }

  const pricing = findBlok(body, 'pricing');
  if (pricing) {
    content.pricing.heading = str(pricing.heading, content.pricing.heading);
    content.pricing.intro = str(pricing.intro, content.pricing.intro);
    if (Array.isArray(pricing.items) && pricing.items.length > 0) {
      content.pricing.items = pricing.items.map((it: Blok) => ({
        name: str(it.name, 'rodzaj terapii'),
        price: str(it.price, ''),
        duration: str(it.duration, ''),
      }));
    }
  }

  const reviews = findBlok(body, 'reviews');
  if (reviews) {
    content.reviews.heading = str(reviews.heading, content.reviews.heading);
    content.reviews.znanylekarzProfileUrl = str(
      reviews.znanylekarz_profile_url,
      content.reviews.znanylekarzProfileUrl,
    );
  }

  const contact = findBlok(body, 'contact');
  if (contact) {
    content.contact.heading = str(contact.heading, content.contact.heading);
    content.contact.phone.label = str(contact.phone_label, content.contact.phone.label);
    content.contact.phone.value = str(contact.phone_value, content.contact.phone.value);
    content.contact.phone.href = `tel:${str(contact.phone_value, content.contact.phone.value).replace(/\s+/g, '')}`;
    content.contact.email.label = str(contact.email_label, content.contact.email.label);
    content.contact.email.value = str(contact.email_value, content.contact.email.value);
    content.contact.email.href = `mailto:${str(contact.email_value, content.contact.email.value)}`;
    content.contact.address.label = str(contact.address_label, content.contact.address.label);
    content.contact.address.value = str(contact.address_value, content.contact.address.value);
    content.contact.social.label = str(contact.social_label, content.contact.social.label);
    content.contact.directionsTitle = str(contact.directions_title, content.contact.directionsTitle);
    content.contact.directions = str(contact.directions, content.contact.directions);
    content.contact.mapEmbedUrl = str(contact.map_embed_url, content.contact.mapEmbedUrl);
  }
}

// Memoise the in-flight promise (not just the result) so concurrent component
// renders share a single Storyblok fetch per build instead of racing.
let cache: Promise<SiteContent> | null = null;

export function getContent(): Promise<SiteContent> {
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
