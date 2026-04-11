import { For, ParentProps, Show, createMemo, createSignal, onCleanup, onMount } from "solid-js";

import { JSXStyleParser, StyledTextSegment } from "../../Abstracts/JSX/Style/Parser/JSXStyleParser.utils";
import { TypewriterProps } from "./Typewriter.types";

import * as styles from "./Typewriter.css";

const DEFAULT_TYPEWRITER_ANIMATION_NAME = styles.typewriterFade;
const DEFAULT_TYPEWRITER_ANIMATION_DURATION_MS = 200;
const DEFAULT_TYPEWRITER_ANIMATION_DELAY_MS = 10;

export const Typewriter = (props: ParentProps<TypewriterProps>) => {
    const [getLines, setLines] = createSignal<StyledTextSegment[][]>([[]]);
    const [getIsAnimating, setIsAnimating] = createSignal(false);

    let childrenContainerRef: HTMLDivElement | undefined;
    let animationToggleTimeout: ReturnType<typeof setTimeout> | undefined;

    const getAnimationName = createMemo(() => props.getAnimationName?.() ?? DEFAULT_TYPEWRITER_ANIMATION_NAME);

    const getAnimationDurationMs = createMemo(
        () => props.getAnimationDurationMs?.() ?? DEFAULT_TYPEWRITER_ANIMATION_DURATION_MS,
    );

    const getAnimationDelayMs = createMemo(
        () => props.getAnimationDelayMs?.() ?? DEFAULT_TYPEWRITER_ANIMATION_DELAY_MS,
    );

    const updateLayout = () => {
        if (!childrenContainerRef) return [];

        const width = childrenContainerRef.clientWidth;
        const segments = JSXStyleParser.getTextSegmentTokens(childrenContainerRef);
        const groupedSegmentsByMetrics = JSXStyleParser.groupIdenticalTextSegments(
            segments,
            JSXStyleParser.isSameMetricsStyle,
        );
        const lines = JSXStyleParser.getSegmentsByLine(groupedSegmentsByMetrics, width);
        const totalChars = lines.reduce(
            (outterRes, outterCur) =>
                outterRes + outterCur.reduce((innerRes, innerCur) => innerRes + innerCur.text.length, 0),
            0,
        );
        const mergedLinesByStyle = lines
            .filter((line) => line.length > 0)
            .map((line) =>
                JSXStyleParser.groupIdenticalTextSegments(line, JSXStyleParser.isSameNonMetricsStyle).map(
                    (group): StyledTextSegment => ({
                        ...group[0],
                        text: group.reduce((res, cur) => (res += cur.text), ""),
                    }),
                ),
            );

        setLines(mergedLinesByStyle);
        setIsAnimating(true);
        clearTimeout(animationToggleTimeout);

        animationToggleTimeout = setTimeout(
            () => {
                setIsAnimating(false);

                props.onAnimationEnd?.();
            },
            totalChars * getAnimationDelayMs() + getAnimationDurationMs(),
        );
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
        <div class={styles.typewriterRoot}>
            <div
                ref={(el) => {
                    childrenContainerRef = el;
                }}
                class={styles.typewriterChildrenWrap}
                aria-hidden="true"
                inert
            >
                {props.children}
            </div>

            <Show when={getLines().some((line) => line.length)}>
                {(() => {
                    let index = 0;

                    return (
                        <div
                            class={styles.typewriterTextWrap}
                            style={{ width: `${childrenContainerRef?.clientWidth ?? 0}px` }}
                        >
                            <For each={getLines()}>
                                {(line) => (
                                    <div>
                                        <For each={line}>
                                            {(segment) => {
                                                const style = { ...segment.nonMetrics, ...segment.metrics };

                                                return (
                                                    <>
                                                        <Show when={!getIsAnimating()}>
                                                            <Show when={Object.keys(segment.meta).length <= 1}>
                                                                <span {...segment.meta?.common} style={style}>
                                                                    {segment.text}
                                                                </span>
                                                            </Show>
                                                            <Show when={segment.meta?.anchor}>
                                                                <a
                                                                    {...segment.meta?.common}
                                                                    {...segment.meta?.anchor}
                                                                    style={style}
                                                                >
                                                                    {segment.text}
                                                                </a>
                                                            </Show>
                                                        </Show>
                                                        <Show when={getIsAnimating()}>
                                                            <span style={style}>
                                                                <For each={segment.text.split("")}>
                                                                    {(char) => {
                                                                        index++;

                                                                        return (
                                                                            <span
                                                                                class={styles.typewriterChar}
                                                                                style={{
                                                                                    "animation-name":
                                                                                        getAnimationName(),
                                                                                    "animation-duration": `${getAnimationDurationMs()}ms`,
                                                                                    "animation-delay": `${index * getAnimationDelayMs()}ms`,
                                                                                }}
                                                                            >
                                                                                {char}
                                                                            </span>
                                                                        );
                                                                    }}
                                                                </For>
                                                            </span>
                                                        </Show>
                                                    </>
                                                );
                                            }}
                                        </For>
                                    </div>
                                )}
                            </For>
                        </div>
                    );
                })()}
            </Show>
        </div>
    );
};
