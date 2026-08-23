import { For, Index, createEffect, createMemo, createSignal, on, onCleanup, onMount } from "solid-js";
import type { ParentProps } from "solid-js";

import { type ElementSegment, JSXTextParser } from "@thewaver/ss-utils";

import { access } from "../../Utils/propUtils";
import type { TypewriterProps, TypewriterUpdateCause } from "./Typewriter.types";

import * as styles from "./Typewriter.css";

const EMPTY_SEGMENTS: (ElementSegment & { startIndex: number })[] = [];
const DEFAULT_TYPEWRITER_ANIMATION_NAME = styles.typewriterFade;
const DEFAULT_TYPEWRITER_ANIMATION_DURATION_MS = 500;
const DEFAULT_TYPEWRITER_ANIMATION_DELAY_MS = 10;

export const Typewriter = (props: ParentProps<TypewriterProps>) => {
    const [getContainerRef, setContainerRef] = createSignal<HTMLElement>();
    const [getIndexedSegments, setIndexedSegments] =
        createSignal<(ElementSegment & { startIndex: number })[]>(EMPTY_SEGMENTS);
    const [getAnimatedElementCount, setAnimatedElementCount] = createSignal(0);
    const [getIsAnimating, setIsAnimating] = createSignal(false);
    const [getHasAnimatedOnce, setHasAnimatedOnce] = createSignal(false);

    let animationToggleTimeout: ReturnType<typeof setTimeout> | undefined;

    onCleanup(() => {
        clearTimeout(animationToggleTimeout);
    });

    const getAnimationName = createMemo(() => access(props.animationName) ?? DEFAULT_TYPEWRITER_ANIMATION_NAME);

    const getAnimationDurationMs = createMemo(
        () => access(props.animationDurationMs) ?? DEFAULT_TYPEWRITER_ANIMATION_DURATION_MS,
    );

    const getAnimationDelayMs = createMemo(
        () => access(props.animationDelayMs) ?? DEFAULT_TYPEWRITER_ANIMATION_DELAY_MS,
    );

    const getAnimationBase = createMemo(() =>
        getIsAnimating()
            ? {
                  name: getAnimationName(),
                  durationMs: getAnimationDurationMs(),
                  delayMs: getAnimationDelayMs(),
                  initialDelayMs: access(props.initialAnimationDelayMs) ?? 0,
              }
            : undefined,
    );

    const clearAnimation = () => {
        setIsAnimating(false);
        clearTimeout(animationToggleTimeout);
    };

    const restartAnimation = (cause: TypewriterUpdateCause = "other") => {
        clearAnimation();

        const timeoutDuration =
            getAnimatedElementCount() * getAnimationDelayMs() +
            (access(props.initialAnimationDelayMs) ?? 0) +
            getAnimationDurationMs();

        if (
            getHasAnimatedOnce() &&
            ((cause === "content" && access(props.resetAnimationOnContent) === false) ||
                (cause === "layout" && access(props.resetAnimationOnLayout) === false))
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
        setIndexedSegments(EMPTY_SEGMENTS);
        setAnimatedElementCount(0);

        let itemCount = 0;

        const width = containerRef.clientWidth;
        const segments = JSXTextParser.getSegmentTokens(containerRef);
        const inlinedSegments = JSXTextParser.getInlinedSegments(segments, width);
        const indexedSegments = inlinedSegments.map((segment) => {
            const result = { ...segment, startIndex: itemCount };

            itemCount += segment.type === "text" ? Array.from(segment.text).length : 1;

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

    createEffect(on(getAnimationName, () => restartAnimation(), { defer: true }));

    onMount(() => {
        props.onMount?.(controller());

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

            {!!getIndexedSegments().length && (
                <div class={styles.typewriterTextWrap} style={{ width: `${getContainerRef()?.clientWidth ?? 0}px` }}>
                    <For each={getIndexedSegments()}>
                        {(segment) => {
                            const getAnimationStyle = (startIndex: number) => {
                                const base = getAnimationBase();

                                if (!base) return undefined;

                                return {
                                    "animation-name": base.name,
                                    "animation-duration": `${base.durationMs}ms`,
                                    "animation-delay": `${startIndex * base.delayMs + base.initialDelayMs}ms`,
                                };
                            };

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
                                                    <Index each={Array.from(segment.text)}>
                                                        {(getChar, charIndex) => (
                                                            <span
                                                                class={styles.typewriterChar}
                                                                style={getAnimationStyle(
                                                                    segment.startIndex + charIndex,
                                                                )}
                                                            >
                                                                {getChar()}
                                                            </span>
                                                        )}
                                                    </Index>
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
            )}
        </div>
    );
};
