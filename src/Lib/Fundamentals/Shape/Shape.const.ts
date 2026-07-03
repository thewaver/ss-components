import type { Point2d, Size2d } from "@thewaver/ss-utils";

export namespace ShapeConst {
    export const DEFAULT_SHAPES = ["square", "lozenge", "hexagon"] as const;
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

            case "hexagon":
                return [
                    { x: width * 0.5, y: 0 },
                    { x: width, y: height * 0.25 },
                    { x: width, y: height * 0.75 },
                    { x: width * 0.5, y: height },
                    { x: 0, y: height * 0.75 },
                    { x: 0, y: height * 0.25 },
                ];
        }
    };
}
