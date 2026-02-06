import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://pöcking.info', // Production custom domain
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
