import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // https://kanywst.github.io/ の場合は '/' でOK（カスタムドメインなしのユーザー名.github.ioの場合）
});
