// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { storyblok } from '@storyblok/astro';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

// https://astro.build/config
export default defineConfig({
  // Set to the production URL once the domain is known (used for sitemap / canonical / OG).
  site: 'https://hanna-stelmach-terapeuta.netlify.app',
  integrations: [
    storyblok({
      accessToken: env.STORYBLOK_TOKEN,
      // Content is mapped manually in src/lib/content.ts (not via <StoryblokComponent>),
      // so no component map is needed here. The integration still provides the API
      // client and the visual-editing bridge.
      apiOptions: { region: 'eu' },
      // Enable the visual editor bridge only in dev; production is a static build.
      bridge: process.env.NODE_ENV !== 'production',
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
