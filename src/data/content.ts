/**
 * Central placeholder content for the site.
 *
 * This mirrors the structure we will model in Storyblok. Keeping every string
 * and image reference here (instead of hardcoded in components) means the later
 * CMS integration is a single swap: replace these values with data fetched from
 * Storyblok, and the components stay untouched.
 *
 * Text is the placeholder copy visible on the Figma design.
 */

export const site = {
  logoLine1: 'stelmach + hanna',
  logoLine2: 'terapia',
  // "umów wizytę" currently points to the ZnanyLekarz profile.
  // Later this becomes a Calendly link (or stays as ZnanyLekarz) — editable in the CMS.
  bookingUrl: 'https://www.znanylekarz.pl/hanna-stelmach/psycholog-psychoterapeuta/warszawa',
  bookingLabel: 'umów wizytę',
  nav: [
    { label: 'o mnie', href: '#o-mnie' },
    { label: 'terapia', href: '#terapia' },
    { label: 'cennik', href: '#cennik' },
    { label: 'kontakt', href: '#kontakt' },
  ],
};

export const hero = {
  title: 'przestrzeń dla twojej natury',
  subtitle:
    'Profesjonalne wsparcie dla dorosłych i młodzieży w bezpiecznej atmosferze',
};

export const about = {
  id: 'o-mnie',
  heading: 'o mnie',
  // Placeholder portrait — replace with the real photo in the CMS.
  image: '',
  imageAlt: 'Hanna Stelmach — psycholog, psychoterapeuta',
  text: `Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.`,
};

export const therapy = {
  id: 'terapia',
  heading: 'terapia',
  intro:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  items: Array.from({ length: 6 }, () => ({
    image: '',
    imageAlt: '',
    name: 'terapia nazwa',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  })),
};

export const ctaBanner = {
  heading: 'pomóc ci jakoś',
};

export const pricing = {
  id: 'cennik',
  heading: 'cennik',
  intro:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
  items: [
    { name: 'rodzaj terapii', price: '250 zł', duration: '1h' },
    { name: 'rodzaj terapii', price: '250 zł', duration: '1h' },
  ],
};

export const reviews = {
  id: 'opinie',
  heading: 'opinie',
  // The reviews section is powered by the official ZnanyLekarz widget (embedded).
  // Paste the widget markup / configure the profile in ZnanyLekarz → "Kanały umawiania".
  znanylekarzProfileUrl:
    'https://www.znanylekarz.pl/hanna-stelmach/psycholog-psychoterapeuta/warszawa',
};

export const faq = {
  id: 'faq',
  heading: 'FAQ',
  items: Array.from({ length: 5 }, () => ({
    question:
      'Dlaczego cośtam Nemo enim ipsam voluptatem quia voluptas sit aspernatur?',
    answer:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  })),
};

export const contact = {
  id: 'kontakt',
  heading: 'kontakt',
  phone: { label: 'telefon', value: '+48 478 344 783', href: 'tel:+48478344783' },
  email: { label: 'mail', value: 'mail@mail.com', href: 'mailto:mail@mail.com' },
  address: { label: 'adres', value: 'ul. Ulica 4/4, 14-444 Warszawa' },
  social: { label: 'social media', links: [] as { label: string; href: string }[] },
  directionsTitle: 'Jak dotrzeć:',
  directions:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
  // Google Maps embed URL (place query) — replace with the real address embed.
  mapEmbedUrl:
    'https://www.google.com/maps?q=Warszawa&output=embed',
};

export const footer = {
  text: 'stopka',
};
