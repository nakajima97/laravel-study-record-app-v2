import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        laravel({
            input: [
                "resources/css/app.css",
                "resources/js/app/index.tsx",
                // Blade の画面（Inertia へ移行するまで）
                "resources/js/app.js",
                "resources/js/drag-move.js",
            ],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./resources/js", import.meta.url)),
        },
    },
});
