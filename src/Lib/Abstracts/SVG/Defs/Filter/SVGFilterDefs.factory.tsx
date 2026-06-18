import type { JSX } from "solid-js";

import type { Size2d } from "@thewaver/ss-utils";

import type {
    SVGBrightnessFilterDefs,
    SVGColorFilterDefs,
    SVGContrastFilterDefs,
    SVGDropShadowFilterDefs,
    SVGGaussianBlurFilterDefs,
    SVGHueRotationFilterDefs,
    SVGInversionFilterDefs,
    SVGSaturationFilterDefs,
} from "./SVGFilterDefs.types";

type SVGPrimitiveDefs = {
    method?: "chain" | "isolate";
};

const SVG_PRIMITIVE_DEFS: SVGPrimitiveDefs = {
    method: "isolate",
};

export class SVGFilterDefsFactory {
    private filterPrimitives: Record<string, (srcIn: string) => { element: JSX.Element; resultGraphic: string }> = {};
    private dropShadowCount = 0;
    private gaussianBlurCount = 0;
    private hueRotationCount = 0;
    private saturationCount = 0;
    private brightnessCount = 0;
    private contrastCount = 0;
    private inversionCount = 0;
    private colorCount = 0;
    private maxOffset = 0;

    constructor(private readonly filterId: string) {}

    public getFilterPrimitives = (defs?: SVGPrimitiveDefs & { elementSize?: Size2d }) => {
        const entries = Object.entries(this.filterPrimitives);

        if (entries.length < 1) return undefined;

        const mergedDefs = { ...SVG_PRIMITIVE_DEFS, ...defs };

        let currentSourceGraphic = "SourceGraphic";

        const sizeProps: JSX.FilterSVGAttributes<SVGFilterElement> | undefined = defs?.elementSize
            ? {
                  filterUnits: "userSpaceOnUse",
                  x: `${-this.maxOffset}px`,
                  y: `${-this.maxOffset}px`,
                  width: `${defs.elementSize.width + this.maxOffset * 2}px`,
                  height: `${defs.elementSize.height + this.maxOffset * 2}px`,
              }
            : undefined;

        return (
            <filter id={this.filterId} {...sizeProps}>
                {entries.map(([, createPrimitive]) => {
                    const result = createPrimitive(currentSourceGraphic);

                    if (mergedDefs.method === "chain") {
                        currentSourceGraphic = result.resultGraphic;
                    }

                    return result.element;
                })}

                {mergedDefs.method === "isolate" && (
                    <feMerge>
                        <feMergeNode in="SourceGraphic" />
                        {entries.map(([key]) => (
                            <feMergeNode in={key} />
                        ))}
                    </feMerge>
                )}
            </filter>
        );
    };

    public addDropShadowFilter = (defs: SVGDropShadowFilterDefs, custom?: JSX.Element) => {
        if (defs.stdDeviation <= 0 && (defs.dx ?? 0) === 0 && (defs.dy ?? 0) === 0) return this;

        const key = `${this.filterId}_dropShadow_${this.dropShadowCount++}`;

        this.maxOffset = Math.max(
            this.maxOffset,
            defs.stdDeviation * 3 + Math.max(Math.abs(defs.dx), Math.abs(defs.dy)),
        );
        this.filterPrimitives[key] = () => ({
            element: (
                <feDropShadow {...defs} result={key}>
                    {custom}
                </feDropShadow>
            ),
            resultGraphic: key,
        });

        return this;
    };

    public addGaussianBlurFilter = (defs: SVGGaussianBlurFilterDefs, custom?: JSX.Element) => {
        if (defs.stdDeviation <= 0) return this;

        const key = `${this.filterId}_gaussianBlur_${this.gaussianBlurCount++}`;

        this.maxOffset = Math.max(this.maxOffset, defs.stdDeviation * 3);
        this.filterPrimitives[key] = (srcIn: string) => ({
            element: (
                <feGaussianBlur in={srcIn} {...defs} result={key}>
                    {custom}
                </feGaussianBlur>
            ),
            resultGraphic: key,
        });

        return this;
    };

