import { deepEqual } from "fast-equals";
import { JSX } from "solid-js";

import { EMPTY_ARRAY, Size2d, StringUtils } from "@thewaver/ss-utils";

import { JSXStyleUtils } from "../JSXStyle.utils";
import { JSXStyleConst } from "./JSXStyle.const";

/////

export namespace StringUtils2 {
    export const splitByLinebreaks = (s: string) => s.split(/([\r\n\f\v\p{Zl}\p{Zp}]+)/gu);

    export const isWhitespace = (s: string) => /^\s+$/.test(s);

    export const isClosingPunctuation = (s: string) => /^[\p{Pe}\p{Pf}\p{Po}\p{S}]*$/u.test(s) && !/^\p{Pi}+$/u.test(s);

    export const intlSegmentsToStrings = (segments: Intl.Segments): string[] => Array.from(segments, (s) => s.segment);

    export const intlSegmentsArrayToStrings = (segmentsArr: Intl.Segments[]): string[] =>
        segmentsArr.flatMap((segments) => Array.from(segments, (s) => s.segment));

    export const mergePunctuation = (tokens: string[]) => {
        const result: string[] = [];

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            if (isClosingPunctuation(token)) {
                if (!result.length) {
                    result.push(token);
                } else {
                    result[result.length - 1] += token;
                }
            } else {
                if (isWhitespace(token)) {
                    result.push(...token.split(""));
                } else {
                    result.push(token);
                }
            }
        }

        return result;
    };

    export const measureTextWidths = (() => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: false });

        return (texts: string[], metrics: TextMetricsStyle): number[] => {
            if (!ctx) return texts.map(() => 0);

            ctx.font = `${metrics["font-style"] ?? "normal"} ${metrics["font-weight"] ?? "normal"} ${metrics["font-size"] ?? "1rem"} ${metrics["font-family"] ?? "sans-serif"}`;

            const results: number[] = new Array(texts.length);

            for (let i = 0; i < texts.length; i++) {
                const text = texts[i];
                const letterSpacing =
                    typeof metrics["letter-spacing"] === "number"
                        ? metrics["letter-spacing"]
                        : parseFloat(metrics["letter-spacing"] ?? "0");

                if (StringUtils2.isWhitespace(texts[i])) {
                    const wordSpacing =
                        typeof metrics["word-spacing"] === "number"
                            ? metrics["word-spacing"]
                            : parseFloat(metrics["word-spacing"] ?? "0");

                    results[i] =
                        ctx.measureText(text).width + (text.length - 1) * letterSpacing + text.length * wordSpacing;
                } else {
                    const transformedText =
                        typeof metrics["text-transform"] === "string"
                            ? StringUtils.applyTextTransform(text, metrics["text-transform"])
                            : text;

                    results[i] = ctx.measureText(transformedText).width + (transformedText.length - 1) * letterSpacing;
                }
            }

            return results;
        };
    })();

    export const getNormalizedFontSizes = (
        texts: string[],
        metrics: TextMetricsStyle,
        containerSize: Size2d,
        opts?: {
            lineHeightRatios: number[];
        },
    ): number[] => {
        const fontSize =
            typeof metrics["font-size"] === "number" ? metrics["font-size"] : parseFloat(metrics["font-size"] ?? "NaN");

        if (Number.isNaN(fontSize)) return texts.map(() => 0);

        const textWidths = measureTextWidths(texts, metrics).map((w) => (fontSize * containerSize.width) / w);
        const totalHeight = textWidths.reduce((res, cur, idx) => res + cur * (opts?.lineHeightRatios[idx] ?? 1), 0);
        const ratio = Math.min(containerSize.height / totalHeight, 1);

        return textWidths.map((size) => Math.floor(size * ratio));
    };
}

console.log(
    StringUtils2.mergePunctuation([
        "I",
        " ",
        "am",
        " ",
        "a",
        " ",
        "brown",
        ",",
        " ",
        "crispy",
        " ",
        "potatoe",
        "   ",
        "!",
        "?",
        "...",
    ]),
);

