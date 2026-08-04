import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/Lib/index.ts"],
    format: ["esm"],
    dts: { only: true },
    clean: false,
    outDir: "dist",
});
