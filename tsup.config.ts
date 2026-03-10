import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/lib/index.ts"],
    format: ["esm"],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    external: ["solid-js"],
});
