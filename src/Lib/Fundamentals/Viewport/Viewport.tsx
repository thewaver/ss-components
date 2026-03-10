import { ParentProps, createSignal, onCleanup, onMount } from "solid-js";

import { Rect } from "@thewaver/ss-utils";

import { ViewportContextProvider } from "./Viewpoer.context";
import { ViewportProps } from "./Viewport.types";

import * as styles from "./Viewport.css";

export const Viewport = (props: ParentProps<ViewportProps>) => {
    const [getScale, setScale] = createSignal<number>();
    const [getScaledRect, setScaledRect] = createSignal<DOMRect | undefined>(undefined, {
        equals: Rect.isSame,
    });

    const handleResize = () => {
        const rect = Rect.fit(
            { width: props.getSize().width, height: props.getSize().height },
            { width: window.innerWidth, height: window.innerHeight },
        );

        setScale(rect.scale);
        setScaledRect(new DOMRect(rect.x, rect.y, rect.width, rect.height));
    };

    onMount(() => {
        onCleanup(() => {
            window.removeEventListener("resize", handleResize);
        });

        setTimeout(handleResize, 0);
        window.addEventListener("resize", handleResize);
    });

    return (
        <div
            class={styles.root}
            style={{
                width: `${props.getSize().width}px`,
                height: `${props.getSize().height}px`,
                transform: `translate(${getScaledRect()?.left ?? 0}px, ${getScaledRect()?.top ?? 0}px) scale(${getScale() ?? 1}, ${getScale() ?? 1})`,
            }}
        >
            <ViewportContextProvider value={{ getSize: props.getSize, getScale, getScaledRect }}>
                {props.children}
            </ViewportContextProvider>
        </div>
    );
};
