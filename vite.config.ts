import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

const postBuild = () => ({
  name: 'postbuild-commands',
  closeBundle: async () => {
    console.log('[closeCommon]');
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts(), postBuild()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      name: '@vert-capital/common',
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
    },
  },
});
