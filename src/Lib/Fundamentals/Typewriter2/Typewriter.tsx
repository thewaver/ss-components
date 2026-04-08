import { For, ParentProps, Show, createMemo, createSignal, onCleanup, onMount } from "solid-js";

import { layoutNextLine, prepareWithSegments } from "@chenglou/pretext";

import {
    JSXStyleParser,
    StyledTextSegmentWithMetrics,
    applyTextTransform,
} from "../../../Lib/Abstracts/JSX/StyleParser/JSXStyleParser";
import { TypewriterProps } from "./Typewriter.types";

import * as styles from "./Typewriter.css";

const DEFAULT_TYPEWRITER_TRANSITION_DURATION_MS = 100;

export const Typewriter2 = (props: ParentProps<TypewriterProps>) => {
    const [getLines, setLines] = createSignal<StyledTextSegmentWithMetrics[][]>([[]]);

    let childrenContainerRef: HTMLDivElement | undefined;

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_TYPEWRITER_TRANSITION_DURATION_MS,
    );

    const updateLayout = () => {
        if (!childrenContainerRef) return [];

        const width = childrenContainerRef.clientWidth;
        const segments = JSXStyleParser.getTextSegmentTokens(childrenContainerRef);
        const mergedSegmentsByMetrics = JSXStyleParser.mergeIdenticalTextSegments(
            segments,
            JSXStyleParser.isSameMetricsStyle,
        );
        const lines: StyledTextSegmentWithMetrics[][] = [[]];

        let lineIndex = 0;
        let remainingWidth = width;

        for (const segment of mergedSegmentsByMetrics) {
            const metrics = segment[0].metrics;
            const text = applyTextTransform(segment.map((t) => t.text).join(""), metrics["text-transform"]);
            const font = [
                metrics["font-style"],
                `${metrics["font-weight"]}`,
                `${metrics["font-size"]}`,
                metrics["font-family"],
            ]
                .filter(Boolean)
                .join(" ");

            const prepared = prepareWithSegments(text, font, {
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
                    count += segment[i]!.text.length;
                    consumedTokens++;

                    if (count >= lineInfo.text.length) break;
                }

                for (let i = 0; i < consumedTokens; i++) {
                    lines[lineIndex]!.push(segment[tokenIndex + i]!);
                }

                tokenIndex += consumedTokens;

                const nextRemainingWidth = remainingWidth - lineInfo.width;

                if (tokenIndex < segment.length || nextRemainingWidth <= 0) {
                    lineIndex++;
                    lines[lineIndex] ??= [];
                    remainingWidth = width;
                } else {
                    remainingWidth = nextRemainingWidth;
                }

                cursor = lineInfo.end;
            }
        }

        const mergedLinesByStyle = lines
            .filter((line) => line.length > 0)
            .map((line) =>
                JSXStyleParser.mergeIdenticalTextSegments(
                    line.filter((item) => item.text !== "\n"),
                    JSXStyleParser.isSameNonMetricsStyle,
                ).map(
                    (group): StyledTextSegmentWithMetrics => ({
                        text: group.reduce((res, cur) => (res += cur.text), ""),
                        metrics: group[0].metrics,
                        nonMetrics: group[0].nonMetrics,
                    }),
                ),
            );

        setLines(mergedLinesByStyle);
    };

    onMount(() => {
        let childrenContainerObserver: ResizeObserver | undefined;

        onCleanup(() => {
            childrenContainerObserver?.disconnect();
        });

        if (!childrenContainerRef) return;

        childrenContainerObserver = new ResizeObserver(updateLayout);
        childrenContainerObserver.observe(childrenContainerRef);
    });

    return (
        <>
            <div
                ref={(el) => {
                    childrenContainerRef = el;
                }}
                class={styles.typewriterRoot}
            >
                {props.children}
            </div>

            <Show when={getLines().some((line) => line.length > 0)}>
                <For each={getLines()}>
                    {(line) => (
                        <div>
                            <For each={line}>
                                {(segment) => (
                                    <span style={{ ...segment.nonMetrics, ...segment.metrics }}>{segment.text}</span>
                                )}
                            </For>
                        </div>
                    )}
                </For>
            </Show>
        </>
    );
};
