import { SVGLinearGradientDefs, SVGRadialGradientDefs } from "./SVGGradientDefs.types";

export namespace SVGGradientDefsUtils {
    const renderGradientStops = (colors: (SVGLinearGradientDefs | SVGRadialGradientDefs)["colors"]) =>
        colors.map((c) => <stop offset={`${c.stop}%`} stop-color={c.value} />);

    const getLinearCoordsFromAngle = (angle: number) => {
        const rad = (angle * Math.PI) / 180;

        const x = Math.cos(rad);
        const y = Math.sin(rad);

        const x1 = 50 - x * 50;
        const y1 = 50 - y * 50;
        const x2 = 50 + x * 50;
        const y2 = 50 + y * 50;

        return { x1: `${x1}%`, y1: `${y1}%`, x2: `${x2}%`, y2: `${y2}%` };
    };

    export const setLinearGradient = (def: SVGLinearGradientDefs) => {
        const { id, angle, colors, ...baseProps } = def;
        const { x1, y1, x2, y2 } = getLinearCoordsFromAngle(angle);

        return (
            <linearGradient {...baseProps} id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
                {renderGradientStops(colors)}
            </linearGradient>
        );
    };

    export const setRadialGradient = (def: SVGRadialGradientDefs) => {
        const { id, colors, origin, ...baseProps } = def;

        return (
            <radialGradient {...baseProps} id={id} cx={`${origin.x}%`} cy={`${origin.y}%`} r="50%">
                {renderGradientStops(colors)}
            </radialGradient>
        );
    };
}
