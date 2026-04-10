import { JSX, JSXElement } from "solid-js";

import { layoutNextLine, prepareWithSegments } from "@chenglou/pretext";
import { EMPTY_ARRAY } from "@thewaver/ss-utils";

const TEXT_METRICS_KEYS = [
    "font-family",
    "font-size",
    "font-style",
    "font-weight",
    // "letter-spacing",
    "line-height",
    "text-transform",
    // "word-spacing",
] as const;

const TEXT_RENDERING_KEYS = [
    "background",
    "background-attachment",
    "background-blend-mode",
    "background-clip",
    "background-color",
    "background-image",
    "background-origin",
    "background-position",
    "background-repeat",
    "background-size",
    "border",
    "border-block",
    "border-block-color",
    "border-block-end",
    "border-block-end-color",
    "border-block-end-style",
    "border-block-end-width",
    "border-block-start",
    "border-block-start-color",
    "border-block-start-style",
    "border-block-start-width",
    "border-block-style",
    "border-block-width",
    "border-bottom",
    "border-bottom-color",
    "border-bottom-left-radius",
    "border-bottom-right-radius",
    "border-bottom-style",
    "border-bottom-width",
    "border-color",
    "border-inline",
    "border-inline-color",
    "border-inline-end",
    "border-inline-end-color",
    "border-inline-end-style",
    "border-inline-end-width",
    "border-inline-start",
    "border-inline-start-color",
    "border-inline-start-style",
    "border-inline-start-width",
    "border-inline-style",
    "border-inline-width",
    "border-left",
    "border-left-color",
    "border-left-style",
    "border-left-width",
    "border-radius",
    "border-right",
    "border-right-color",
    "border-right-style",
    "border-right-width",
    "border-style",
    "border-top",
    "border-top-color",
    "border-top-left-radius",
    "border-top-right-radius",
    "border-top-style",
    "border-top-width",
    "border-width",
    "box-decoration-break",
    "box-shadow",
    "color",
    "direction",
    "filter",
    "font",
    "font-feature-settings",
    "font-kerning",
    "font-language-override",
    "font-optical-sizing",
    "font-palette",
    "font-size-adjust",
    "font-stretch",
    "font-synthesis",
    "font-synthesis-position",
    "font-synthesis-small-caps",
    "font-synthesis-style",
    "font-synthesis-weight",
    "font-variant",
    "font-variant-alternates",
    "font-variant-caps",
    "font-variant-east-asian",
    "font-variant-emoji",
    "font-variant-ligatures",
    "font-variant-numeric",
    "font-variant-position",
    "hyphenate-character",
    "hyphenate-limit-chars",
    "hyphens",
    "margin",
    "margin-inline",
    "margin-inline-end",
    "margin-inline-start",
    "mix-blend-mode",
    "opacity",
    "outline",
    "outline-color",
    "outline-offset",
    "outline-style",
    "outline-width",
    "padding",
    "padding-inline",
    "padding-inline-end",
    "padding-inline-start",
    "paint-order",
    "tab-size",
    "text-align",
    "text-align-last",
    "text-combine-upright",
    "text-decoration",
    "text-decoration-color",
    "text-decoration-line",
    "text-decoration-skip-ink",
    "text-decoration-style",
    "text-decoration-thickness",
    "text-emphasis",
    "text-emphasis-color",
    "text-emphasis-position",
    "text-emphasis-style",
    "text-indent",
    "text-justify",
    "text-orientation",
    "text-rendering",
    "text-shadow",
    "text-size-adjust",
    "text-underline-offset",
    "text-underline-position",
    "text-wrap",
    "text-wrap-mode",
    "text-wrap-style",
    "transform",
    "transform-box",
    "transform-origin",
    "translate",
    "unicode-bidi",
    "vertical-align",
    "visibility",
    "white-space",
    "white-space-collapse",
    "word-break",
    "word-wrap",
    "writing-mode",
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

type TextMetricKey = (typeof TEXT_METRICS_KEYS)[number];
type TextMetricsStyle = Pick<JSX.CSSProperties, TextMetricKey>;
type TextNonMetricStyle = Omit<JSX.CSSProperties, TextMetricKey>;

type TextSegmentMeta = {
    common: {
        dataset: DOMStringMap;
        title: string;
    };
    anchor?: {
        href?: string;
        target?: string;
        rel?: string;
    };
};

export type StyledTextSegmentWithMetrics = {
    text: string;
    metrics: TextMetricsStyle;
    nonMetrics: TextNonMetricStyle;
    meta: TextSegmentMeta;
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

const TEXT_METRICS_KEY_SET = new Set(TEXT_METRICS_KEYS);
const TEXT_RENDERING_KEY_SET = new Set(TEXT_RENDERING_KEYS);
const INHERITED_CSS_KEY_SET = new Set(INHERITED_CSS_KEYS);
const INLINE_EXCLUDED_CSS_KEY_SET = new Set(INLINE_EXCLUDED_CSS_KEYS);
const CANVAS_TEXT_METRICS_EXCLUDED_CSS_KEY_SET = new Set(CANVAS_TEXT_METRICS_EXCLUDED_CSS_KEYS);

const isTextMetricsKey = (key: any): key is TextMetricKey => TEXT_METRICS_KEY_SET.has(key);
const isTextRenderingKey = (key: any): key is TextMetricKey => TEXT_RENDERING_KEY_SET.has(key);
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

        if (isTextMetricsKey(cssKey)) {
            metrics[cssKey] = value;
        } else if (
            isTextRenderingKey(cssKey) &&
            !isInlineExcludedCssKey(cssKey) &&
            !isCanvasTextMetricsExcludedCssKey(cssKey)
        ) {
            const parentValue = parentStyle?.[key as keyof CSSStyleDeclaration];

            if (parentValue !== value || !isInheritedCssKey(key)) {
                nonMetrics[cssKey as keyof TextNonMetricStyle] = value;
            }
        }
    }

    nonMetrics.display = "inline";
    nonMetrics.visibility = "visible";

    return {
        metrics,
        nonMetrics,
    };
};

