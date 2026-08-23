import type { ParentProps } from "solid-js";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";

import { FunctionUtils, RectUtils, Size2d } from "@thewaver/ss-utils";

import { access } from "../../Utils/propUtils";
import { ViewportContextProvider, useParentViewportContext } from "./Viewport.context";
import type { ViewportProps } from "./Viewport.types";
import { ViewportUtils } from "./Viewport.utils";

import * as styles from "./Viewport.css";

const getFit = (viewportSize: Size2d, availableSize: Size2d) => RectUtils.fit(viewportSize, availableSize);

const getWindowInnerSize = () => ({ width: window.innerWidth, height: window.innerHeight });

export const Viewport = (props: ParentProps<ViewportProps>) => {
    const parentContext = useParentViewportContext();

    const [getPortalRef, setPortalRef] = createSignal<HTMLElement>();
    const [getHostRef, setHostRef] = createSignal<HTMLElement>();
    const [getHostSize, setHostSize] = createSignal<Size2d>({ width: 0, height: 0 }, { equals: Size2d.isSame });
    const [getWindowSize, setWindowSize] = createSignal<Size2d>(getWindowInnerSize());

    let isDisposed = false;

    const throttleResize = FunctionUtils.trailingThrottle(() => {
        if (isDisposed) return;

        setWindowSize(getWindowInnerSize());
    }, 10);

    const getAvailableSize = createMemo(() => (parentContext ? getHostSize() : getWindowSize()));

    const getSizeData = createMemo(() => {
        const rect = getFit(access(props.size), getAvailableSize());

        return {
            scale: rect.scale,
            scaleRect: new DOMRect(rect.x, rect.y, rect.width, rect.height),
        };
    });

    const getScale = createMemo(() => (parentContext?.getScale() ?? 1) * getSizeData().scale);

    const getScaledRect = () => {
        const rect = getSizeData().scaleRect;
        const host = getHostRef();

        if (!parentContext || !host) return rect;

        const composed = ViewportUtils.composeScaledRect(rect, host.getBoundingClientRect(), parentContext.getScale());

        return new DOMRect(composed.x, composed.y, composed.width, composed.height);
    };

    onMount(() => {
        onCleanup(() => {
            isDisposed = true;
            window.removeEventListener("resize", throttleResize);
        });

        if (!parentContext) {
            window.addEventListener("resize", throttleResize);

            return;
        }

        const host = getHostRef();

        if (!host) return;

        const observer = new ResizeObserver(() => {
            setHostSize({ width: host.clientWidth, height: host.clientHeight });
        });

        observer.observe(host);

        onCleanup(() => {
            observer.disconnect();
        });
    });

    return (
        <div ref={setHostRef} class={parentContext ? styles.viewportNestedHost : styles.viewportRootHost}>
            <div
                class={styles.viewportRoot}
                style={{
                    width: `${access(props.size).width}px`,
                    height: `${access(props.size).height}px`,
                    transform: `translate(${getSizeData().scaleRect.left}px, ${getSizeData().scaleRect.top}px) scale(${getSizeData().scale}, ${getSizeData().scale})`,
                }}
            >
                <ViewportContextProvider
                    value={{
                        getPortalRef,
                        getSize: () => access(props.size),
                        getScale,
                        getScaledRect,
                    }}
                >
                    <div class={styles.viewportContent}>
                        <div ref={setPortalRef} class={styles.viewportPortal} />
                        {props.children}
                    </div>
                </ViewportContextProvider>
            </div>
        </div>
    );
};
