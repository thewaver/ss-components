import { ParentProps, createMemo, onCleanup, onMount } from "solid-js";

import { layoutNextLine, prepareWithSegments } from "@chenglou/pretext";

import { JSXStyleParser, StyledTextSegmentWithMetrics } from "../../../Lib/Abstracts/JSX/StyleParser/JSXStyleParser";
import { TypewriterProps } from "./Typewriter.types";

import * as styles from "./Typewriter.css";

const DEFAULT_TYPEWRITER_TRANSITION_DURATION_MS = 100;

export const Typewriter2 = (props: ParentProps<TypewriterProps>) => {
    let childrenContainerRef: HTMLDivElement | undefined;

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_TYPEWRITER_TRANSITION_DURATION_MS,
    );

    const reset = () => {};

    const updateSize = () => {
        if (!childrenContainerRef) return [];

        const width = childrenContainerRef.clientWidth;
        const tokens = JSXStyleParser.getTextSegmentTokens(childrenContainerRef);
        const runs = JSXStyleParser.getTextSegmentMetricStyleRuns(tokens);
        const positioned: (StyledTextSegmentWithMetrics & { line: number })[] = [];

        let line = 0;
        let remainingWidth = width;

        for (const run of runs) {
            let queue = [...run];

            while (queue.length) {
                const text = queue.map((t) => t.text).join("");
                const m = queue[0].metrics;
                const font = [m["font-style"], `${m["font-weight"]}`, `${m["font-size"]}`, m["font-family"]]
                    .filter(Boolean)
                    .join(" ");

                const prepared = prepareWithSegments(text, font, { whiteSpace: "pre-wrap" });
                const lineInfo = layoutNextLine(prepared, { segmentIndex: 0, graphemeIndex: 0 }, remainingWidth);

                if (!lineInfo) break;

                const consumedText = lineInfo.text;

                let consumedLength = consumedText.length;
                let consumedTokens = 0;
                let count = 0;

                for (const token of queue) {
                    count += token.text.length;
                    consumedTokens++;

                    if (count >= consumedLength) break;
                }

                for (let i = 0; i < consumedTokens; i++) {
                    const token = queue[i];
                    positioned.push({ ...token, line });
                }

                queue = queue.slice(consumedTokens);

                const nextRemainingWidth = remainingWidth - lineInfo.width;

                if (queue.length > 0 || nextRemainingWidth <= 0) {
                    line++;
                    remainingWidth = width;
                } else {
                    remainingWidth = nextRemainingWidth;
                }
            }
        }

        console.log(positioned);

        return positioned;
    };

    onMount(() => {
        let childrenContainerObserver: ResizeObserver | undefined;

        onCleanup(() => {
            childrenContainerObserver?.disconnect();
        });

        if (!childrenContainerRef) return;

        childrenContainerObserver = new ResizeObserver(updateSize);
        childrenContainerObserver.observe(childrenContainerRef);
    });

    return (
        <div
            ref={(el) => {
                childrenContainerRef = el;
            }}
            class={styles.typewriterRoot}
        >
            {props.children}
        </div>
    );
};
