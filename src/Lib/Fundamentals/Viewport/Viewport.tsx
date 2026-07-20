import type { ParentProps } from "solid-js";
import { createSignal, onCleanup, onMount } from "solid-js";

import { Rect, RectUtils, Size2d } from "@thewaver/ss-utils";

import { ViewportContextProvider } from "./Viewport.context";
import type { ViewportProps } from "./Viewport.types";

import * as styles from "./Viewport.css";

const getFit = (viewportSize: Size2d) =>
    RectUtils.fit(viewportSize, { width: window.innerWidth, height: window.innerHeight });

export const Viewport = (props: ParentProps<ViewportProps>) => {
    const startingRect = getFit(props.getSize());

    const [getPortalRef, setPortalRef] = createSignal<HTMLElement>();
    const [getScale, setScale] = createSignal<number>(startingRect.scale);
    const [getScaledRect, setScaledRect] = createSignal<DOMRect>(
        new DOMRect(startingRect.x, startingRect.y, startingRect.width, startingRect.height),
        {
            equals: Rect.isSame,
        },
    );

    const updateSize = () => {
        const rect = getFit(props.getSize());

        setScale(rect.scale);
        setScaledRect(new DOMRect(rect.x, rect.y, rect.width, rect.height));
    };

    onMount(() => {
        onCleanup(() => {
            window.removeEventListener("resize", updateSize);
        });

        window.addEventListener("resize", updateSize);
    });

    return (
        <div
            class={styles.viewportRoot}
            style={{
                width: `${props.getSize().width}px`,
                height: `${props.getSize().height}px`,
                transform: `translate(${getScaledRect()?.left ?? 0}px, ${getScaledRect()?.top ?? 0}px) scale(${getScale() ?? 1}, ${getScale() ?? 1})`,
            }}
        >
            <ViewportContextProvider value={{ getPortalRef, getSize: props.getSize, getScale, getScaledRect }}>
                <div class={styles.viewportContent}>
                    <div ref={setPortalRef} class={styles.viewportPortal} />
                    {props.children}
                </div>
            </ViewportContextProvider>
        </div>
    );
};
