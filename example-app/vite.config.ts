import react from "@vitejs/plugin-react";
import helium from "helium/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [helium(), react()],
  server: {
    port: 5173,
  },
});
