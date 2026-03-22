import { Color, getColor, getPalette } from "colorthief";
import { Accessor, createContext, createEffect, createSignal, onCleanup, useContext } from "solid-js";

export type ColorExtractorContextType = {
    getSrc: Accessor<string>;
    getColorCount?: Accessor<number>;
    getSamplePercentile?: Accessor<number>;
};

const ColorExtractorContext = createContext<ColorExtractorContextType>();

export const ColorExtractorContextProvider = ColorExtractorContext.Provider;

export const useColorExtractor = (props?: ColorExtractorContextType) => {
    const [getColorData, setColorData] = createSignal<Color[]>([]);
    createEffect(() => {
        let isMounted = true;

        const src = props?.getSrc();
        const colorCount = props?.getColorCount?.() ?? 1;
        const quality = props?.getSamplePercentile?.() ?? 10;

        if (!src) return;

        const img = new Image();

        onCleanup(() => {
            img.onload = null;
            isMounted = false;
        });

        img.crossOrigin = "anonymous";
        img.src = src;
        img.onload = (e) => {
            if (!isMounted || !e.currentTarget) return;

            if (colorCount === 1) {
                getColor(e.currentTarget as HTMLImageElement, { quality }).then((res) => {
                    if (isMounted && res) {
                        setColorData([res]);
                    }
                });
            } else {
                getPalette(e.currentTarget as HTMLImageElement, { quality, colorCount }).then((res) => {
                    if (isMounted && res) {
                        setColorData(res);
                    }
                });
            }
        };
    });

    return { getColorData };
};

export const useColorExtractorContext = () => {
    const context = useContext(ColorExtractorContext);

    return useColorExtractor(context);
};
