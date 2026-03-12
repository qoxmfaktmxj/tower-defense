import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const rootPath = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@tower-defense/shared": fileURLToPath(
        new URL("../../packages/shared/src/index.ts", import.meta.url)
      ),
      "@tower-defense/game": fileURLToPath(
        new URL("../../packages/game/src/index.ts", import.meta.url)
      )
    }
  },
  server: {
    fs: {
      allow: [rootPath]
    }
  }
});
