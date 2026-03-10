import { Accessor, createContext, createSignal, onCleanup, onMount, useContext } from "solid-js";

import { Size2d } from "@thewaver/ss-utils";

export type ViewportContextType = {
    getSize: Accessor<Size2d | undefined>;
    getScale: Accessor<number | undefined>;
    getScaledRect: Accessor<DOMRect | undefined>;
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
        getSize: (context?.getSize ??
            (() => ({
                width: getViewportFallbackRect().width,
                height: getViewportFallbackRect().height,
            }))) as Accessor<Size2d>,
        getScale: (context?.getScale ?? (() => 1)) as Accessor<number>,
        getScaledRect: (context?.getScaledRect ?? getViewportFallbackRect) as Accessor<DOMRect>,
    };
};
