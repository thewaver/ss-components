import { getColor, getPalette } from "colorthief";
import type { Color } from "colorthief";
import { createContext, createEffect, createSignal, onCleanup, useContext } from "solid-js";

import type { ColorExtractorContextType } from "./ColorExtractor.context.types";

const ColorExtractorContext = createContext<ColorExtractorContextType>();

export const ColorExtractorContextProvider = ColorExtractorContext.Provider;

export const useColorExtractor = (props?: ColorExtractorContextType) => {
    const [getColorData, setColorData] = createSignal<Color[]>([]);
    const [getError, setError] = createSignal<unknown>();

    createEffect(() => {
        let isMounted = true;

        const src = props?.getSrc();
        const colorCount = props?.getColorCount?.() ?? 1;
        const quality = props?.getSamplePercentile?.() ?? 10;

        if (!src) return;

        const img = new Image();

        onCleanup(() => {
            img.onload = null;
            img.onerror = null;
            img.src = "";
            isMounted = false;
        });

        img.crossOrigin = "anonymous";
        img.src = src;
        img.onerror = () => {
            if (!isMounted) return;

            console.warn(`ColorExtractor: failed to load image: ${src}`);
            setColorData([]);
            setError(new Error(`Failed to load image: ${src}`));
        };
        img.onload = () => {
            if (!isMounted) return;

            const request =
                colorCount === 1
                    ? getColor(img, { quality }).then((res) => (res ? [res] : []))
                    : getPalette(img, { quality, colorCount });

            request
                .then((res) => {
                    if (!isMounted) return;

                    setColorData(res ?? []);
                    setError(undefined);
                })
                .catch((err) => {
                    if (!isMounted) return;

                    console.warn("ColorExtractor: colour extraction failed:", err);
                    setColorData([]);
                    setError(err);
                });
        };
    });

    return { getColorData, getError };
};

export const useColorExtractorContext = () => {
    const context = useContext(ColorExtractorContext);

    return useColorExtractor(context);
};