const isLineBreak = (value: string) => /^[\r\n\f\v\u2028\u2029]+$/.test(value);

const isBlockLike = (display?: string) =>
    display === "block" || display === "flex" || display === "grid" || display === "table" || display === "list-item";

const omitEscapedChars = (value: string) => value.replace(/[\p{Cc}\p{Zl}\p{Zp}]/gu, "");

const getMmeasuredLineHeight = (lineHeight: CSSStyleDeclaration["lineHeight"]) => {
    const probe = document.createElement("span");
    probe.textContent = "M";
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.pointerEvents = "none";
    probe.style.whiteSpace = "pre";
    probe.style.lineHeight = lineHeight;

    document.body.appendChild(probe);

    const height = probe.offsetHeight;

    probe.remove();

    console.log({
        lineHeight,
        height,
    });

    return height;
};

const replaceTabs = (text: string) =>
    text
        .replace(/\v/g, "")
        .replace(/(?<= )\t|\t(?= )/g, "")
        .replace(/\t/g, " ");

export namespace JSXStyleParser {
    export const discardTextNodeTabs = <T extends JSX.Element | { props: { children: JSX.Element } }>(node: T): T => {
        if (!node) return undefined as T;
        if (typeof node === "string") {
            return replaceTabs(node) as T;
        } else if (Array.isArray(node)) {
            return node.map(discardTextNodeTabs) as T;
        } else if (typeof node === "object" && "props" in node && node.props.children) {
            return {
                ...node,
                props: {
                    ...node.props,
                    children: discardTextNodeTabs(node.props.children as T),
                },
            } as T;
        }
        return node;
    };

    export const getTextSegmentTokens = (
        el: Node,
        granularity: Intl.SegmenterOptions["granularity"] = "word",
    ): readonly StyledTextSegmentWithMetrics[] => {
        if (!el) return EMPTY_ARRAY;

        const tokens: StyledTextSegmentWithMetrics[] = [];
        const segmenter = new Intl.Segmenter(undefined, { granularity });

        const walk = (node: Node, meta: TextSegmentMeta) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent ?? "";

                if (!text) return;

                const parent = node.parentElement;

                if (!parent) return;

                const { computed, parentComputed } = getComputedStyles(parent);
                const { metrics, nonMetrics } = splitComputedStyle(computed, parentComputed);

                for (const part of segmenter.segment(text)) {
                    tokens.push({
                        text: replaceTabs(part.segment),
                        metrics,
                        nonMetrics,
                        meta,
                    });
                }

                return;
            }

            if (node.nodeType !== Node.ELEMENT_NODE) return;

