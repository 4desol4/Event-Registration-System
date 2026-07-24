import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// CRITICAL CONSTRAINT: this app must load fast on low-end phones over weak
// data connections. Every setting here is chosen with that in mind —
// aggressive minification, no unnecessary polyfills, small chunk output.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
  },
  build: {
    target: "es2018", // modern-enough phones support this; avoids heavy legacy transpilation
    minify: "esbuild",
    cssMinify: true,
    chunkSizeWarningLimit: 150, // warn early if any chunk creeps up
    rollupOptions: {
      output: {
        manualChunks: {
          reactVendor: ["react", "react-dom", "react-router-dom"],
          socketVendor: ["socket.io-client"],
          uiVendor: ["lucide-react"],
        },
      },
    },
  },
});
