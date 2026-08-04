import type { JSX } from "solid-js";

import { SVGUtils } from "@thewaver/ss-utils";

import type { SVGLinearGradientDefs, SVGRadialGradientDefs } from "./SVGGradientDefs.types";

export namespace SVGGradientDefsUtils {
    const resolveStops = (colors: (SVGLinearGradientDefs | SVGRadialGradientDefs)["colors"]) =>
        colors.map((c, i) => {
            const prevIdx = colors.findLastIndex((x, j) => j <= i && x.stop != null);
            const nextIdx = colors.findIndex((x, j) => j >= i && x.stop != null);

            const prevStop = prevIdx >= 0 ? colors[prevIdx].stop! : 0;
            const nextStop = nextIdx >= 0 ? colors[nextIdx].stop! : 100;

            const prev = prevIdx >= 0 ? prevIdx : 0;
            const next = nextIdx >= 0 ? nextIdx : colors.length - 1;

            return (
                c.stop ?? (prev === next ? prevStop : prevStop + ((nextStop - prevStop) * (i - prev)) / (next - prev))
            );
        });

    const renderSmoothGradientStops = (colors: (SVGLinearGradientDefs | SVGRadialGradientDefs)["colors"], id: string) =>
        resolveStops(colors).map((stop, i) => (
            <stop id={`${id}-stop-${i}`} offset={`${stop}%`} stop-color={colors[i].value} />
        ));

    const renderBandedGradientStops = (
        colors: (SVGLinearGradientDefs | SVGRadialGradientDefs)["colors"],
        id: string,
    ) => {
        if (!colors.length) return [];

        const stops: JSX.Element[] = [];
        const resolvedStops = resolveStops(colors);

        stops.push(<stop id={`${id}-stop-0-start`} offset="0%" stop-color={colors[0].value} />);

        for (let i = 1; i < colors.length; i++) {
            const stop = resolvedStops[i];

            stops.push(<stop id={`${id}-stop-${i - 1}-end`} offset={`${stop}%`} stop-color={colors[i - 1].value} />);
            stops.push(<stop id={`${id}-stop-${i}-start`} offset={`${stop}%`} stop-color={colors[i].value} />);
        }

        return stops;
    };

    export const computeLinearGradient = (
        defs: SVGLinearGradientDefs,
        custom?: JSX.Element | ((x1: number, y1: number, x2: number, y2: number) => JSX.Element),
    ) => {
        const { id, angle, offset, scale, colors, spreadKind, ...baseProps } = defs;
        const { x1, y1, x2, y2 } = SVGUtils.getLinearCoords({ angle, offset, scale });

        return (
            <linearGradient {...baseProps} id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
                {typeof custom === "function" ? custom(x1, y1, x2, y2) : custom}
                {spreadKind === "banded"
                    ? renderBandedGradientStops(colors, id)
                    : renderSmoothGradientStops(colors, id)}
            </linearGradient>
        );
    };

    const DEFAULT_RADIAL_ORIGIN = { x: 0.5, y: 0.5 };

    export const computeRadialGradient = (
        defs: SVGRadialGradientDefs,
        custom?: JSX.Element | ((cx: number, cy: number, r: number) => JSX.Element),
    ) => {
        const { id, colors, origin, scale, spreadKind, ...baseProps } = defs;
        const o = origin ?? DEFAULT_RADIAL_ORIGIN;
        const r = 0.5 * (scale ?? 1);

        return (
            <radialGradient {...baseProps} id={id} cx={o.x} cy={o.y} r={r}>
                {typeof custom === "function" ? custom(o.x, o.y, r) : custom}
                {spreadKind === "banded"
                    ? renderBandedGradientStops(colors, id)
                    : renderSmoothGradientStops(colors, id)}
            </radialGradient>
        );
    };
}
