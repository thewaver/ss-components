import { Accessor, createContext, createSignal, onCleanup, onMount, useContext } from "solid-js";

import { Size2d } from "@thewaver/ss-utils";

export type ViewportContextType = {
    rootRef: HTMLDivElement | undefined;
    getSize: Accessor<Size2d>;
    getScale: Accessor<number>;
    getScaledRect: Accessor<DOMRect>;
};

const ViewportContext = createContext<ViewportContextType>();

export const ViewportContextProvider = ViewportContext.Provider;

const getWindowRect = () =>
    DOMRect.fromRect({
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
    });

export const useViewportContext = () => {
    const context = useContext(ViewportContext);
    const [getViewportFallbackRect, setViewportFallbackRect] = createSignal<DOMRect>(getWindowRect());

    const handleWindowResize = () => {
        setViewportFallbackRect(getWindowRect());
    };

    onMount(() => {
        onCleanup(() => {
            window.removeEventListener("resize", handleWindowResize);
        });

        window.addEventListener("resize", handleWindowResize);
    });

    return {
        rootRef: context?.rootRef,
        getSize:
            context?.getSize ??
            (() => ({
                width: getViewportFallbackRect().width,
                height: getViewportFallbackRect().height,
            })),
        getScale: context?.getScale ?? (() => 1),
        getScaledRect: context?.getScaledRect ?? getViewportFallbackRect,
    };
};
