import { JSX } from "solid-js";

import { EMPTY_ARRAY } from "@thewaver/ss-utils";

const METRIC_KEYS = [
    "font-family",
    "font-size",
    "font-style",
    "font-weight",
    // "letter-spacing",
    "line-height",
    "text-transform",
    // "word-spacing",
] as const;

const INHERITED_CSS_KEYS = [
    "color",
    "cursor",
    "direction",
    "font-variant",
    "letter-spacing",
    "list-style-image",
    "list-style-position",
    "list-style-type",
    "quotes",
    "tab-size",
    "text-align",
    "text-combine-upright",
    "text-indent",
    "text-orientation",
    "text-shadow",
    "visibility",
    "white-space",
    "word-spacing",
    "writing-mode",
] as const;

const INLINE_EXCLUDED_CSS_KEYS = [
    "align-content",
    "align-items",
    "align-self",
    "block-size",
    "bottom",
    "clear",
    "col-gap",
    "column-count",
    "column-fill",
    "column-gap",
    "column-rule",
    "column-rule-color",
    "column-rule-style",
    "column-rule-width",
    "column-span",
    "column-width",
    "columns",
    "flex",
    "flex-basis",
    "flex-direction",
    "flex-flow",
    "flex-grow",
    "flex-shrink",
    "flex-wrap",
    "grid-area",
    "grid-auto-columns",
    "grid-auto-flow",
    "grid-auto-rows",
    "grid-column-start",
    "grid-column-end",
    "grid-row-start",
    "grid-row-end",
    "grid-template",
    "grid-template-areas",
    "grid-template-columns",
    "grid-template-rows",
    "height",
    "inline-size",
    "inset-block-end",
    "inset-block-start",
    "inset-inline-end",
    "inset-inline-start",
    "justify-content",
    "justify-items",
    "justify-self",
    "left",
    "margin-block-end",
    "margin-block-start",
    "margin-bottom",
    "margin-top",
    "max-block-size",
    "max-height",
    "max-inline-size",
    "max-width",
    "min-block-size",
    "min-height",
    "min-inline-size",
    "min-width",
    "order",
    "place-self",
    "position-anchor",
    "right",
    "row-gap",
    "top",
    "width",
    "z-index",
] as const;

const CANVAS_TEXT_METRICS_EXCLUDED_CSS_KEYS = [
    "font-feature-settings",
    "font-language-override",
    "font-variant",
    "font-variant-alternates",
    "font-variant-caps",
    "font-variant-east-asian",
    "font-variant-ligatures",
    "font-variant-numeric",
    "font-variant-position",
    "hyphens",
    "line-break",
    "line-height",
    "overflow-wrap",
    "tab-size",
    "text-autospace",
    "text-combine-upright",
    "text-indent",
    "text-justify",
    "text-overflow",
    "text-rendering",
    "text-spacing-trim",
    "text-transform",
    "white-space",
    "word-break",
    "writing-mode",
] as const;

type TextMetricKey = (typeof METRIC_KEYS)[number];
type TextMetricsStyle = Pick<JSX.CSSProperties, TextMetricKey>;
type TextNonMetricStyle = Omit<JSX.CSSProperties, TextMetricKey>;

export type StyledTextSegmentWithMetrics = {
    text: string;
    metrics: TextMetricsStyle;
    nonMetrics: TextNonMetricStyle;
};

export const applyTextTransform = (text: string, transform?: JSX.CSSProperties["text-transform"]): string => {
    switch (transform) {
        case "uppercase":
            return text.toUpperCase();
        case "lowercase":
            return text.toLowerCase();
        case "capitalize":
            return text.replace(/\b\p{L}/gu, (m) => m.toUpperCase());
        default:
            return text;
    }
};

const camelToKebabCase = (key: string) => key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

const kebabToCamelCase = (key: string) => key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const TEXT_METRIC_KEY_SET = new Set(METRIC_KEYS);
const INHERITED_CSS_KEY_SET = new Set(INHERITED_CSS_KEYS);
const INLINE_EXCLUDED_CSS_KEY_SET = new Set(INLINE_EXCLUDED_CSS_KEYS);
const CANVAS_TEXT_METRICS_EXCLUDED_CSS_KEY_SET = new Set(CANVAS_TEXT_METRICS_EXCLUDED_CSS_KEYS);

