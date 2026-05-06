import type { CodeToHastOptions } from "shiki";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import css from "shiki/langs/css.mjs";
import json from "shiki/langs/json.mjs";
import tsx from "shiki/langs/tsx.mjs";
import ts from "shiki/langs/typescript.mjs";
import houston from "shiki/themes/houston.mjs";

export const highlighter = await createHighlighterCore({
    themes: [houston],
    langs: [ts, tsx, css, json],
    engine: createJavaScriptRegexEngine(),
});

export const getDefaultHighlighterConfig = (lang: "ts" | "tsx" | "css" | "json" = "tsx"): CodeToHastOptions => ({
    lang,
    theme: houston,
    transformers: [
        {
            pre(node) {
                delete node.properties.style; // removes background-color
            },
        },
    ],
});
