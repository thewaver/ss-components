import type { JSX } from "solid-js";

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

    const getLinearCoordsFromAngle = (angle: number = 0) => {
        const rad = (angle * Math.PI) / 180;

        const x = Math.cos(rad);
        const y = Math.sin(rad);

        const x1 = 50 - x * 50;
        const y1 = 50 - y * 50;
        const x2 = 50 + x * 50;
        const y2 = 50 + y * 50;

        return { x1: `${x1}%`, y1: `${y1}%`, x2: `${x2}%`, y2: `${y2}%` };
    };

    export const setLinearGradient = (defs: SVGLinearGradientDefs, custom?: JSX.Element) => {
        const { id, angle, colors, ...baseProps } = defs;
        const { x1, y1, x2, y2 } = getLinearCoordsFromAngle(angle);

        return (
            <linearGradient {...baseProps} id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
                {custom}
                {renderGradientStops(colors)}
            </linearGradient>
        );
    };

    export const setRadialGradient = (defs: SVGRadialGradientDefs, custom?: JSX.Element) => {
        const { id, colors, origin, ...baseProps } = defs;

        return (
            <radialGradient {...baseProps} id={id} cx={`${origin.x}%`} cy={`${origin.y}%`} r="50%">
                {custom}
                {renderGradientStops(colors)}
            </radialGradient>
        );
    };
}
