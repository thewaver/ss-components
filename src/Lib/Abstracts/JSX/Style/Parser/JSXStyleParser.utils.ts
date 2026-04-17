import { JSX } from "solid-js";

import { layoutNextLine, prepareWithSegments } from "@chenglou/pretext";
import { EMPTY_ARRAY, StringUtils } from "@thewaver/ss-utils";

import { JSXStyleUtils } from "../JSXStyle.utils";
import { JSXStyleConst } from "./JSXStyle.const";

type TextMetricKey = (typeof JSXStyleConst.TEXT_METRICS_KEYS)[number];
type TextMetricsStyle = Pick<JSX.CSSProperties, TextMetricKey>;
type TextNonMetricStyle = Omit<JSX.CSSProperties, TextMetricKey>;

export type StyledTextSegmentMeta = {
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
    text: string;
    metrics: TextMetricsStyle;
    nonMetrics: TextNonMetricStyle;
    meta: StyledTextSegmentMeta;
};

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

        const cssKey = StringUtils.camelToKebabCase(key);

        if (JSXStyleUtils.isTextMetricsKey(cssKey)) {
            metrics[cssKey] = value;
        } else if (
            JSXStyleUtils.isTextRenderingKey(cssKey) &&
            !JSXStyleUtils.isInlineExcludedCssKey(cssKey) &&
            !JSXStyleUtils.isCanvasTextMetricsExcludedCssKey(cssKey)
        ) {
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
    export const getTextSegmentTokens = (el: Node): readonly StyledTextSegment[] => {
        if (!el) return EMPTY_ARRAY;

        const tokens: StyledTextSegment[] = [];

        const walk = (node: Node, meta: StyledTextSegmentMeta) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent ?? "";

                if (!text) return;

                const parent = node.parentElement;

                if (!parent) return;

                const { computed, parentComputed } = getComputedStyles(parent);
                const { metrics, nonMetrics } = splitComputedStyle(computed, parentComputed);

                for (const part of text.split(/([\r\n\f\v\p{Zl}\p{Zp}]+)/gu)) {
                    tokens.push({
                        text: StringUtils.replaceTabs(part),
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
            const lineBreakToken: StyledTextSegment = {
                text: "\n",
                metrics,
                nonMetrics,
                meta: nextMeta,
            };

            if (isLineBreak || (JSXStyleUtils.isBlockLike(computed.display) && tokens.length)) {
                tokens.push({ ...lineBreakToken });
            }

            if (isLineBreak) return;

            for (const child of Array.from(element.childNodes)) {
                walk(child, nextMeta);
            }

            if (JSXStyleUtils.isBlockLike(computed.display)) {
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

    export const isSameMetricsStyle = (a: StyledTextSegment, b: StyledTextSegment) =>
        JSON.stringify(a.metrics) === JSON.stringify(b.metrics);

    export const isSameNonMetricsStyle = (a: StyledTextSegment, b: StyledTextSegment) =>
        JSON.stringify(a.nonMetrics) === JSON.stringify(b.nonMetrics);

    export const groupIdenticalTextSegments = (
        tokens: readonly StyledTextSegment[],
        compare: (A: StyledTextSegment, B: StyledTextSegment) => boolean,
    ) => {
        const runs: StyledTextSegment[][] = [];

        let current: StyledTextSegment[] = [];

        for (const token of tokens) {
            if (StringUtils.isLineBreak(token.text)) {
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

    export const getSegmentsByLine = (segments: StyledTextSegment[][], width: number) => {
        const lines: StyledTextSegment[][] = [[]];

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

            if (StringUtils.isLineBreak(joinedText)) {
                startNewLine();
                continue;
            }

            const transformedText =
                typeof metrics["text-transform"] === "string"
                    ? StringUtils.applyTextTransform(joinedText, metrics["text-transform"])
                    : joinedText;

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
                    count += StringUtils.omitControlChars(token).length;
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
