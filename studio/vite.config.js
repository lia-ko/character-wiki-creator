import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// The repo's top-level /fonts is symlinked into public/fonts, so both the
// editor and its static exports can reference /fonts/<Family>/<file>.ttf.
export default defineConfig({
  plugins: [svelte()],
  base: './',
});
