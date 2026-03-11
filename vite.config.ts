import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import solid from "vite-plugin-solid";

import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        solid(),
        checker({
            typescript: {
                tsconfigPath: "./tsconfig.json",
            },
        }),
        vanillaExtractPlugin(),
    ],
    server: {
        port: 8080,
    },
});
