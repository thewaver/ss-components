import { JSX } from "solid-js";

import { Point2d } from "@thewaver/ss-utils";

type ShapeButtonSVGDefs = {
    id: string;
};

type ShapeButtonGradientDefs = ShapeButtonSVGDefs & {
    colors: {
        value: string;
        stop: number;
    }[];
    spreadMethod?: "pad" | "reflect" | "repeat";
};

type ShapeButtonLinearGradientDefs = ShapeButtonGradientDefs & {
    angle: number;
};

type ShapeButtonRadialGradientDefs = ShapeButtonGradientDefs & {
    origin: Point2d;
};

type ShapeButtonDropShadowFilter = ShapeButtonSVGDefs & {
    dx: number;
    dy: number;
    stdDeviation: number;
    floodColor: string;
    floodOpacity: number;
};

type ShapeButtonGaussianBlurFilter = ShapeButtonSVGDefs & {
    stdDeviation: number;
};

type ShapeButtonSaturationFilter = ShapeButtonSVGDefs & {
    amount: number;
};

type ShapeButtonHueRotationFilter = ShapeButtonSVGDefs & {
    deg: number;
};

type ShapeButtonBrightnessFilter = ShapeButtonSVGDefs & {
    amount: number;
};

type ShapeButtonContrastFilter = ShapeButtonSVGDefs & {
    amount: number;
};

type ShapeButtonInversionFilter = ShapeButtonSVGDefs & {
    amount: number;
};

export class ShapeButtonDefs {
    private readonly gradients: JSX.Element[] = [];
    private readonly filterPrimitives: Record<string, JSX.Element> = {};

    constructor(private readonly id: string) {}

    private renderGradientStops = (colors: ShapeButtonGradientDefs["colors"]) =>
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
        return (
            <filter id={this.id}>
                {Object.values(this.filterPrimitives)}

                <feMerge>
                    {Object.keys(this.filterPrimitives).map((key) => (
                        <feMergeNode in={key} />
                    ))}
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        );
    };

    public addLinearGradient = (def: ShapeButtonLinearGradientDefs): ShapeButtonDefs => {
        const { angle, colors, ...baseProps } = def;
        const { x1, y1, x2, y2 } = this.getLinearCoordsFromAngle(angle);

        this.gradients.push(
            <linearGradient {...baseProps} x1={x1} y1={y1} x2={x2} y2={y2}>
                {this.renderGradientStops(colors)}
            </linearGradient>,
        );

        return this;
    };

    public addRadialGradient = (def: ShapeButtonRadialGradientDefs): ShapeButtonDefs => {
        const { colors, origin, ...baseProps } = def;

        this.gradients.push(
            <radialGradient {...baseProps} cx={`${origin.x}%`} cy={`${origin.y}%`} r="50%">
                {this.renderGradientStops(colors)}
            </radialGradient>,
        );

        return this;
    };

    public addDropShadowFilter = (def: ShapeButtonDropShadowFilter): ShapeButtonDefs => {
        const key = `dropShadow_${def.id}`;
        this.filterPrimitives[key] = <feDropShadow {...def} result={key} />;
        return this;
    };

    public addGaussianBlurFilter = (def: ShapeButtonGaussianBlurFilter): ShapeButtonDefs => {
        const key = `gaussianBlur_${def.id}`;
        this.filterPrimitives[key] = <feGaussianBlur {...def} result={key} />;
        return this;
    };

    public addSaturationFilter = (def: ShapeButtonSaturationFilter): ShapeButtonDefs => {
        const key = `saturation_${def.id}`;
        this.filterPrimitives[key] = <feColorMatrix type="saturate" values={`${def.amount}`} result={key} />;
        return this;
    };

    public addHueRotationFilter = (def: ShapeButtonHueRotationFilter): ShapeButtonDefs => {
        const key = `hueRotation_${def.id}`;
        this.filterPrimitives[key] = <feColorMatrix type="hueRotate" values={`${def.deg}`} result={key} />;
        return this;
    };

    public addBrightnessFilter = (def: ShapeButtonBrightnessFilter): ShapeButtonDefs => {
        const key = `brightness_${def.id}`;

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

    public addContrastFilter = (def: ShapeButtonContrastFilter): ShapeButtonDefs => {
        const key = `contrast_${def.id}`;
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

    public addInvertionFilter = (def: ShapeButtonInversionFilter): ShapeButtonDefs => {
        const key = `invertion_${def.id}`;
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
                {this.gradients}
                {this.getMergedFilterPrimitives()}
            </>
        );
    };
}