            const element = node as HTMLElement;
            const { computed, parentComputed } = getComputedStyles(element);
            const { metrics, nonMetrics } = splitComputedStyle(computed, parentComputed);
            const nextMeta = {
                ...meta,
                common: {
                    dataset: element.dataset,
                    title: element.title,
                },
            };

            if (element instanceof HTMLAnchorElement) {
                nextMeta.anchor = {
                    href: element.href,
                    target: element.target,
                    rel: element.rel,
                };
            }

            const isLineBreak = element.nodeName === "BR";
            const lineBreakToken: StyledTextSegmentWithMetrics = {
                text: "\n",
                metrics,
                nonMetrics,
                meta: nextMeta,
            };

            if (isLineBreak || (isBlockLike(computed.display) && tokens.length)) {
                tokens.push({ ...lineBreakToken });
            }

            if (isLineBreak) return;

            for (const child of Array.from(element.childNodes)) {
                walk(child, nextMeta);
            }

            if (isBlockLike(computed.display)) {
                tokens.push({ ...lineBreakToken });
            }
        };

        walk(el, {
            common: {
                dataset: {},
                title: "",
            },
        });

        return tokens;
    };

    export const isSameMetricsStyle = (a: StyledTextSegmentWithMetrics, b: StyledTextSegmentWithMetrics) =>
        JSON.stringify(a.metrics) === JSON.stringify(b.metrics);

    export const isSameNonMetricsStyle = (a: StyledTextSegmentWithMetrics, b: StyledTextSegmentWithMetrics) =>
        JSON.stringify(a.nonMetrics) === JSON.stringify(b.nonMetrics);

    export const groupIdenticalTextSegments = (
        tokens: readonly StyledTextSegmentWithMetrics[],
        compare: (A: StyledTextSegmentWithMetrics, B: StyledTextSegmentWithMetrics) => boolean,
    ) => {
        const runs: StyledTextSegmentWithMetrics[][] = [];

        let current: StyledTextSegmentWithMetrics[] = [];

        for (const token of tokens) {
            if (isLineBreak(token.text)) {
                if (current.length) {
                    runs.push(current);
                }

                runs.push([token]);
                current = [];
                continue;
            }
            if (!current.length || compare(current[current.length - 1], token)) {
                current.push(token);
                continue;
            }

            runs.push(current);
            current = [token];
        }

        if (current.length) runs.push(current);

        return runs;
    };

    export const getSegmentsByLine = (segments: StyledTextSegmentWithMetrics[][], width: number) => {
        const lines: StyledTextSegmentWithMetrics[][] = [[]];

        let lineIndex = 0;
        let remainingWidth = width;

        const startNewLine = () => {
            lineIndex++;
            lines[lineIndex] ??= [];
            remainingWidth = width;
        };

        for (const segment of segments) {
            const metrics = segment[0].metrics;
            const joinedText = segment.map((t) => t.text).join("");

            if (isLineBreak(joinedText)) {
                startNewLine();
                continue;
            }

            const transformedText = applyTextTransform(joinedText, metrics["text-transform"]);
            const font = [
                `${metrics["font-style"]}`,
                `${metrics["font-weight"]}`,
                `${metrics["font-size"]}`,
                `${metrics["font-family"]}`,
            ]
                .filter(Boolean)
                .join(" ");

            const prepared = prepareWithSegments(transformedText, font, {
                whiteSpace: "pre-wrap",
            });

            let cursor = { segmentIndex: 0, graphemeIndex: 0 };
            let tokenIndex = 0;

            while (true) {
                const lineInfo = layoutNextLine(prepared, cursor, remainingWidth);

                if (!lineInfo) break;

                let count = 0;
                let consumedTokens = 0;

                for (let i = tokenIndex; i < segment.length; i++) {
                    const token = segment[i].text;
                    count += omitEscapedChars(token).length;
                    consumedTokens++;

                    if (count >= lineInfo.text.length) break;
                }

                for (let i = 0; i < consumedTokens; i++) {
                    lines[lineIndex].push(segment[tokenIndex + i]);
                }

                tokenIndex += consumedTokens;

                const nextRemainingWidth = remainingWidth - lineInfo.width;

                if (tokenIndex < segment.length || nextRemainingWidth <= 0) {
                    startNewLine();
                } else {
                    remainingWidth = nextRemainingWidth;
                }

                cursor = lineInfo.end;
            }
        }

        return lines;
    };
}
