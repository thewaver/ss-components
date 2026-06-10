import { For, Show, createEffect, createMemo, createSignal, on, onCleanup, onMount } from "solid-js";
import type { ParentProps } from "solid-js";

import { EMPTY_ARRAY } from "@thewaver/ss-utils";

import type { ElementSegment } from "../../Abstracts/JSX/Text/Parser/JSXTextParser.utils";
import { JSXTextParser } from "../../Abstracts/JSX/Text/Parser/JSXTextParser.utils";
import type { TypewriterProps, TypewriterUpdateCause } from "./Typewriter.types";

import * as styles from "./Typewriter.css";

const DEFAULT_TYPEWRITER_ANIMATION_NAME = styles.typewriterFade;
const DEFAULT_TYPEWRITER_ANIMATION_DURATION_MS = 500;
const DEFAULT_TYPEWRITER_ANIMATION_DELAY_MS = 10;

export const Typewriter = (props: ParentProps<TypewriterProps>) => {
    const [getContainerRef, setContainerRef] = createSignal<HTMLElement>();
    const [getIndexedSegments, setIndexedSegments] = createSignal<(ElementSegment & { startIndex: number })[]>(
        EMPTY_ARRAY as any,
    );
    const [getAnimatedElementCount, setAnimatedElementCount] = createSignal(0);
    const [getIsAnimating, setIsAnimating] = createSignal(false);
    const [getHasAnimatedOnce, setHasAnimatedOnce] = createSignal(false);

    let animationToggleTimeout: ReturnType<typeof setTimeout> | undefined;

    onCleanup(() => {
        clearTimeout(animationToggleTimeout);
    });

    const getAnimationName = createMemo(() => props.getAnimationName?.() ?? DEFAULT_TYPEWRITER_ANIMATION_NAME);

    const getAnimationDurationMs = createMemo(
        () => props.getAnimationDurationMs?.() ?? DEFAULT_TYPEWRITER_ANIMATION_DURATION_MS,
    );

    const getAnimationDelayMs = createMemo(
        () => props.getAnimationDelayMs?.() ?? DEFAULT_TYPEWRITER_ANIMATION_DELAY_MS,
    );

    const clearAnimation = () => {
        setIsAnimating(false);
        clearTimeout(animationToggleTimeout);
    };

    const restartAnimation = (cause: TypewriterUpdateCause = "other") => {
        clearAnimation();

        const timeoutDuration =
            getAnimatedElementCount() * getAnimationDelayMs() +
            (props.getInitialAnimationDelayMs?.() ?? 0) +
            getAnimationDurationMs();

        if (
            getHasAnimatedOnce() &&
            ((cause === "content" && props.getResetAnimationOnContent?.() === false) ||
                (cause === "layout" && props.getResetAnimationOnLayout?.() === false))
        )
            return;

        setIsAnimating(true);
        setHasAnimatedOnce(true);

        animationToggleTimeout = setTimeout(() => {
            setIsAnimating(false);

            props.onAnimationEnd?.();
        }, timeoutDuration);
    };

    const update = (cause: TypewriterUpdateCause) => {
        const containerRef = getContainerRef();

        if (!containerRef) return;

        clearAnimation();
        setIndexedSegments(EMPTY_ARRAY as any);
        setAnimatedElementCount(0);

        let itemCount = 0;

        const width = containerRef.clientWidth;
        const segments = JSXTextParser.getSegmentTokens(containerRef);
        const inlinedSegments = JSXTextParser.getInlinedSegments(segments, width);
        const indexedSegments = inlinedSegments.map((segment) => {
            const result = { ...segment, startIndex: itemCount };

            itemCount += segment.type === "text" ? segment.text.length : 1;

            return result;
        });

        setIndexedSegments(indexedSegments);
        setAnimatedElementCount(itemCount);
        restartAnimation(cause);
    };

    const controller = createMemo(() => ({
        restartAnimation: () => {
            if (!getIsAnimating()) {
                restartAnimation();

                return true;
            }

            return false;
        },
        update,
    }));

    createEffect(on(getAnimationName, restartAnimation as any)); // avoid function re-wrapping just to satisfy param types

    onMount(() => {
        props.getController?.(controller());

        let childrenContainerObserver: ResizeObserver | undefined;

        onCleanup(() => {
            childrenContainerObserver?.disconnect();
        });

        const containerRef = getContainerRef();

        if (!containerRef) return;

        childrenContainerObserver = new ResizeObserver(() => update("layout"));
        childrenContainerObserver.observe(containerRef);
    });

    return (
        <div class={styles.typewriterRoot}>
            <div ref={setContainerRef} class={styles.typewriterChildrenWrap} aria-hidden="true" inert>
                {props.children}
            </div>

            <Show when={getIndexedSegments().length}>
                <div class={styles.typewriterTextWrap} style={{ width: `${getContainerRef()?.clientWidth ?? 0}px` }}>
                    <For each={getIndexedSegments()}>
                        {(segment) => {
                            const getAnimationStyle = (startIndex: number) =>
                                getIsAnimating()
                                    ? {
                                          "animation-name": getAnimationName(),
                                          "animation-duration": `${getAnimationDurationMs()}ms`,
                                          "animation-delay": `${startIndex * getAnimationDelayMs() + (props.getInitialAnimationDelayMs?.() ?? 0)}ms`,
                                      }
                                    : undefined;

                            switch (segment.type) {
                                case "atomic": {
                                    return (
                                        <span
                                            class={
                                                segment.isBlockLike
                                                    ? styles.typewriterBlockLikeAtomic
                                                    : styles.typewriterChar
                                            }
                                            style={getAnimationStyle(segment.startIndex)}
                                        >
                                            {segment.element}
                                        </span>
                                    );
                                }
                                case "linebreak":
                                    return <br style={getAnimationStyle(segment.startIndex)} />;
                                case "text": {
                                    const style = { ...segment.nonMetrics, ...segment.metrics };

                                    return (
                                        <>
                                            {getIsAnimating() ? (
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
                                            ) : segment.meta?.anchor ? (
                                                <a
                                                    class={styles.typewriterChar}
                                                    style={style}
                                                    {...segment.meta?.common}
                                                    {...segment.meta?.anchor}
                                                >
                                                    {segment.text}
                                                </a>
                                            ) : (
                                                <span
                                                    class={styles.typewriterChar}
                                                    style={style}
                                                    {...segment.meta?.common}
                                                >
                                                    {segment.text}
                                                </span>
                                            )}
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
