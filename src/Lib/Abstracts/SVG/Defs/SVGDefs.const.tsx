import { MathUtils, ObjectUtils, type Size2d } from "@thewaver/ss-utils";

import { ShapeConst } from "../../../Fundamentals/Shape/Shape.const";
import { ShapeUtils } from "../../../Fundamentals/Shape/Shape.utils";
import type { InteractionFlags } from "../../Interaction/Interaction.types";
import type { SVGAnimationDefs } from "./Animation/SVGAnimationDefs.types";
import { SVGAnimationUtils } from "./Animation/SVGAnimationDefs.utils";
import { SVGFilterDefsFactory } from "./Filter/SVGFilterDefs.factory";
import { SVGGradientDefsUtils } from "./Gradient/SVGGradientDefs.utils";
import { SVGPatternDefsUtils } from "./Pattern/SVGPatternDefs.utils";
import type { SVGDefs } from "./SVGDefs.types";

const unwarpAngle = (angle: number, size: Size2d): number => {
    if (size.width === 0 || size.height === 0) return angle;

    const radians = angle * (Math.PI / 180);
    const visualX = Math.cos(radians);
    const visualY = Math.sin(radians);
    const boxX = visualX / size.height;
    const boxY = visualY / size.width;
    const unwarpedRadians = Math.atan2(boxY, boxX);

    return unwarpedRadians * (180 / Math.PI);
};

const getRandom01Values = (maxLength: number) => {
    const pattern = Math.random() >= 0.5 ? "0;1;" : "1;0;";
    const result = pattern.repeat(Math.ceil(Math.random() * maxLength)) + pattern[0];

    return result;
};

export namespace SVGDefsSamples {
    export type ColorDefs = { [K in "primary" | "secondary" | "tertiary" | "background"]: string };

    const getBaseBlur = (
        id: string,
        defs: {
            getSize: () => Size2d;
            getBlurWidth?: () => number;
        },
    ) =>
        defs.getBlurWidth
            ? {
                  id: `border-blur-filter-${id}`,
                  defsElement: new SVGFilterDefsFactory(`border-blur-filter-${id}`)
                      .addGaussianBlurFilter({ stdDeviation: defs.getBlurWidth() })
                      .getFilterPrimitives({ method: "isolate", elementSize: defs.getSize() }),
              }
            : undefined;

    export namespace Pattern {
        const DEBUG_EDGES = false;

        type ElementDefs = SVGAnimationDefs & {
            getSize: () => Size2d;
            getCellSize: () => Size2d;
            getColors: () => ColorDefs;
            getBlurWidth?: () => number;
        };

        export type ConfigDefs = {
            getSVGDefs: (
                id: string,
                getInteractionFlags: (() => InteractionFlags) | undefined,
                defs: ElementDefs,
            ) => SVGDefs[];
        };

        const getBaseBackgroundColor = (defs: { getColors: () => ColorDefs }) =>
            `hsl(from ${defs.getColors().background} h s calc(l * 1.5) / 25%)`;

        // GENERICS

        const circle = (variant: "grid" | "drop" | "shift"): ConfigDefs => ({
            getSVGDefs: (id, __, defs) => {
                const cellSize = defs.getCellSize();
                const cellCount = {
                    rows: Math.ceil(defs.getSize().height / cellSize.height) + (variant === "drop" ? 1 : 0),
                    cols: Math.ceil(defs.getSize().width / cellSize.width) + (variant === "shift" ? 1 : 0),
                };
                const r = Math.min(cellSize.width, cellSize.height) * 0.5;

                const cb =
                    variant === "grid"
                        ? SVGPatternDefsUtils.getGridPattern
                        : variant === "drop"
                          ? SVGPatternDefsUtils.getHalfDropPattern
                          : SVGPatternDefsUtils.getHalfShiftPattern;

                return [
                    {
                        gradientOrPattern: {
                            id: `pattern1-${id}`,
                            defsElement: cb(`pattern1-${id}`, cellCount, cellSize, (cellId, index, isSplit) => {
                                const isEven = MathUtils.isEven(index.col + index.row);

                                return (
                                    <circle
                                        id={cellId}
                                        r={r}
                                        cx={cellSize.width * 0.5}
                                        cy={cellSize.height * 0.5}
                                        fill={
                                            DEBUG_EDGES && isSplit
                                                ? defs.getColors().tertiary
                                                : isEven
                                                  ? defs.getColors().primary
                                                  : defs.getColors().secondary
                                        }
                                    >
                                        <animate
                                            attributeName="r"
                                            values={getRandom01Values(8)
                                                .split(";")
                                                .map((v) => `${Number(v) * r}`)
                                                .join(";")}
                                            dur={`${defs.getAnimationDurationMs() * 4}ms`}
                                            repeatCount="indefinite"
                                        />
                                    </circle>
                                );
                            }),
                        },
                    },
                ];
            },
        });

