import type { JSX } from "solid-js";

import { SVGUtils } from "../../SVG.utils";
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

    export const getLinearGradient = (
        defs: SVGLinearGradientDefs,
        custom?: JSX.Element | ((x1: number, y1: number, x2: number, y2: number) => JSX.Element),
    ) => {
        const { id, angle, offset, scale, colors, ...baseProps } = defs;
        const { x1, y1, x2, y2 } = SVGUtils.getLinearCoords({ angle, offset, scale });

        return (
            <linearGradient {...baseProps} id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
                {typeof custom === "function" ? custom(x1, y1, x2, y2) : custom}
                {renderGradientStops(colors)}
            </linearGradient>
        );
    };

    export const getRadialGradient = (
        defs: SVGRadialGradientDefs,
        custom?: JSX.Element | ((cx: number, cy: number, r: number) => JSX.Element),
    ) => {
        const { id, colors, origin, scale, ...baseProps } = defs;
        const r = 0.5 * (scale ?? 1);

        return (
            <radialGradient {...baseProps} id={id} cx={origin.x} cy={origin.y} r={r}>
                {typeof custom === "function" ? custom(origin.x, origin.y, r) : custom}
                {renderGradientStops(colors)}
            </radialGradient>
        );
    };
}
