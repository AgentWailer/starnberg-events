import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://starnberg-events.pages.dev',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/analytics'),
    }),
  ],
  build: {
    assets: 'assets'
  }
});