        const hexagon = (
            variant: Extract<ShapeConst.DefaultShape, "hexagon-pointy-top" | "hexagon-flat-top">,
        ): ConfigDefs => ({
            getSVGDefs: (id, __, defs) => {
                const cellSize = defs.getCellSize();
                const cellCount = {
                    rows:
                        Math.ceil(
                            (defs.getSize().height / cellSize.height) * (variant === "hexagon-pointy-top" ? 1.5 : 1),
                        ) + 1,
                    cols:
                        Math.ceil(
                            (defs.getSize().width / cellSize.width) * (variant === "hexagon-pointy-top" ? 1 : 1.5),
                        ) + 1,
                };
                const cb =
                    variant === "hexagon-pointy-top"
                        ? SVGPatternDefsUtils.getHexPointyTopPattern
                        : SVGPatternDefsUtils.getHexFlatTopPattern;

                const lozenge = (
                    <path
                        id={`${id}-lozenge`}
                        d={ShapeUtils.pointsToPath(ShapeConst.getDefaultShapePoints(variant, cellSize))}
                    />
                );

                return [
                    {
                        gradientOrPattern: {
                            id: `pattern1-${id}`,
                            defsElement: (
                                <>
                                    {lozenge}
                                    {cb(`pattern1-${id}`, cellCount, cellSize, (cellId, index, isSplit) => {
                                        const isEven = MathUtils.isEven(index.row);
                                        const shapeId = `${id}-lozenge`;

                                        return (
                                            <use
                                                id={cellId}
                                                href={`#${shapeId}`}
                                                fill={
                                                    DEBUG_EDGES && isSplit
                                                        ? defs.getColors().tertiary
                                                        : isEven
                                                          ? defs.getColors().primary
                                                          : defs.getColors().secondary
                                                }
                                            >
                                                <animate
                                                    attributeName="fill-opacity"
                                                    values={getRandom01Values(8)}
                                                    dur={`${defs.getAnimationDurationMs() * 4}ms`}
                                                    repeatCount="indefinite"
                                                />
                                            </use>
                                        );
                                    })}
                                </>
                            ),
                        },
                    },
                ];
            },
        });

        const lozenge = (): ConfigDefs => ({
            getSVGDefs: (id, __, defs) => {
                const cellSize = defs.getCellSize();
                const cellCount = {
                    rows: Math.ceil((defs.getSize().height / cellSize.height) * 2) + 1,
                    cols: Math.ceil(defs.getSize().width / cellSize.width) + 1,
                };

                const lozenge = (
                    <path
                        id={`${id}-lozenge`}
                        d={ShapeUtils.pointsToPath(ShapeConst.getDefaultShapePoints("lozenge", cellSize))}
                    />
                );

                return [
                    {
                        gradientOrPattern: {
                            id: `pattern1-${id}`,
                            defsElement: (
                                <>
                                    {lozenge}
                                    {SVGPatternDefsUtils.getDiagonalPattern(
                                        `pattern1-${id}`,
                                        cellCount,
                                        cellSize,
                                        (cellId, index, isSplit) => {
                                            const isEven = MathUtils.isEven(index.row);
                                            const shapeId = `${id}-lozenge`;

                                            return (
                                                <use
                                                    id={cellId}
                                                    href={`#${shapeId}`}
                                                    fill={
                                                        DEBUG_EDGES && isSplit
                                                            ? defs.getColors().tertiary
                                                            : isEven
                                                              ? defs.getColors().primary
                                                              : defs.getColors().secondary
                                                    }
                                                >
                                                    <animate
                                                        attributeName="fill-opacity"
                                                        values={getRandom01Values(8)}
                                                        dur={`${defs.getAnimationDurationMs() * 4}ms`}
                                                        repeatCount="indefinite"
                                                    />
                                                </use>
                                            );
                                        },
                                    )}
                                </>
                            ),
                        },
                    },
                ];
            },
        });

