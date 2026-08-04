import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

const EXTERNAL_PACKAGES = ["solid-js", "@solidjs/router", "@thewaver/ss-utils", "colorthief"];

const isExternal = (id: string) => EXTERNAL_PACKAGES.some((pkg) => id === pkg || id.startsWith(`${pkg}/`));

export default defineConfig({
    plugins: [solid(), vanillaExtractPlugin()],
    build: {
        outDir: "dist",
        emptyOutDir: true,
        target: "esnext",
        minify: false,
        sourcemap: true,
        cssCodeSplit: false,
        lib: {
            entry: "src/Lib/index.ts",
            formats: ["es"],
            fileName: () => "index.js",
            cssFileName: "index",
        },
        rollupOptions: {
            external: isExternal,
        },
    },
});
