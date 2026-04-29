import { createHighlighter } from "shiki";

export const highlighterTheme = "houston";

export const highlighter = await createHighlighter({
    themes: [highlighterTheme],
    langs: ["tsx", "ts", "jsx", "js", "css", "html"],
});
