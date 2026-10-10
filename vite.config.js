import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/ziaulain-alizai-calculator/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    include: ['src/tests/**/*.test.{js,jsx}'],
  },
});
