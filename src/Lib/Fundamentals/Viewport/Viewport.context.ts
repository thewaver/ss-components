import { createContext, createSignal, onCleanup, onMount, useContext } from "solid-js";

import type { ViewportContextType } from "./Viewport.context.types";

const ViewportContext = createContext<ViewportContextType>();

export const ViewportContextProvider = ViewportContext.Provider;

const getWindowRect = () =>
    DOMRect.fromRect({
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
    });

// do not export hook for now
const useViewportWithFallback = (props?: ViewportContextType) => {
    const [getViewportFallbackRect, setViewportFallbackRect] = createSignal<DOMRect>(getWindowRect());

    const handleWindowResize = () => {
        setViewportFallbackRect(getWindowRect());
    };

    onMount(() => {
        onCleanup(() => {
            window.removeEventListener("resize", handleWindowResize);
        });

        if (!props?.getScaledRect) {
            window.addEventListener("resize", handleWindowResize);
        }
    });

    return {
        getPortalRef: props?.getPortalRef ?? (() => undefined),
        getSize:
            props?.getSize ??
            (() => ({
                width: getViewportFallbackRect().width,
                height: getViewportFallbackRect().height,
            })),
        getScale: props?.getScale ?? (() => 1),
        getScaledRect: props?.getScaledRect ?? getViewportFallbackRect,
    };
};

export const useViewportContext = () => {
    const context = useContext(ViewportContext);

    return useViewportWithFallback(context);
};
