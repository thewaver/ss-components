import { createContext, createRoot, createSignal, onCleanup, onMount, useContext } from "solid-js";

import type { ViewportContextType } from "./Viewport.context.types";

const ViewportContext = createContext<ViewportContextType>();

export const ViewportContextProvider = ViewportContext.Provider;

export const useParentViewportContext = () => useContext(ViewportContext);

const getWindowRect = () =>
    DOMRect.fromRect({
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
    });

const useViewportWithFallback = (): ViewportContextType => {
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
        getPortalRef: () => undefined,
        getSize: () => ({
            width: getViewportFallbackRect().width,
            height: getViewportFallbackRect().height,
        }),
        getScale: () => 1,
        getScaledRect: getViewportFallbackRect,
    };
};

let fallbackContext: ViewportContextType | undefined;

const getFallbackContext = () => (fallbackContext ??= createRoot(() => useViewportWithFallback()));

export const useViewportContext = (): ViewportContextType => {
    const context = useContext(ViewportContext);

    return context ?? getFallbackContext();
};
