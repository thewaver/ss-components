import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

const EXTERNAL_PACKAGES = ["solid-js", "@thewaver/ss-utils", "colorthief", "@tanstack/solid-virtual"];

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
            cssFileName: "index",
        },
        rollupOptions: {
            external: isExternal,
            output: {
                preserveModules: true,
                preserveModulesRoot: "src/Lib",
                entryFileNames: (chunk) => `${chunk.name.replace(/^(?:.*\/)?node_modules\//, "_external/")}.js`,
            },
        },
    },
});
