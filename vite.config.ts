import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
  process.env.VITE_SITE_URL ??= command === 'serve' ? 'http://localhost:5173' : 'http://localhost:4173';

  return {
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
      tsconfigPaths: true,
    },
  };
});