/////

type TextMetricKey = (typeof JSXStyleConst.TEXT_METRICS_KEYS)[number];
type TextMetricsStyle = Pick<JSX.CSSProperties, TextMetricKey>;
type TextNonMetricStyle = Omit<JSX.CSSProperties, TextMetricKey>;

type SegmentType = "text" | "linebreak" | "atomic";

type StyledTextSegmentMeta = {
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

export type StyledTextSegment = {
    type: Extract<SegmentType, "text">;
    text: string;
    metrics: TextMetricsStyle;
    nonMetrics: TextNonMetricStyle;
    meta: StyledTextSegmentMeta;
};

export type LineBreakSegment = {
    type: Extract<SegmentType, "linebreak">;
};

export type AtomicElementSegment = {
    type: Extract<SegmentType, "atomic">;
    element: HTMLElement;
    isBlockLike?: boolean;
};

export type ElementSegment = StyledTextSegment | LineBreakSegment | AtomicElementSegment;

const lineBreakToken: LineBreakSegment = { type: "linebreak" };
const wordSegmenter = new Intl.Segmenter(undefined, { granularity: "word" });

const getComputedStyles = (node: Node) => {
    const grandParent = node.parentElement;
    const computed = getComputedStyle(node as HTMLElement);
    const parentComputed = grandParent ? getComputedStyle(grandParent) : undefined;

    return { computed, parentComputed };
};

const isUsedStyleKey = (cssKey: string) =>
    JSXStyleUtils.isTextRenderingKey(cssKey) &&
    !JSXStyleUtils.isInlineExcludedCssKey(cssKey) &&
    !JSXStyleUtils.isCanvasTextMetricsExcludedCssKey(cssKey);

const splitComputedStyle = (style: CSSStyleDeclaration, parentStyle?: CSSStyleDeclaration) => {
    const metrics: TextMetricsStyle = {};
    const nonMetrics: TextNonMetricStyle = {};

    for (const key of style) {
        const value = style[key as keyof CSSStyleDeclaration] as any;

        if (!value) continue;

        const cssKey = StringUtils.camelToKebabCase(key);

        if (JSXStyleUtils.isTextMetricsKey(cssKey)) {
            metrics[cssKey] = value;
        } else if (isUsedStyleKey(cssKey)) {
            const parentValue = parentStyle?.[key as keyof CSSStyleDeclaration];

            if (parentValue !== value || !JSXStyleUtils.isInheritedCssKey(key)) {
                nonMetrics[cssKey as keyof TextNonMetricStyle] = value;
            }
        }
    }

    nonMetrics.display = "inline";
    nonMetrics.visibility = "visible";

    return { metrics, nonMetrics };
};

export namespace JSXStyleParser {
    export const isSameMetricsStyle = (a: StyledTextSegment, b: StyledTextSegment) => deepEqual(a.metrics, b.metrics);

    export const isSameNonMetricsStyle = (a: StyledTextSegment, b: StyledTextSegment) =>
        deepEqual(a.nonMetrics, b.nonMetrics);

    export const isSameMeta = (a: StyledTextSegment, b: StyledTextSegment) => deepEqual(a.meta, b.meta);

    export const getSegmentTokens = (el: Node): readonly ElementSegment[] => {
        if (!el) return EMPTY_ARRAY;

        const tokens: ElementSegment[] = [];

        const walk = (node: Node, meta: StyledTextSegmentMeta) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent ?? "";

                if (!text) return;

                const parent = node.parentElement;

                if (!parent) return;

                const { computed, parentComputed } = getComputedStyles(parent);
                const { metrics, nonMetrics } = splitComputedStyle(computed, parentComputed);

                for (const part of StringUtils2.splitByLinebreaks(text)) {
                    const parsedPart = StringUtils.replaceTabs(part);

                    if (StringUtils.isLineBreak(parsedPart)) {
                        tokens.push(lineBreakToken);
                    } else {
                        tokens.push({
                            type: "text",
                            text: parsedPart,
                            metrics,
                            nonMetrics,
                            meta,
                        });
                    }
                }

                return;
            }

            if (node.nodeType !== Node.ELEMENT_NODE) return;

            const element = node as HTMLElement;

            if (element.nodeName === "BR") {
                tokens.push(lineBreakToken);

                return;
            }

            const computed = getComputedStyle(element);
            const isBlockLike = JSXStyleUtils.isBlockLike(computed.display);

            if (element.childNodes.length === 0 && computed.display !== "contents") {
                tokens.push({
                    type: "atomic",
                    element: node.cloneNode(true) as HTMLElement,
                    isBlockLike,
                });
            } else {
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

                if (isBlockLike && tokens.length > 0) {
                    tokens.push(lineBreakToken);
                }

                for (const child of Array.from(element.childNodes)) {
                    walk(child, nextMeta);
                }

                if (isBlockLike && tokens.length > 0) {
                    tokens.push(lineBreakToken);
                }
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

    export const groupIdenticalTextSegments = (
        segments: readonly ElementSegment[],
        compare: (A: StyledTextSegment, B: StyledTextSegment) => boolean,
    ) => {
        const groups: ElementSegment[][] = [];

        let current: ElementSegment[] = [];

        for (const segment of segments) {
            if (segment.type === "linebreak" || segment.type === "atomic") {
                if (current.length) {
                    groups.push(current);
                }

                groups.push([segment]);
                current = [];

                continue;
            } else if (!current.length || compare(current.at(-1) as StyledTextSegment, segment)) {
                current.push(segment);

                continue;
            }

            groups.push(current);
            current = [segment];
        }

        if (current.length) groups.push(current);

        return groups;
    };

    export const getInlinedSegments = (segments: readonly ElementSegment[], width: number) => {
        const result: ElementSegment[] = [];
        const identicalSegmentGroups = groupIdenticalTextSegments(
            segments,
            (a, b) => isSameMeta(a, b) && isSameMetricsStyle(a, b) && isSameNonMetricsStyle(a, b),
        );

        let remainingWidth = width;
        let segmentId = 0;
        let lastTextSegmentId = 0;

        const addLineBreak = () => {
            result.push(lineBreakToken);
            remainingWidth = width;
        };

        const addToken = (token: ElementSegment, tokenWidth: number) => {
            if (tokenWidth > remainingWidth) {
                addLineBreak();
            }

            const prevToken = result.at(-1);

            if (segmentId === lastTextSegmentId && prevToken?.type === "text" && token.type === "text") {
                prevToken.text += token.text;
            } else {
                result.push(token);
            }

            remainingWidth -= tokenWidth;

            if (token.type === "text") {
                lastTextSegmentId = segmentId;
            }
        };

        for (const segment of identicalSegmentGroups) {
            switch (segment[0].type) {
                case "atomic": {
                    for (const token of segment) {
                        addToken(
                            token,
                            (token as AtomicElementSegment).isBlockLike
                                ? width
                                : (token as AtomicElementSegment).element.offsetWidth,
                        );
                    }

                    break;
                }
                case "linebreak": {
                    addLineBreak();

                    break;
                }
                case "text": {
                    const metrics = segment[0].metrics;
                    const intlSegments = segment.flatMap((s) => wordSegmenter.segment((s as StyledTextSegment).text));
                    const texts = StringUtils2.mergePunctuation(StringUtils2.intlSegmentsArrayToStrings(intlSegments));
                    const transformedTexts =
                        typeof metrics["text-transform"] === "string"
                            ? texts.map((t) => StringUtils.applyTextTransform(t, metrics["text-transform"]))
                            : texts;

                    const widths = StringUtils2.measureTextWidths(transformedTexts, metrics);

                    for (let idx = 0; idx < transformedTexts.length; idx++) {
                        addToken({ ...segment[0], text: texts[idx] }, widths[idx]);
                    }

                    break;
                }
            }

            segmentId++;
        }

        return result;
    };
}
