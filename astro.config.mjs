import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://starnberg-events.pages.dev',
  output: 'static',
  build: {
    assets: 'assets'
  }
});
