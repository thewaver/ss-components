import path from "path";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

export default defineConfig({
    root: "src/Playground",
    plugins: [solidPlugin(), vanillaExtractPlugin()],
    resolve: {
        alias: {
            "@ss-components": path.resolve(__dirname, "src/Lib"),
        },
    },
    build: {
        target: "esnext",
        outDir: "../../dist-playground", // relative to root
        emptyOutDir: true,
    },
});
