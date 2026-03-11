import { JSX, ParentProps, createMemo, createSignal, onCleanup, onMount } from "solid-js";

import { Size2d } from "@thewaver/ss-utils";

import { TypewriterProps } from "./Typewriter.types";

import * as styles from "./Typewriter.css";

export const DEFAULT_TYPEWRITER_TRANSITION_DURATION_MS = 100;

export const Typewriter = (props: ParentProps<TypewriterProps>) => {
    const [getLineCount, setLineCount] = createSignal(0);
    const [getLineHeight, setLineHeight] = createSignal(0);
    const [getCurrentLine, setCurrentLine] = createSignal(-1);
    const [getContainerSize, setContainerSize] = createSignal<Size2d | undefined>(undefined, { equals: Size2d.isSame });

    let childrenContainerRef: HTMLDivElement | undefined;

    const getMaskStyle = createMemo(() => {
        const currentLine = getCurrentLine();
        const lineHeight = getLineHeight();
        const lineCount = getLineCount();
        const containerSize = getContainerSize();
        const transitionDurationMs = props.getTransitionDurationMs?.() ?? DEFAULT_TYPEWRITER_TRANSITION_DURATION_MS;

        if (!childrenContainerRef) return { opacity: 0 };

        const fadeW = lineHeight * 2;

        let image = "";
        let position = "";
        let size = "";

        for (let i = 0; i < lineCount; i++) {
            image = image + `, linear-gradient(to right, black calc(100% - ${fadeW}px), transparent)`;
            position = position + `, 0 ${i * lineHeight}px`;
            size = size + `, ${i < currentLine ? `calc(100% + ${fadeW}px)` : "0"} ${lineHeight}px`;
        }

        const result: JSX.CSSProperties = {
            "mask-image": image.slice(2),
            "mask-position": position.slice(2),
            "mask-size": size.slice(2),
            "transition-property": currentLine > 0 ? "mask-size" : "none",
            "transition-duration": `${transitionDurationMs * (containerSize?.width ?? 100) * 0.01}ms`,
        };

        return result;
    });

    const reset = () => {
        setCurrentLine(0);

        setTimeout(() => {
            setCurrentLine(1);
        }, 0);
    };

    const updateSize = () => {
        const lineHeight = getLineHeight();

        if (!childrenContainerRef) return;

        const containerW = childrenContainerRef.scrollWidth;
        const containerH = childrenContainerRef.scrollHeight;

        setContainerSize({ width: containerW, height: containerH });
        setLineCount(Math.round(containerH / lineHeight));
        reset();
    };

    onMount(() => {
        let childrenContainerObserver: ResizeObserver | undefined;

        onCleanup(() => {
            childrenContainerObserver?.disconnect();
        });

        if (!childrenContainerRef) return;

        childrenContainerObserver = new ResizeObserver(updateSize);
        childrenContainerObserver.observe(childrenContainerRef);

        setLineHeight(parseFloat(getComputedStyle(childrenContainerRef).lineHeight));
    });

    return (
        <div
            ref={(el) => {
                childrenContainerRef = el;
            }}
            class={styles.typewriterRoot}
            style={getMaskStyle()}
            onTransitionEnd={() => {
                setCurrentLine((prev) => prev + 1);

                if (getCurrentLine() > getLineCount()) {
                    props.onTransitionEnd?.();
                }
            }}
        >
            {props.children}
        </div>
    );
};
