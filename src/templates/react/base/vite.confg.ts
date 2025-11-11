import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@/components": path.resolve(__dirname, "src/components"),
      "@/hooks": path.resolve(__dirname, "src/hooks"),
      "@/utils": path.resolve(__dirname, "src/utils"),
      "@/lib": path.resolve(__dirname, "src/lib"),
      "@/routes": path.resolve(__dirname, "src/routes"),
      "@/modules": path.resolve(__dirname, "src/modules"),
    },
  },
  server: {
    open: true,
    port: 5173,
  },
});