const isTextMetricKey = (key: any): key is TextMetricKey => TEXT_METRIC_KEY_SET.has(key);
const isInheritedCssKey = (key: any): key is (typeof INHERITED_CSS_KEYS)[number] => INHERITED_CSS_KEY_SET.has(key);
const isInlineExcludedCssKey = (key: any): key is (typeof INLINE_EXCLUDED_CSS_KEYS)[number] =>
    INLINE_EXCLUDED_CSS_KEY_SET.has(key);
const isCanvasTextMetricsExcludedCssKey = (key: any): key is (typeof CANVAS_TEXT_METRICS_EXCLUDED_CSS_KEYS)[number] =>
    CANVAS_TEXT_METRICS_EXCLUDED_CSS_KEY_SET.has(key);

const getComputedStyles = (node: Node) => {
    const grandParent = node.parentElement;
    const computed = getComputedStyle(node as HTMLElement);
    const parentComputed = grandParent ? getComputedStyle(grandParent) : undefined;

    return { computed, parentComputed };
};

const splitComputedStyle = (style: CSSStyleDeclaration, parentStyle?: CSSStyleDeclaration) => {
    const metrics: TextMetricsStyle = {};
    const nonMetrics: TextNonMetricStyle = {};

    for (const key of style) {
        const value = style[key as keyof CSSStyleDeclaration] as any;

        if (!value) continue;

        const cssKey = camelToKebabCase(key);

        if (isTextMetricKey(cssKey)) {
            metrics[cssKey] = value;
        } else if (!isInlineExcludedCssKey(cssKey) && !isCanvasTextMetricsExcludedCssKey(cssKey) && parentStyle) {
            const parentValue = parentStyle[key as keyof CSSStyleDeclaration];

            if (parentValue !== value || !isInheritedCssKey(key)) {
                nonMetrics[cssKey as keyof TextNonMetricStyle] = value;
            }
        }
    }

    nonMetrics.display = "inline";

    return {
        metrics,
        nonMetrics,
    };
};

const isBlockLike = (display?: string) =>
    display === "block" || display === "flex" || display === "grid" || display === "table" || display === "list-item";

export namespace JSXStyleParser {
    export const getTextSegmentTokens = (
        el: Node,
        granularity: Intl.SegmenterOptions["granularity"] = "word",
    ): readonly StyledTextSegmentWithMetrics[] => {
        if (!el) return EMPTY_ARRAY;

        const tokens: StyledTextSegmentWithMetrics[] = [];
        const segmenter = new Intl.Segmenter(undefined, { granularity });

        const walk = (node: Node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent ?? "";

                if (!text) return;

                const parent = node.parentElement;

                if (!parent) return;

                const { computed, parentComputed } = getComputedStyles(parent);
                const { metrics, nonMetrics } = splitComputedStyle(computed, parentComputed);

                for (const part of segmenter.segment(text)) {
                    tokens.push({ text: part.segment, metrics, nonMetrics });
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const { computed, parentComputed } = getComputedStyles(node);
                const { metrics, nonMetrics } = splitComputedStyle(computed, parentComputed);
                const isLineBreak = node.nodeName === "BR";
                const lineBreakToken: StyledTextSegmentWithMetrics = { text: "\n", metrics, nonMetrics };

                if (isLineBreak || (isBlockLike(computed.display) && tokens.length)) {
                    tokens.push({ ...lineBreakToken });
                }

                if (isLineBreak) return;

                for (const child of Array.from(node.childNodes)) {
                    walk(child);
                }

                if (isBlockLike(computed.display)) {
                    tokens.push({ ...lineBreakToken });
                }
            }
        };

        walk(el);

        return tokens;
    };

    export const isSameMetricsStyle = (a: StyledTextSegmentWithMetrics, b: StyledTextSegmentWithMetrics) =>
        JSON.stringify(a.metrics) === JSON.stringify(b.metrics);

    export const isSameNonMetricsStyle = (a: StyledTextSegmentWithMetrics, b: StyledTextSegmentWithMetrics) =>
        JSON.stringify(a.nonMetrics) === JSON.stringify(b.nonMetrics);

    export const mergeIdenticalTextSegments = (
        tokens: readonly StyledTextSegmentWithMetrics[],
        compare: (A: StyledTextSegmentWithMetrics, B: StyledTextSegmentWithMetrics) => boolean,
    ) => {
        const runs: StyledTextSegmentWithMetrics[][] = [];

        let current: StyledTextSegmentWithMetrics[] = [];

        for (const token of tokens) {
            if (!current.length) {
                current.push(token);
                continue;
            }

            if (compare(current[current.length - 1], token)) {
                current.push(token);
                continue;
            }

            runs.push(current);
            current = [token];
        }

        if (current.length) runs.push(current);

        return runs;
    };
}
