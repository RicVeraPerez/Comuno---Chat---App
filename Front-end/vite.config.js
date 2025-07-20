import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Aquí le dices que todo lo que empiece con /api lo redirija al backend
      "/api": {
        target: "http://localhost:5001", // Cambia este puerto si tu backend corre en otro
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
