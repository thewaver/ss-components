import type { Point2d, Size2d } from "@thewaver/ss-utils";

export namespace ShapeConst {
    export const DEFAULT_SHAPES = ["square", "lozenge", "hexagon-pole", "hexagon-side"] as const;
    export type DefaultShape = (typeof DEFAULT_SHAPES)[number];

    export const getDefaultShapePoints = (shape: DefaultShape, { width, height }: Size2d): Point2d[] => {
        switch (shape) {
            case "square":
                return [
                    { x: 0, y: 0 },
                    { x: width, y: 0 },
                    { x: width, y: height },
                    { x: 0, y: height },
                ];

            case "lozenge":
                return [
                    { x: width * 0.5, y: 0 },
                    { x: width, y: height * 0.5 },
                    { x: width * 0.5, y: height },
                    { x: 0, y: height * 0.5 },
                ];

            case "hexagon-pole":
                return [
                    { x: width * 0.5, y: 0 },
                    { x: width, y: height / 3 },
                    { x: width, y: (height / 3) * 2 },
                    { x: width * 0.5, y: height },
                    { x: 0, y: (height / 3) * 2 },
                    { x: 0, y: height / 3 },
                ];

            case "hexagon-side":
                return [
                    { x: width / 3, y: 0 },
                    { x: (width / 3) * 2, y: 0 },
                    { x: width, y: height * 0.5 },
                    { x: (width / 3) * 2, y: height },
                    { x: width / 3, y: height },
                    { x: 0, y: height * 0.5 },
                ];
        }
    };
}
