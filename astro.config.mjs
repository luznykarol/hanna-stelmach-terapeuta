// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Set to the production URL once the domain is known (used for sitemap / canonical / OG).
  site: 'https://hanna-stelmach-terapeuta.netlify.app',
  vite: {
    plugins: [tailwindcss()],
  },
});
