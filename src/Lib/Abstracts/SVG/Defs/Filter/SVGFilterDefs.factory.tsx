import { JSX } from "solid-js";

import {
    SVGBrightnessFilterDefs,
    SVGContrastFilterDefs,
    SVGDropShadowFilterDefs,
    SVGGaussianBlurFilterDefs,
    SVGHueRotationFilterDefs,
    SVGInversionFilterDefs,
    SVGSaturationFilterDefs,
} from "./SVGFilterDefs.types";

export class SVGFilterDefsFactory {
    private filterPrimitives: Record<string, JSX.Element> = {};
    private dropShadowCount = 0;

    constructor(private readonly filterId: string) {}

    public getMergedFilterPrimitives = () => {
        const keys = Object.keys(this.filterPrimitives);

        if (keys.length < 1) return undefined;

        return (
            <filter id={this.filterId}>
                {Object.values(this.filterPrimitives)}

                <feMerge>
                    {keys.map((key) => (
                        <feMergeNode in={key} />
                    ))}
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        );
    };

    public addDropShadowFilter = (def: SVGDropShadowFilterDefs) => {
        const key = `${this.filterId}_dropShadow_${this.dropShadowCount++}`;

        this.filterPrimitives[key] = <feDropShadow {...def} result={key} />;

        return this;
    };

    public setGaussianBlurFilter = (def: SVGGaussianBlurFilterDefs) => {
        const key = `${this.filterId}_gaussianBlur`;

        this.filterPrimitives[key] = <feGaussianBlur {...def} result={key} />;

        return this;
    };

    public setSaturationFilter = (def: SVGSaturationFilterDefs) => {
        const key = `${this.filterId}_saturation`;

        this.filterPrimitives[key] = <feColorMatrix type="saturate" values={`${def.amount}`} result={key} />;

        return this;
    };

    public setHueRotationFilter = (def: SVGHueRotationFilterDefs) => {
        const key = `${this.filterId}_hueRotation`;

        this.filterPrimitives[key] = <feColorMatrix type="hueRotate" values={`${def.deg}`} result={key} />;

        return this;
    };

    public setBrightnessFilter = (def: SVGBrightnessFilterDefs) => {
        const key = `${this.filterId}_brightness`;

        this.filterPrimitives[key] = (
            <feColorMatrix
                type="matrix"
                values={`${def.amount} 0 0 0 0
                        0 ${def.amount} 0 0 0
                        0 0 ${def.amount} 0 0
                        0 0 0 1 0`}
                result={key}
            />
        );

        return this;
    };

    public setContrastFilter = (def: SVGContrastFilterDefs) => {
        const key = `${this.filterId}_contrast`;
        const intercept = 0.5 * (1 - def.amount);

        this.filterPrimitives[key] = (
            <feColorMatrix
                type="matrix"
                values={`${def.amount} 0 0 0 ${intercept}
                        0 ${def.amount} 0 0 ${intercept}
                        0 0 ${def.amount} 0 ${intercept}
                        0 0 0 1 0`}
                result={key}
            />
        );

        return this;
    };

    public setInversionFilter = (def: SVGInversionFilterDefs) => {
        const key = `${this.filterId}_inversion`;
        const a = 1 - 2 * def.amount;
        const b = def.amount;

        this.filterPrimitives[key] = (
            <feColorMatrix
                type="matrix"
                values={`${a} 0 0 0 ${b}
                        0 ${a} 0 0 ${b}
                        0 0 ${a} 0 ${b}
                        0 0 0 1 0`}
                result={key}
            />
        );

        return this;
    };
}
