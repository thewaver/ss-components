import type { Point2d, Size2d } from "@thewaver/ss-utils";

export namespace SVGUtils {
    export const pointArrayToString = (points: Point2d[]) => points.map((p) => `${p.x},${p.y}`).join(" ");

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

    const ARC_CENTER = { x: 0.5, y: 0.5 };
    const ARC_RADIUS = 1;

    export const getArcPath = (arcSize: number, rotation: number) => {
        const normalizedArcSize = ((arcSize % 360) + 360) % 360;
        const startAngle = rotation + 180;
        const endAngle = startAngle + normalizedArcSize;
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const s = {
            x: ARC_CENTER.x + ARC_RADIUS * Math.cos(startRad),
            y: ARC_CENTER.y + ARC_RADIUS * Math.sin(startRad),
        };

        const e = {
            x: ARC_CENTER.x + ARC_RADIUS * Math.cos(endRad),
            y: ARC_CENTER.y + ARC_RADIUS * Math.sin(endRad),
        };

        const largeArcFlag = normalizedArcSize > 180 ? 1 : 0;

        return `M ${s.x} ${s.y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 ${largeArcFlag} 1 ${e.x} ${e.y}`;
    };
}
