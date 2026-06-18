import type { JSX } from "solid-js";

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
    private maxStdDeviation = 0;

    constructor(private readonly filterId: string) {}

    public getFilterPrimitives = (defs?: SVGPrimitiveDefs) => {
        const entries = Object.entries(this.filterPrimitives);

        if (entries.length < 1) return undefined;

        const mergedDefs = { ...SVG_PRIMITIVE_DEFS, ...defs };
        const offset = this.maxStdDeviation * 3;

        let currentSourceGraphic = "SourceGraphic";

        return (
            <filter
                id={this.filterId}
                filterUnits="userSpaceOnUse"
                x={`${-offset}px`}
                y={`${-offset}px`}
                width={`calc(100% + ${offset * 2}px)`}
                height={`calc(100% + ${offset * 2}px)`}
            >
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
        const key = `${this.filterId}_dropShadow_${this.dropShadowCount++}`;

        this.maxStdDeviation = Math.max(this.maxStdDeviation, defs.stdDeviation);
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
        const key = `${this.filterId}_gaussianBlur_${this.gaussianBlurCount++}`;

        this.maxStdDeviation = Math.max(this.maxStdDeviation, defs.stdDeviation);
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
