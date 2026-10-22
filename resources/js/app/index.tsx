import { createInertiaApp } from "@inertiajs/react";
import type { ComponentType } from "react";
import { createRoot } from "react-dom/client";

// Inertia のページ名は pages レイヤーのスライス名（例: dashboard → pages/dashboard/index.ts）
const pages = import.meta.glob<{ default: ComponentType }>("../pages/*/index.ts");

void createInertiaApp({
    resolve: async (name) => {
        const page = pages[`../pages/${name}/index.ts`];
        if (page === undefined) {
            throw new Error(`ページ ${name} が見つからない`);
        }
        return (await page()).default;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: "#4B5563",
    },
});