    public addHueRotationFilter = (defs: SVGHueRotationFilterDefs, custom?: JSX.Element) => {
        if (defs.deg === 0) return this;

        const key = `${this.filterId}_hueRotation_${this.hueRotationCount++}`;

        this.filterPrimitives[key] = (srcIn: string) => ({
            element: (
                <feColorMatrix in={srcIn} type="hueRotate" values={`${defs.deg}`} result={key}>
                    {custom}
                </feColorMatrix>
            ),
            resultGraphic: key,
        });

        return this;
    };

    public addSaturationFilter = (defs: SVGSaturationFilterDefs, custom?: JSX.Element) => {
        if (defs.amount === 1) return this;

        const key = `${this.filterId}_saturation_${this.saturationCount++}`;

        this.filterPrimitives[key] = (srcIn: string) => ({
            element: (
                <feColorMatrix in={srcIn} type="saturate" values={`${defs.amount}`} result={key}>
                    {custom}
                </feColorMatrix>
            ),
            resultGraphic: key,
        });

        return this;
    };

    public addBrightnessFilter = (defs: SVGBrightnessFilterDefs, custom?: JSX.Element) => {
        if (defs.amount === 1) return this;

        const key = `${this.filterId}_brightness_${this.brightnessCount++}`;

        this.filterPrimitives[key] = (srcIn: string) => ({
            element: (
                <feColorMatrix
                    in={srcIn}
                    type="matrix"
                    values={`${defs.amount} 0 0 0 0
                        0 ${defs.amount} 0 0 0
                        0 0 ${defs.amount} 0 0
                        0 0 0 1 0`}
                    result={key}
                >
                    {custom}
                </feColorMatrix>
            ),
            resultGraphic: key,
        });

        return this;
    };

    public addContrastFilter = (defs: SVGContrastFilterDefs, custom?: JSX.Element) => {
        if (defs.amount === 1) return this;

        const key = `${this.filterId}_contrast_${this.contrastCount++}`;
        const intercept = 0.5 * (1 - defs.amount);

        this.filterPrimitives[key] = (srcIn: string) => ({
            element: (
                <feColorMatrix
                    in={srcIn}
                    type="matrix"
                    values={`${defs.amount} 0 0 0 ${intercept}
                        0 ${defs.amount} 0 0 ${intercept}
                        0 0 ${defs.amount} 0 ${intercept}
                        0 0 0 1 0`}
                    result={key}
                >
                    {custom}
                </feColorMatrix>
            ),
            resultGraphic: key,
        });

        return this;
    };

    public addInversionFilter = (defs: SVGInversionFilterDefs, custom?: JSX.Element) => {
        if (defs.amount === 0) return this;

        const key = `${this.filterId}_inversion_${this.inversionCount++}`;
        const a = 1 - 2 * defs.amount;
        const b = defs.amount;

        this.filterPrimitives[key] = (srcIn: string) => ({
            element: (
                <feColorMatrix
                    in={srcIn}
                    type="matrix"
                    values={`${a} 0 0 0 ${b}
                        0 ${a} 0 0 ${b}
                        0 0 ${a} 0 ${b}
                        0 0 0 1 0`}
                    result={key}
                >
                    {custom}
                </feColorMatrix>
            ),
            resultGraphic: key,
        });

        return this;
    };

    public addColorChannelFilter = (defs: SVGColorFilterDefs, custom?: JSX.Element) => {
        if (defs.r === 1 && defs.g === 1 && defs.b === 1) return this;

        const key = `${this.filterId}_color_${this.colorCount++}`;

        this.filterPrimitives[key] = (srcIn: string) => ({
            element: (
                <feColorMatrix
                    in={srcIn}
                    type="matrix"
                    values={`${defs.r} 0 0 0 0
                        0 ${defs.g} 0 0 0
                        0 0 ${defs.b} 0 0
                        0 0 0 1 0`}
                    result={key}
                >
                    {custom}
                </feColorMatrix>
            ),
            resultGraphic: key,
        });

        return this;
    };
}
