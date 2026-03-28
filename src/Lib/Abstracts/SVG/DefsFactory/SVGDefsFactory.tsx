import { JSX } from "solid-js";

import {
    SVGBrightnessFilterDefs,
    SVGContrastFilterDefs,
    SVGDropShadowFilterDefs,
    SVGGaussianBlurFilterDefs,
    SVGHueRotationFilterDefs,
    SVGInversionFilterDefs,
    SVGLinearGradientDefs,
    SVGRadialGradientDefs,
    SVGSaturationFilterDefs,
} from "./SVGDefsFactory.types";

export class SVGDefsFactory {
    private gradient: JSX.Element | undefined;
    private filterPrimitives: Record<string, JSX.Element> = {};
    private dropShadowCount = 0;

    public readonly gradientId: string;
    public readonly filterId: string;

    constructor(id: string) {
        this.gradientId = `${id}_gradient`;
        this.filterId = `${id}_filter`;
    }

    private renderGradientStops = (colors: (SVGLinearGradientDefs | SVGRadialGradientDefs)["colors"]) =>
        colors.map((c) => <stop offset={`${c.stop}%`} stop-color={c.value} />);

    private getLinearCoordsFromAngle = (angle: number) => {
        const rad = (angle * Math.PI) / 180;

        const x = Math.cos(rad);
        const y = Math.sin(rad);

        const x1 = 50 - x * 50;
        const y1 = 50 - y * 50;
        const x2 = 50 + x * 50;
        const y2 = 50 + y * 50;

        return { x1: `${x1}%`, y1: `${y1}%`, x2: `${x2}%`, y2: `${y2}%` };
    };

    private getMergedFilterPrimitives = () => {
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

    public setLinearGradient = (def: SVGLinearGradientDefs) => {
        const { angle, colors, ...baseProps } = def;
        const { x1, y1, x2, y2 } = this.getLinearCoordsFromAngle(angle);

        this.gradient = (
            <linearGradient {...baseProps} id={this.gradientId} x1={x1} y1={y1} x2={x2} y2={y2}>
                {this.renderGradientStops(colors)}
            </linearGradient>
        );

        return this;
    };

    public setRadialGradient = (def: SVGRadialGradientDefs) => {
        const { colors, origin, ...baseProps } = def;

        this.gradient = (
            <radialGradient {...baseProps} id={this.gradientId} cx={`${origin.x}%`} cy={`${origin.y}%`} r="50%">
                {this.renderGradientStops(colors)}
            </radialGradient>
        );

        return this;
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

    public getValue = () => {
        return (
            <>
                {this.gradient}
                {this.getMergedFilterPrimitives()}
            </>
        );
    };
}
