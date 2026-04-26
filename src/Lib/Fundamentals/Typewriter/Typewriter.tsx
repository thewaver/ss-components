import { For, ParentProps, Show, createMemo, createSignal, onCleanup, onMount } from "solid-js";

import { EMPTY_ARRAY } from "@thewaver/ss-utils";

import { ElementSegment, JSXTextParser } from "../../Abstracts/JSX/Text/Parser/JSXTextParser.utils";
import { TypewriterProps } from "./Typewriter.types";

import * as styles from "./Typewriter.css";

const DEFAULT_TYPEWRITER_ANIMATION_NAME = styles.typewriterFade;
const DEFAULT_TYPEWRITER_ANIMATION_DURATION_MS = 200;
const DEFAULT_TYPEWRITER_ANIMATION_DELAY_MS = 10;

export const Typewriter = (props: ParentProps<TypewriterProps>) => {
    const [getIndexedSegments, setIndexedSegments] = createSignal<(ElementSegment & { startIndex: number })[]>(
        EMPTY_ARRAY as any,
    );
    const [getIsAnimating, setIsAnimating] = createSignal(false);
    const [getHasAnimatedOnce, setHasAnimatedOnce] = createSignal(false);

    let childrenContainerRef: HTMLDivElement | undefined;
    let animationToggleTimeout: ReturnType<typeof setTimeout> | undefined;

    const getAnimationName = createMemo(() => props.getAnimationName?.() ?? DEFAULT_TYPEWRITER_ANIMATION_NAME);

    const getAnimationDurationMs = createMemo(
        () => props.getAnimationDurationMs?.() ?? DEFAULT_TYPEWRITER_ANIMATION_DURATION_MS,
    );

    const getAnimationDelayMs = createMemo(
        () => props.getAnimationDelayMs?.() ?? DEFAULT_TYPEWRITER_ANIMATION_DELAY_MS,
    );

    const getAnimationStyle = (startIndex: number) => ({
        "animation-name": getAnimationName(),
        "animation-duration": `${getAnimationDurationMs()}ms`,
        "animation-delay": `${startIndex * getAnimationDelayMs() + (props.getInitialAnimationDelayMs?.() ?? 0)}ms`,
    });

    const updateLayout = () => {
        if (!childrenContainerRef) return;

        setIndexedSegments(EMPTY_ARRAY as any);
        setIsAnimating(false);
        clearTimeout(animationToggleTimeout);

        let startIndex = 0;

        const width = childrenContainerRef.clientWidth;
        const segments = JSXTextParser.getSegmentTokens(childrenContainerRef);
        const inlinedSegments = JSXTextParser.getInlinedSegments(segments, width);
        const indexedSegments = inlinedSegments.map((segment) => {
            const result = { ...segment, startIndex };

            startIndex += segment.type === "text" ? segment.text.length : 1;

            return result;
        });

        setIndexedSegments(indexedSegments);

        if (!getHasAnimatedOnce() || props.getResetAnimationOnResize?.()) {
            setIsAnimating(true);
            setHasAnimatedOnce(true);
            animationToggleTimeout = setTimeout(
                () => {
                    setIsAnimating(false);

                    props.onAnimationEnd?.();
                },
                startIndex * getAnimationDelayMs() +
                    (props.getInitialAnimationDelayMs?.() ?? 0) +
                    getAnimationDurationMs(),
            );
        }
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

            <Show when={getIndexedSegments().length}>
                <div class={styles.typewriterTextWrap} style={{ width: `${childrenContainerRef?.clientWidth ?? 0}px` }}>
                    <For each={getIndexedSegments()}>
                        {(segment) => {
                            switch (segment.type) {
                                case "atomic": {
                                    const className = segment.isBlockLike
                                        ? styles.typewriterBlockLikeAtomic
                                        : styles.typewriterChar;

                                    return (
                                        <>
                                            <Show when={!getIsAnimating()}>
                                                <span class={className}>{segment.element}</span>
                                            </Show>
                                            <Show when={getIsAnimating()}>
                                                <span class={className} style={getAnimationStyle(segment.startIndex)}>
                                                    {segment.element}
                                                </span>
                                            </Show>
                                        </>
                                    );
                                }
                                case "linebreak":
                                    return (
                                        <>
                                            <Show when={!getIsAnimating()}>
                                                <br />
                                            </Show>
                                            <Show when={getIsAnimating()}>
                                                <br style={getAnimationStyle(segment.startIndex)} />
                                            </Show>
                                        </>
                                    );
                                case "text": {
                                    const style = { ...segment.nonMetrics, ...segment.metrics };

                                    return (
                                        <>
                                            <Show when={!getIsAnimating()}>
                                                <Show when={Object.keys(segment.meta).length <= 1}>
                                                    <span
                                                        class={styles.typewriterChar}
                                                        style={style}
                                                        {...segment.meta?.common}
                                                    >
                                                        {segment.text}
                                                    </span>
                                                </Show>
                                                <Show when={segment.meta?.anchor}>
                                                    <a
                                                        class={styles.typewriterChar}
                                                        style={style}
                                                        {...segment.meta?.common}
                                                        {...segment.meta?.anchor}
                                                    >
                                                        {segment.text}
                                                    </a>
                                                </Show>
                                            </Show>
                                            <Show when={getIsAnimating()}>
                                                <span style={style}>
                                                    <For each={segment.text.split("")}>
                                                        {(char, getCharIndex) => (
                                                            <span
                                                                class={styles.typewriterChar}
                                                                style={getAnimationStyle(
                                                                    segment.startIndex + getCharIndex(),
                                                                )}
                                                            >
                                                                {char}
                                                            </span>
                                                        )}
                                                    </For>
                                                </span>
                                            </Show>
                                        </>
                                    );
                                }
                            }
                        }}
                    </For>
                </div>
            </Show>
        </div>
    );
};
