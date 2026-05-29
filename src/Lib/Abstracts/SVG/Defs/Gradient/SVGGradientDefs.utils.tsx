import type { JSX } from "solid-js";

import type { Point2d, Size2d } from "@thewaver/ss-utils";

import type { SVGLinearGradientDefs, SVGRadialGradientDefs } from "./SVGGradientDefs.types";

export namespace SVGGradientDefsUtils {
    const renderGradientStops = (colors: (SVGLinearGradientDefs | SVGRadialGradientDefs)["colors"]) =>
        colors.map((c, i) => {
            const prevIdx = colors.findLastIndex((x, j) => j <= i && x.stop != null);
            const nextIdx = colors.findIndex((x, j) => j >= i && x.stop != null);

            const prevStop = prevIdx >= 0 ? colors[prevIdx].stop! : 0;
            const nextStop = nextIdx >= 0 ? colors[nextIdx].stop! : 100;

            const prev = prevIdx >= 0 ? prevIdx : 0;
            const next = nextIdx >= 0 ? nextIdx : colors.length - 1;

            const offset =
                c.stop ?? (prev === next ? prevStop : prevStop + ((nextStop - prevStop) * (i - prev)) / (next - prev));

            return <stop offset={`${offset}%`} stop-color={c.value} />;
        });

    export const getLinearCoords = ({
        angle = 0,
        scale = { width: 1, height: 1 },
        offset = { x: 0, y: 0 },
    }: {
        angle?: number;
        scale?: Size2d;
        offset?: Point2d;
    }) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad);
        const y = Math.sin(rad);
        const cx = 0.5 + offset.x;
        const cy = 0.5 + offset.y;
        const halfW = 0.5 * scale.width;
        const halfH = 0.5 * scale.height;

        return {
            x1: cx - x * halfW,
            y1: cy - y * halfH,
            x2: cx + x * halfW,
            y2: cy + y * halfH,
        };
    };

    const get01ToPercent = (value: number) => `${value * 100}%`;

    export const getLinearGradient = (
        defs: SVGLinearGradientDefs,
        custom?: JSX.Element | ((x1: number, y1: number, x2: number, y2: number) => JSX.Element),
    ) => {
        const { id, angle, offset, scale, colors, ...baseProps } = defs;
        const { x1, y1, x2, y2 } = getLinearCoords({ angle, offset, scale });

        return (
            <linearGradient
                {...baseProps}
                id={id}
                x1={get01ToPercent(x1)}
                y1={get01ToPercent(y1)}
                x2={get01ToPercent(x2)}
                y2={get01ToPercent(y2)}
            >
                {typeof custom === "function" ? custom(x1, y1, x2, y2) : custom}
                {renderGradientStops(colors)}
            </linearGradient>
        );
    };

    export const getRadialGradient = (defs: SVGRadialGradientDefs, custom?: JSX.Element) => {
        const { id, colors, origin, ...baseProps } = defs;

        return (
            <radialGradient {...baseProps} id={id} cx={`${origin.x}%`} cy={`${origin.y}%`} r="50%">
                {custom}
                {renderGradientStops(colors)}
            </radialGradient>
        );
    };
}
