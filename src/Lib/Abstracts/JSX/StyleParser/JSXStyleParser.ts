import { JSX } from "solid-js";

import { EMPTY_ARRAY } from "@thewaver/ss-utils";

const METRIC_KEYS = [
    "font-family",
    "font-size",
    "font-style",
    "font-weight",
    "letter-spacing",
    "line-height",
    "text-transform",
    "word-spacing",
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
    "white-space",
    "visibility",
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

const camelToKebabCase = (key: string) => key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

const kebabToCamelCase = (key: string) => key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const parseMetricValue = <T>(value: T): number | undefined => {
    if (typeof value === "number") {
        return value;
    }
    if (typeof value === "string") {
        const parsed = parseFloat(value);

        return Number.isNaN(parsed) ? undefined : parsed;
    }

    return undefined;
};

const computedStyleToObject = (style: CSSStyleDeclaration | undefined) => {
    if (!style) return {};

    const obj: Record<string, string> = {};

    for (const key of style) {
        const value = style.getPropertyValue(key);
        if (value) obj[key] = value;
    }

    return obj;
};

const TEXT_METRIC_KEY_SET = new Set(METRIC_KEYS);
const INHERITED_CSS_KEY_SET = new Set(INHERITED_CSS_KEYS);

const isTextMetricKey = (key: any): key is TextMetricKey => TEXT_METRIC_KEY_SET.has(key);
const isInheritedCssKey = (key: any): key is (typeof INHERITED_CSS_KEYS)[number] => INHERITED_CSS_KEY_SET.has(key);

const splitComputedStyle = (style: CSSStyleDeclaration, parentStyle?: CSSStyleDeclaration) => {
    const metrics: TextMetricsStyle = {};
    const nonMetrics: TextNonMetricStyle = {};

    for (const key of style) {
        const value = style[key as keyof CSSStyleDeclaration] as any;

        if (!value) continue;

        const cssKey = camelToKebabCase(key);

        if (isTextMetricKey(cssKey)) {
            metrics[cssKey] = value;
        } else if (parentStyle) {
            const parentValue = parentStyle[key as keyof CSSStyleDeclaration];

            if (parentValue !== value || !isInheritedCssKey(key)) {
                nonMetrics[cssKey as keyof TextNonMetricStyle] = value;
            }
        }
    }

    return {
        metrics,
        nonMetrics,
    };
};

const isSameStyle = (a: StyledTextSegmentWithMetrics, b: StyledTextSegmentWithMetrics) =>
    JSON.stringify(a.metrics) === JSON.stringify(b.metrics);

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

                const grandParent = parent.parentElement;
                const computed = getComputedStyle(parent);
                const parentComputed = grandParent ? getComputedStyle(grandParent) : undefined;
                const { metrics, nonMetrics } = splitComputedStyle(computed, parentComputed);

                for (const part of segmenter.segment(text)) {
                    tokens.push({
                        text: part.segment,
                        metrics,
                        nonMetrics,
                    });
                }

                return;
            }

            if (node.nodeType === Node.ELEMENT_NODE) {
                for (const child of Array.from(node.childNodes)) {
                    walk(child);
                }
            }
        };

        walk(el);

        return tokens;
    };

    export const getTextSegmentMetricStyleRuns = (tokens: readonly StyledTextSegmentWithMetrics[]) => {
        const runs: StyledTextSegmentWithMetrics[][] = [];

        let current: StyledTextSegmentWithMetrics[] = [];

        for (const token of tokens) {
            if (!current.length) {
                current.push(token);
                continue;
            }

            if (isSameStyle(current[current.length - 1], token)) {
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
