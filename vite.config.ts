/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
import path from 'node:path';
// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

export default defineConfig({
  plugins: [
    react(),
    libInjectCss(),
    dts({
      tsconfigPath: './tsconfig.app.json',
      exclude: ['**/*.stories.tsx', '**/*.stories.ts', '**/*.mdx'],
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return '[name][extname]';
          }
          return 'assets/[name][extname]';
        },
      },
    },
    sourcemap: true,
    target: 'esnext',
    cssMinify: 'lightningcss',
  },
  css: {
    transformer: 'lightningcss',
  },
});