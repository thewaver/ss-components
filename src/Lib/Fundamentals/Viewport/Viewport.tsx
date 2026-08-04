import type { ParentProps } from "solid-js";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";

import { FunctionUtils, RectUtils, Size2d } from "@thewaver/ss-utils";

import { ViewportContextProvider } from "./Viewport.context";
import type { ViewportProps } from "./Viewport.types";

import * as styles from "./Viewport.css";

const getFit = (viewportSize: Size2d, windowSize: Size2d) => RectUtils.fit(viewportSize, windowSize);

const getWindowInnerSize = () => ({ width: window.innerWidth, height: window.innerHeight });

export const Viewport = (props: ParentProps<ViewportProps>) => {
    const [getPortalRef, setPortalRef] = createSignal<HTMLElement>();
    const [getWindowSize, setWindowSize] = createSignal<Size2d>(getWindowInnerSize());

    let isDisposed = false;

    const throttleResize = FunctionUtils.trailingThrottle(() => {
        if (isDisposed) return;

        setWindowSize(getWindowInnerSize());
    }, 10);

    const getSizeData = createMemo(() => {
        const rect = getFit(props.getSize(), getWindowSize());

        return {
            scale: rect.scale,
            scaleRect: new DOMRect(rect.x, rect.y, rect.width, rect.height),
        };
    });

    onMount(() => {
        onCleanup(() => {
            isDisposed = true;
            window.removeEventListener("resize", throttleResize);
        });

        window.addEventListener("resize", throttleResize);
    });

    return (
        <div
            class={styles.viewportRoot}
            style={{
                width: `${props.getSize().width}px`,
                height: `${props.getSize().height}px`,
                transform: `translate(${getSizeData().scaleRect.left}px, ${getSizeData().scaleRect.top}px) scale(${getSizeData().scale}, ${getSizeData().scale})`,
            }}
        >
            <ViewportContextProvider
                value={{
                    getPortalRef,
                    getSize: props.getSize,
                    getScale: () => getSizeData().scale,
                    getScaledRect: () => getSizeData().scaleRect,
                }}
            >
                <div class={styles.viewportContent}>
                    <div ref={setPortalRef} class={styles.viewportPortal} />
                    {props.children}
                </div>
            </ViewportContextProvider>
        </div>
    );
};