        const triangle = (): ConfigDefs => ({
            getSVGDefs: (id, __, defs) => {
                const cellSize = defs.getCellSize();
                const cellCount = {
                    rows: Math.ceil(defs.getSize().height / cellSize.height),
                    cols: Math.ceil((defs.getSize().width / cellSize.width) * 2) + 1,
                };

                const upTriangle = (
                    <path
                        id={`${id}-triangle-up`}
                        d={ShapeUtils.pointsToPath(ShapeConst.getDefaultShapePoints("triangle-up", cellSize))}
                    />
                );

                const downTriangle = (
                    <path
                        id={`${id}-triangle-down`}
                        d={ShapeUtils.pointsToPath(ShapeConst.getDefaultShapePoints("triangle-down", cellSize))}
                    />
                );

                return [
                    {
                        gradientOrPattern: {
                            id: `pattern1-${id}`,
                            defsElement: (
                                <>
                                    {upTriangle}
                                    {downTriangle}
                                    {SVGPatternDefsUtils.getTrianglePattern(
                                        `pattern1-${id}`,
                                        cellCount,
                                        cellSize,
                                        (cellId, index, isSplit) => {
                                            const isEven = MathUtils.isEven(index.col + index.row);
                                            const shapeId = isEven ? `${id}-triangle-up` : `${id}-triangle-down`;

                                            return (
                                                <use
                                                    id={cellId}
                                                    href={`#${shapeId}`}
                                                    fill={
                                                        DEBUG_EDGES && isSplit
                                                            ? defs.getColors().tertiary
                                                            : isEven
                                                              ? defs.getColors().primary
                                                              : defs.getColors().secondary
                                                    }
                                                >
                                                    <animate
                                                        attributeName="fill-opacity"
                                                        values={getRandom01Values(8)}
                                                        dur={`${defs.getAnimationDurationMs() * 4}ms`}
                                                        repeatCount="indefinite"
                                                    />
                                                </use>
                                            );
                                        },
                                    )}
                                </>
                            ),
                        },
                    },
                ];
            },
        });

        const whirl = (curvature: number): ConfigDefs => ({
            getSVGDefs: (id, __, defs) => [
                {
                    color: getBaseBackgroundColor(defs),
                },
                {
                    gradientOrPattern: {
                        id: `gradient1-${id}`,
                        defsElement: SVGGradientDefsUtils.getRadialGradient(
                            {
                                id: `gradient1-${id}`,
                                colors: [
                                    { value: defs.getColors().primary },
                                    { value: defs.getColors().primary },
                                    { value: defs.getColors().secondary },
                                    { value: defs.getColors().primary },
                                ],
                            },
                            SVGAnimationUtils.Radial.grow([0, 2], {
                                ...defs,
                                getAnimationDurationMs: () => defs.getAnimationDurationMs() * 0.5,
                            }),
                        ),
                    },
                    clipPath: {
                        id: `clip1-${id}`,
                        defsElement: (
                            <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                {SVGAnimationUtils.Path.getRotatingWedges(
                                    Math.max(defs.getCellSize().width, defs.getCellSize().height),
                                    0.75,
                                    curvature,
                                    MathUtils.getIntermediateValues(0, 360, 12),
                                    defs,
                                )}
                            </clipPath>
                        ),
                    },
                },
            ],
        });

        // SAMPLES

        export const SAMPLE_CONFIGS = {
            plain: {
                getSVGDefs: (_, __, defs) => [
                    {
                        color: getBaseBackgroundColor(defs),
                    },
                ],
            },

            circle_g_2: circle("grid"),
            circle_hd_2: circle("drop"),
            circle_hs_2: circle("shift"),
            hexagon_ft_2: hexagon("hexagon-flat-top"),
            hexagon_pt_2: hexagon("hexagon-pointy-top"),
            lozenge_d_2: lozenge(),
            triangle_t_2: triangle(),
            whirl_2: whirl(0),
            whirlCurved_2: whirl(-4),
        } as const satisfies Record<string, ConfigDefs>;
    }

    export namespace Gradient {
        type ElementDefs = SVGAnimationDefs & {
            getSize: () => Size2d;
            getColors: () => ColorDefs;
            getBlurWidth?: () => number;
        };

        export type ConfigDefs = {
            getSVGDefs: (
                id: string,
                getInteractionFlags: (() => InteractionFlags) | undefined,
                defs: ElementDefs,
            ) => SVGDefs[];
        };

        const getBaseBorderColor = (defs: { getColors: () => ColorDefs }) =>
            `hsl(from ${defs.getColors().background} h s calc(l * 1.5) / 50%)`;

