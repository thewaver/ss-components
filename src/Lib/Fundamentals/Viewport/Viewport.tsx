import { ParentProps, Show, createSignal, onCleanup, onMount } from "solid-js";

import { Rect, Size2d } from "@thewaver/ss-utils";

import { ViewportContextProvider } from "./Viewpoer.context";
import { ViewportProps } from "./Viewport.types";

import * as styles from "./Viewport.css";

const getFit = (viewportSize: Size2d) =>
    Rect.fit(viewportSize, { width: window.innerWidth, height: window.innerHeight });

export const Viewport = (props: ParentProps<ViewportProps>) => {
    let rootRef: HTMLDivElement | undefined;

    const startingRect = getFit(props.getSize());

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
            ref={(el) => {
                rootRef = el;
            }}
            class={styles.viewportRoot}
            style={{
                width: `${props.getSize().width}px`,
                height: `${props.getSize().height}px`,
                transform: `translate(${getScaledRect()?.left ?? 0}px, ${getScaledRect()?.top ?? 0}px) scale(${getScale() ?? 1}, ${getScale() ?? 1})`,
            }}
        >
            <Show when={!!rootRef}>
                <ViewportContextProvider value={{ rootRef: rootRef!, getSize: props.getSize, getScale, getScaledRect }}>
                    {props.children}
                </ViewportContextProvider>
            </Show>
        </div>
    );
};
