import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/Lib/index.ts"],
    format: ["esm"],
    dts: true,
    clean: true,
    outDir: "dist",
});