        export const SAMPLE_CONFIGS = {
            plain: {
                getSVGDefs: (_, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                ],
            },

            // FLOW

            flow_2s: {
                getSVGDefs: (id, __, defs) => [
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().primary },
                                    ],
                                    spreadKind: "banded",
                                    scale: { width: 2, height: 1 },
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [0.5, -0.5], defs),
                            ),
                        },
                    },
                ],
            },

            flow_3: {
                getSVGDefs: (id, __, defs) => [
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().tertiary },
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().tertiary },
                                        { value: defs.getColors().primary },
                                    ],
                                    scale: { width: 2, height: 1 },
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [0.5, -0.5], defs),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                ],
            },

            flow_3s: {
                getSVGDefs: (id, __, defs) => [
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().tertiary },
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().tertiary },
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().tertiary },
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().tertiary },
                                        { value: defs.getColors().primary },
                                    ],
                                    spreadKind: "banded",
                                    scale: { width: 2, height: 1 },
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [0.5, -0.5], defs),
                            ),
                        },
                    },
                ],
            },

            flowDiagonal_2s: {
                getSVGDefs: (id, __, defs) => [
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().primary },
                                    ],
                                    spreadKind: "banded",
                                    angle: unwarpAngle(45, defs.getSize()),
                                    scale: { width: 2, height: 2 },
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepDiagonal(
                                        x1,
                                        y1,
                                        x2,
                                        y2,
                                        unwarpAngle(45, defs.getSize()),
                                        [0.25, -0.25],
                                        defs,
                                    ),
                            ),
                        },
                    },
                ],
            },

            flowDiagonal_3: {
                getSVGDefs: (id, __, defs) => [
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().tertiary },
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().tertiary },
                                        { value: defs.getColors().primary },
                                    ],
                                    angle: unwarpAngle(45, defs.getSize()),
                                    scale: { width: 2, height: 2 },
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepDiagonal(
                                        x1,
                                        y1,
                                        x2,
                                        y2,
                                        unwarpAngle(45, defs.getSize()),
                                        [0.5, -0.5],
                                        defs,
                                    ),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                ],
            },

            flowDiagonal_3s: {
                getSVGDefs: (id, __, defs) => [
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().tertiary },
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().tertiary },
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().tertiary },
                                        { value: defs.getColors().primary },
                                        { value: defs.getColors().secondary },
                                        { value: defs.getColors().tertiary },
                                        { value: defs.getColors().primary },
                                    ],
                                    spreadKind: "banded",
                                    angle: unwarpAngle(45, defs.getSize()),
                                    scale: { width: 2, height: 2 },
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepDiagonal(
                                        x1,
                                        y1,
                                        x2,
                                        y2,
                                        unwarpAngle(45, defs.getSize()),
                                        [0.25, -0.25],
                                        defs,
                                    ),
                            ),
                        },
                    },
                ],
            },

            // MERGE

            merge_1v1: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: defs.getColors().primary },
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                    ],
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [-1, 1, -1], defs),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                        blend: true,
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient2-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient2-${id}`,
                                    colors: [
                                        { value: defs.getColors().secondary },
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                    ],
                                    angle: 180,
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [1, -1, 1], defs),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                        blend: true,
                    },
                ],
            },

            mergeDiagonal_1v1: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: defs.getColors().primary },
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                    ],
                                    angle: 45,
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepDiagonal(
                                        x1,
                                        y1,
                                        x2,
                                        y2,
                                        45,
                                        [-1.25, 1.25, -1.25],
                                        defs,
                                    ),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                        blend: true,
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient2-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient2-${id}`,
                                    colors: [
                                        { value: defs.getColors().secondary },
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                    ],
                                    angle: 225,
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepDiagonal(
                                        x1,
                                        y1,
                                        x2,
                                        y2,
                                        225,
                                        [-1.25, 1.25, -1.25],
                                        defs,
                                    ),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                        blend: true,
                    },
                ],
            },

            mergeDiagonalDesync_4x: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: defs.getColors().primary },
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                    ],
                                    angle: 45,
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepDiagonal(
                                        x1,
                                        y1,
                                        x2,
                                        y2,
                                        45,
                                        [0, -1.25, -1.25, -1.25, 0],
                                        defs,
                                    ),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                        blend: true,
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient2-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient2-${id}`,
                                    colors: [
                                        { value: defs.getColors().secondary },
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                    ],
                                    angle: 135,
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepDiagonal(
                                        x1,
                                        y1,
                                        x2,
                                        y2,
                                        135,
                                        [-1.25, 0, -1.25, -1.25, -1.25],
                                        defs,
                                    ),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                        blend: true,
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient3-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient3-${id}`,
                                    colors: [
                                        { value: defs.getColors().primary },
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                    ],
                                    angle: 225,
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepDiagonal(
                                        x1,
                                        y1,
                                        x2,
                                        y2,
                                        225,
                                        [-1.25, -1.25, 0, -1.25, -1.25],
                                        defs,
                                    ),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                        blend: true,
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient4-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient4-${id}`,
                                    colors: [
                                        { value: defs.getColors().secondary },
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                    ],
                                    angle: 315,
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepDiagonal(
                                        x1,
                                        y1,
                                        x2,
                                        y2,
                                        315,
                                        [-1.25, -1.25, -1.25, 0, -1.25],
                                        defs,
                                    ),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                        blend: true,
                    },
                ],
            },

            // ORBIT

            orbit_1: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                        { value: defs.getColors().primary },
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                    ],
                                },
                                SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                ],
            },

            orbit_1v1: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                        { value: defs.getColors().primary },
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                    ],
                                },
                                SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient2-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient2-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                        { value: defs.getColors().secondary },
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                    ],
                                },
                                SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(360, 0, 12), defs),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                ],
            },

            orbitDesync_2v1: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: defs.getColors().tertiary },
                                        { value: defs.getColors().secondary },
                                    ],
                                },
                                SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient2-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient2-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                        { value: defs.getColors().primary },
                                    ],
                                },
                                SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(360, 0, 12), defs),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                ],
            },

            orbitDesync_3x: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                        { value: defs.getColors().primary },
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                    ],
                                },
                                SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), {
                                    ...defs,
                                    getAnimationDurationMs: () => defs.getAnimationDurationMs() * 0.5,
                                }),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                        blend: true,
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient2-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient2-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                        { value: defs.getColors().secondary },
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                    ],
                                },
                                SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                        blend: true,
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient3-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient3-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().tertiary} r g b / 0)` },
                                        { value: defs.getColors().tertiary },
                                        { value: `rgb(from ${defs.getColors().tertiary} r g b / 0)` },
                                    ],
                                },
                                SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), {
                                    ...defs,
                                    getAnimationDurationMs: () => defs.getAnimationDurationMs() * 2,
                                }),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                        blend: true,
                    },
                ],
            },

            // SCAN

            scan_1: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                        { value: defs.getColors().primary },
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                    ],
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [-1, 1, -1], defs),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                ],
            },

            scan_1v1: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                        { value: defs.getColors().primary },
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                    ],
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [-1, 1, -1], defs),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient2-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient2-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                        { value: defs.getColors().secondary },
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                    ],
                                    angle: 90,
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepOrthogonal("y", y1, y2, [-1, 1, -1], defs),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                ],
            },

            scanDiagonal_1: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                        { value: defs.getColors().primary },
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                    ],
                                    angle: 45,
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepDiagonal(
                                        x1,
                                        y1,
                                        x2,
                                        y2,
                                        45,
                                        [-1.25, 1.25, -1.25],
                                        defs,
                                    ),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                ],
            },

            scanDiagonal_1v1: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                        { value: defs.getColors().primary },
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                    ],
                                    angle: 45,
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepDiagonal(
                                        x1,
                                        y1,
                                        x2,
                                        y2,
                                        45,
                                        [-1.25, 1.25, -1.25],
                                        defs,
                                    ),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient2-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient2-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                        { value: defs.getColors().secondary },
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                    ],
                                    angle: 135,
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepDiagonal(
                                        x1,
                                        y1,
                                        x2,
                                        y2,
                                        135,
                                        [-1.25, 1.25, -1.25],
                                        defs,
                                    ),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                ],
            },

            // SNAKE

            snake_1: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                        { value: defs.getColors().primary },
                                    ],
                                },
                                SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                            ),
                        },
                        clipPath: {
                            id: `clip1-${id}`,
                            defsElement: (
                                <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(MathUtils.getIntermediateValues(0, 360, 12), 180),
                                        defs,
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                ],
            },

            snake_1v1: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                        { value: defs.getColors().primary },
                                    ],
                                },
                                SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                            ),
                        },
                        clipPath: {
                            id: `clip1-${id}`,
                            defsElement: (
                                <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(MathUtils.getIntermediateValues(0, 360, 12), 180),
                                        defs,
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient2-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient2-${id}`,
                                    colors: [
                                        { value: defs.getColors().secondary },
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                    ],
                                },
                                SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(360, 0, 12), defs),
                            ),
                        },
                        clipPath: {
                            id: `clip2-${id}`,
                            defsElement: (
                                <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(MathUtils.getIntermediateValues(360, 0, 12), 180),
                                        defs,
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                ],
            },

            snake_2: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                        { value: defs.getColors().primary },
                                    ],
                                },
                                SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                            ),
                        },
                        clipPath: {
                            id: `clip1-${id}`,
                            defsElement: (
                                <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(MathUtils.getIntermediateValues(0, 360, 12), 180),
                                        defs,
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient2-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient2-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                        { value: defs.getColors().secondary },
                                    ],
                                },
                                SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(180, 540, 12), defs),
                            ),
                        },
                        clipPath: {
                            id: `clip2-${id}`,
                            defsElement: (
                                <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(MathUtils.getIntermediateValues(180, 540, 12), 180),
                                        defs,
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                ],
            },

            snake_4: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                        { value: defs.getColors().secondary, stop: 75 },
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)`, stop: 75 },
                                    ],
                                },
                                SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                            ),
                        },
                        clipPath: {
                            id: `clip1-${id}`,
                            defsElement: (
                                <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(MathUtils.getIntermediateValues(0, 360, 12), 180),
                                        defs,
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient2-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient2-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                        { value: defs.getColors().primary, stop: 75 },
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)`, stop: 75 },
                                    ],
                                },
                                SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(90, 450, 12), defs),
                            ),
                        },
                        clipPath: {
                            id: `clip2-${id}`,
                            defsElement: (
                                <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(MathUtils.getIntermediateValues(90, 450, 12), 180),
                                        defs,
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient3-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient3-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                        { value: defs.getColors().secondary, stop: 75 },
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)`, stop: 75 },
                                    ],
                                },
                                SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(180, 540, 12), defs),
                            ),
                        },
                        clipPath: {
                            id: `clip3-${id}`,
                            defsElement: (
                                <clipPath id={`clip3-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(MathUtils.getIntermediateValues(180, 540, 12), 180),
                                        defs,
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient4-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient4-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                        { value: defs.getColors().primary, stop: 75 },
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)`, stop: 75 },
                                    ],
                                },
                                SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(270, 630, 12), defs),
                            ),
                        },
                        clipPath: {
                            id: `clip4-${id}`,
                            defsElement: (
                                <clipPath id={`clip4-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(MathUtils.getIntermediateValues(270, 630, 12), 180),
                                        defs,
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                ],
            },

            snakeDesync_3x: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                        { value: defs.getColors().primary },
                                    ],
                                },
                                SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                            ),
                        },
                        clipPath: {
                            id: `clip1-${id}`,
                            defsElement: (
                                <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(MathUtils.getIntermediateValues(0, 360, 12), 180),
                                        defs,
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient2-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient2-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                        { value: defs.getColors().secondary },
                                    ],
                                },
                                SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(180, 540, 12), defs),
                            ),
                        },
                        clipPath: {
                            id: `clip2-${id}`,
                            defsElement: (
                                <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(MathUtils.getIntermediateValues(180, 540, 12), 180),
                                        defs,
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient3-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient3-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().tertiary} r g b / 0)` },
                                        { value: defs.getColors().tertiary },
                                    ],
                                },
                                SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), {
                                    ...defs,
                                    getAnimationDurationMs: () => defs.getAnimationDurationMs() * 0.5,
                                }),
                            ),
                        },
                        clipPath: {
                            id: `clip3-${id}`,
                            defsElement: (
                                <clipPath id={`clip3-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(MathUtils.getIntermediateValues(0, 360, 12), 180),
                                        {
                                            ...defs,
                                            getAnimationDurationMs: () => defs.getAnimationDurationMs() * 0.5,
                                        },
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                ],
            },

            snakeWait_1: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                        { value: defs.getColors().primary },
                                    ],
                                },
                                SVGAnimationUtils.Linear.rotate(
                                    [
                                        ...MathUtils.getIntermediateValues(90, 270, 12),
                                        ...MathUtils.getIntermediateValues(270, 270, 12),
                                        ...MathUtils.getIntermediateValues(270, 450, 12),
                                        ...MathUtils.getIntermediateValues(450, 450, 12),
                                    ],
                                    defs,
                                ),
                            ),
                        },
                        clipPath: {
                            id: `clip1-${id}`,
                            defsElement: (
                                <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(
                                            [
                                                ...MathUtils.getIntermediateValues(90, 270, 12),
                                                ...MathUtils.getIntermediateValues(270, 270, 12),
                                                ...MathUtils.getIntermediateValues(270, 450, 12),
                                                ...MathUtils.getIntermediateValues(450, 450, 12),
                                            ],
                                            180,
                                        ),
                                        defs,
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                ],
            },

            snakeWait_3x1s: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                        { value: defs.getColors().primary },
                                    ],
                                    angle: 90,
                                },
                                SVGAnimationUtils.Linear.rotate(
                                    [
                                        ...MathUtils.getIntermediateValues(90, 450, 12),
                                        ...MathUtils.getIntermediateValues(450, 450, 12),
                                        ...MathUtils.getIntermediateValues(450, 450, 12),
                                    ],
                                    defs,
                                ),
                            ),
                        },
                        clipPath: {
                            id: `clip1-${id}`,
                            defsElement: (
                                <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(
                                            [
                                                ...MathUtils.getIntermediateValues(90, 450, 12),
                                                ...MathUtils.getIntermediateValues(450, 450, 12),
                                                ...MathUtils.getIntermediateValues(450, 450, 12),
                                            ],
                                            180,
                                        ),
                                        defs,
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient2-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient2-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                        { value: defs.getColors().secondary },
                                    ],
                                    angle: 90,
                                },
                                SVGAnimationUtils.Linear.rotate(
                                    [
                                        ...MathUtils.getIntermediateValues(90, 450, 12),
                                        ...MathUtils.getIntermediateValues(450, 450, 12),
                                    ],
                                    defs,
                                ),
                            ),
                        },
                        clipPath: {
                            id: `clip2-${id}`,
                            defsElement: (
                                <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(
                                            [
                                                ...MathUtils.getIntermediateValues(90, 450, 12),
                                                ...MathUtils.getIntermediateValues(450, 450, 12),
                                            ],
                                            180,
                                        ),
                                        defs,
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient3-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient3-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().tertiary} r g b / 0)` },
                                        { value: defs.getColors().tertiary },
                                    ],
                                    angle: 90,
                                },
                                SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(90, 450, 12), defs),
                            ),
                        },
                        clipPath: {
                            id: `clip3-${id}`,
                            defsElement: (
                                <clipPath id={`clip3-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(MathUtils.getIntermediateValues(90, 450, 12), 180),
                                        defs,
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                ],
            },

            snakeWait_3x2s: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                        { value: defs.getColors().primary },
                                    ],
                                    angle: 90,
                                },
                                SVGAnimationUtils.Linear.rotate(
                                    [
                                        ...MathUtils.getIntermediateValues(90, 270, 12),
                                        ...MathUtils.getIntermediateValues(270, 270, 12),
                                        ...MathUtils.getIntermediateValues(270, 270, 12),
                                        ...MathUtils.getIntermediateValues(270, 450, 12),
                                        ...MathUtils.getIntermediateValues(450, 450, 12),
                                        ...MathUtils.getIntermediateValues(450, 450, 12),
                                    ],
                                    defs,
                                ),
                            ),
                        },
                        clipPath: {
                            id: `clip1-${id}`,
                            defsElement: (
                                <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(
                                            [
                                                ...MathUtils.getIntermediateValues(90, 270, 12),
                                                ...MathUtils.getIntermediateValues(270, 270, 12),
                                                ...MathUtils.getIntermediateValues(270, 270, 12),
                                                ...MathUtils.getIntermediateValues(270, 450, 12),
                                                ...MathUtils.getIntermediateValues(450, 450, 12),
                                                ...MathUtils.getIntermediateValues(450, 450, 12),
                                            ],
                                            180,
                                        ),
                                        defs,
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient2-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient2-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                        { value: defs.getColors().secondary },
                                    ],
                                    angle: 90,
                                },
                                SVGAnimationUtils.Linear.rotate(
                                    [
                                        ...MathUtils.getIntermediateValues(90, 270, 12),
                                        ...MathUtils.getIntermediateValues(270, 270, 12),
                                        ...MathUtils.getIntermediateValues(270, 450, 12),
                                        ...MathUtils.getIntermediateValues(450, 450, 12),
                                    ],
                                    defs,
                                ),
                            ),
                        },
                        clipPath: {
                            id: `clip2-${id}`,
                            defsElement: (
                                <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(
                                            [
                                                ...MathUtils.getIntermediateValues(90, 270, 12),
                                                ...MathUtils.getIntermediateValues(270, 270, 12),
                                                ...MathUtils.getIntermediateValues(270, 450, 12),
                                                ...MathUtils.getIntermediateValues(450, 450, 12),
                                            ],
                                            180,
                                        ),
                                        defs,
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient3-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient3-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().tertiary} r g b / 0)` },
                                        { value: defs.getColors().tertiary },
                                    ],
                                    angle: 90,
                                },
                                SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(90, 450, 12), defs),
                            ),
                        },
                        clipPath: {
                            id: `clip3-${id}`,
                            defsElement: (
                                <clipPath id={`clip3-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(MathUtils.getIntermediateValues(90, 450, 12), 180),
                                        defs,
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                ],
            },

            // SWEEP

            sweep_1: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                        { value: defs.getColors().primary, stop: 50 },
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)`, stop: 50 },
                                    ],
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [-1.25, 1.25], defs),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                ],
            },

            sweep_1v1: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                        { value: defs.getColors().primary, stop: 50 },
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)`, stop: 50 },
                                    ],
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [-1.25, 1.25], defs),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient2-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient2-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                        { value: defs.getColors().secondary, stop: 50 },
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)`, stop: 50 },
                                    ],
                                    angle: 180,
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [1.25, -1.25], defs),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                ],
            },

            sweepDiagonal_1: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                        { value: defs.getColors().primary, stop: 50 },
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)`, stop: 50 },
                                    ],
                                    angle: 45,
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepDiagonal(x1, y1, x2, y2, 45, [-1.25, 1.25], defs),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                ],
            },

            sweepDiagonal_1v1: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                        { value: defs.getColors().primary, stop: 50 },
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)`, stop: 50 },
                                    ],
                                    angle: 45,
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepDiagonal(x1, y1, x2, y2, 45, [-1.25, 1.25], defs),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient2-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient2-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                        { value: defs.getColors().secondary, stop: 50 },
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)`, stop: 50 },
                                    ],
                                    angle: 225,
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepDiagonal(x1, y1, x2, y2, 225, [-1.25, 1.25], defs),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                ],
            },

            sweepDiagonalDesync_4x: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                        { value: defs.getColors().primary, stop: 50 },
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)`, stop: 50 },
                                    ],
                                    angle: 45,
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepDiagonal(
                                        x1,
                                        y1,
                                        x2,
                                        y2,
                                        45,
                                        [-1.25, 0, 1.25, 1.25, 1.25, 1.25],
                                        defs,
                                    ),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient2-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient2-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                        { value: defs.getColors().secondary, stop: 50 },
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)`, stop: 50 },
                                    ],
                                    angle: 225,
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepDiagonal(
                                        x1,
                                        y1,
                                        x2,
                                        y2,
                                        225,
                                        [-1.25, -1.25, 0, 1.25, 1.25, 1.25],
                                        defs,
                                    ),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient3-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient3-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)` },
                                        { value: defs.getColors().primary, stop: 50 },
                                        { value: `rgb(from ${defs.getColors().primary} r g b / 0)`, stop: 50 },
                                    ],
                                    angle: 135,
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepDiagonal(
                                        x1,
                                        y1,
                                        x2,
                                        y2,
                                        135,
                                        [-1.25, -1.25, -1.25, 0, 1.25, 1.25],
                                        defs,
                                    ),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient4-${id}`,
                            defsElement: SVGGradientDefsUtils.getLinearGradient(
                                {
                                    id: `gradient4-${id}`,
                                    colors: [
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)` },
                                        { value: defs.getColors().secondary, stop: 50 },
                                        { value: `rgb(from ${defs.getColors().secondary} r g b / 0)`, stop: 50 },
                                    ],
                                    angle: 315,
                                },
                                (x1, y1, x2, y2) =>
                                    SVGAnimationUtils.Linear.sweepDiagonal(
                                        x1,
                                        y1,
                                        x2,
                                        y2,
                                        315,
                                        [-1.25, -1.25, -1.25, -1.25, 0, 1.25],
                                        defs,
                                    ),
                            ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                ],
            },
        } as const satisfies Record<string, ConfigDefs>;
    }
}
