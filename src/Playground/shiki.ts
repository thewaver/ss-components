import { CodeToHastOptions, createHighlighter } from "shiki";

const highlighterTheme = "houston";
const highlighterLangs = ["tsx", "ts", "jsx", "js", "css", "html"] as const;

type HighlighterLang = (typeof highlighterLangs)[number];

export const highlighter = await createHighlighter({
    themes: [highlighterTheme],
    langs: [...highlighterLangs], // should not be mutable in original, but whatever
});

export const getDefaultHighlighterConfig = (lang: HighlighterLang = "tsx"): CodeToHastOptions => ({
    lang,
    theme: highlighterTheme,
    transformers: [
        {
            pre(node) {
                delete node.properties.style; // removes background-color
            },
        },
    ],
});
