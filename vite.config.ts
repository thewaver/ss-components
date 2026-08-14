import { readFile } from "node:fs/promises";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import solid from "vite-plugin-solid";

import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

const SOURCE_QUERY = "?source";
const SOURCE_PREFIX = "\0source:";
const SOURCE_SUFFIX = ".source";

const playgroundSource = (): Plugin => ({
    name: "playground-source",
    enforce: "pre",
    async resolveId(source, importer) {
        if (!source.endsWith(SOURCE_QUERY)) return undefined;

        const resolved = await this.resolve(source.slice(0, -SOURCE_QUERY.length), importer, { skipSelf: true });

        return resolved ? `${SOURCE_PREFIX}${resolved.id}${SOURCE_SUFFIX}` : undefined;
    },
    async load(id) {
        if (!id.startsWith(SOURCE_PREFIX)) return undefined;

        const path = id.slice(SOURCE_PREFIX.length, -SOURCE_SUFFIX.length);

        return `export default ${JSON.stringify(await readFile(path, "utf8"))};`;
    },
});

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        playgroundSource(),
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
    build: {
        outDir: "playground-dist",
        emptyOutDir: true,
    },
});
