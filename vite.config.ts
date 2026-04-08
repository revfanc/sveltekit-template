import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import legacy from '@vitejs/plugin-legacy'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [legacy({
    targets: ['ie >= 11'],
    modernPolyfills: ['es.array.flat-map', 'es.array.find-last'],
  }), tailwindcss(), sveltekit()],
})
