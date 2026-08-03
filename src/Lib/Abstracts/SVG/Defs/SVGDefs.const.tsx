import { MathUtils, ObjectUtils, RandomUtils, ShapeConst, ShapeUtils, type Size2d } from "@thewaver/ss-utils";

import type { InteractionFlags } from "../../Interaction/Interaction.types";
import type { SVGAnimationDefs } from "./Animation/SVGAnimationDefs.types";
import { SVGAnimationUtils } from "./Animation/SVGAnimationDefs.utils";
import { SVGFilterDefsFactory } from "./Filter/SVGFilterDefs.factory";
import { SVGGradientDefsUtils } from "./Gradient/SVGGradientDefs.utils";
import { SVGPatternDefsUtils } from "./Pattern/SVGPatternDefs.utils";
import type { SVGDefs } from "./SVGDefs.types";

export namespace SVGDefsSamples {
    export type ColorDefs = { [K in "primary" | "secondary" | "tertiary" | "background"]: string };

    const getBaseBlur = (
        id: string,
        defs: {
            size: Size2d;
            blurWidth?: number;
        },
    ) =>
        defs.blurWidth
            ? {
                  id: `border-blur-filter-${id}`,
                  getDefsElement: () =>
                      new SVGFilterDefsFactory(`border-blur-filter-${id}`)
                          .addGaussianBlurFilter({ stdDeviation: defs.blurWidth! })
                          .getFilterPrimitives({ method: "isolate", elementSize: defs.size }),
              }
            : undefined;

    export namespace Iteration {
        export type ConfigDefs = {
            getDefs: (animationDurationMs: number) => Pick<SVGAnimationDefs, "animationIterationPatterns">;
        };

        export const SAMPLE_CONFIGS = {
            constant: {
                getDefs: () => ({}),
            },
            repeat1_1: {
                getDefs: (animationDurationMs) => ({
                    animationIterationPatterns: [
                        {
                            count: 1,
                            nextIndex: 1,
                        },
                        {
                            beginDelayMs: animationDurationMs,
                            count: 1,
                            nextIndex: 1,
                        },
                    ],
                }),
            },
            repeat2_1: {
                getDefs: (animationDurationMs) => ({
                    animationIterationPatterns: [
                        {
                            count: 2,
                            nextIndex: 1,
                        },
                        {
                            beginDelayMs: animationDurationMs,
                            count: 2,
                            nextIndex: 1,
                        },
                    ],
                }),
            },
            repeat3_3: {
                getDefs: (animationDurationMs) => ({
                    animationIterationPatterns: [
                        {
                            count: 3,
                            nextIndex: 1,
                        },
                        {
                            beginDelayMs: animationDurationMs * 3,
                            count: 3,
                            nextIndex: 1,
                        },
                    ],
                }),
            },
        } as const satisfies Record<string, ConfigDefs>;
    }

    export namespace Pattern {
        const DEBUG_SEAMS = false;

        type ElementDefs = SVGAnimationDefs & {
            size: Size2d;
            cellSize: Size2d;
            colors: ColorDefs;
            blurWidth?: number;
        };

        export type ConfigDefs = {
            getSVGDefs: (id: string, interactionFlags: InteractionFlags | undefined, defs: ElementDefs) => SVGDefs[];
        };

        const getBaseBackgroundColor = (defs: { colors: ColorDefs }) =>
            `hsl(from ${defs.colors.background} h s calc(l * 1.5) / 25%)`;

        const getRandomValuesWithSplitControl = (
            mutableSplitValuesCache: Record<string, string>,
            index: { row: number; col: number },
            cellCount: { rows: number; cols: number },
            isSplit: boolean,
        ) => {
            let values = RandomUtils.get01ValueString(8);

            if (isSplit) {
                if (index.col === cellCount.cols - 1) {
                    values = mutableSplitValuesCache[`row${index.row}`] ?? values;
                }
                if (index.row === cellCount.rows - 1) {
                    values = mutableSplitValuesCache[`col${index.col}`] ?? values;
                }
                if (index.col === 0) {
                    mutableSplitValuesCache[`row${index.row}`] = values;
                }
                if (index.row === 0) {
                    mutableSplitValuesCache[`col${index.col}`] = values;
                }
            }

            return values;
        };

        // GENERICS

        const circle = (variant: "grid" | "drop" | "shift"): ConfigDefs => ({
            getSVGDefs: (id, __, defs) => {
                const splitValuesCache: Record<string, string> = {};
                const cellSize = defs.cellSize;
                const cellCount = { rows: 8, cols: 8 };
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
                            getDefsElement: () =>
                                cb(`pattern1-${id}`, cellCount, cellSize, (cellId, index, cellCount, isSplit) => {
                                    const isEven = MathUtils.isEven(index.col + index.row);
                                    const values = getRandomValuesWithSplitControl(
                                        splitValuesCache,
                                        index,
                                        cellCount,
                                        isSplit,
                                    );

                                    return (
                                        <circle
                                            id={cellId}
                                            r={r}
                                            cx={cellSize.width * 0.5}
                                            cy={cellSize.height * 0.5}
                                            fill={
                                                DEBUG_SEAMS && isSplit
                                                    ? defs.colors.tertiary
                                                    : isEven
                                                      ? defs.colors.primary
                                                      : defs.colors.secondary
                                            }
                                        >
                                            <animate
                                                attributeName="r"
                                                values={values
                                                    .split(";")
                                                    .map((v) => `${Number(v) * r}`)
                                                    .join(";")}
                                                dur={`${defs.animationDurationMs * 4}ms`}
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
                const splitValuesCache: Record<string, string> = {};
                const cellSize = defs.cellSize;
                const cellCount = { rows: 8, cols: 8 };
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
                            getDefsElement: () => (
                                <>
                                    {lozenge}
                                    {cb(`pattern1-${id}`, cellCount, cellSize, (cellId, index, cellCount, isSplit) => {
                                        const isEven = MathUtils.isEven(index.row);
                                        const shapeId = `${id}-lozenge`;
                                        const values = getRandomValuesWithSplitControl(
                                            splitValuesCache,
                                            index,
                                            cellCount,
                                            isSplit,
                                        );

                                        return (
                                            <use
                                                id={cellId}
                                                href={`#${shapeId}`}
                                                fill={
                                                    DEBUG_SEAMS && isSplit
                                                        ? defs.colors.tertiary
                                                        : isEven
                                                          ? defs.colors.primary
                                                          : defs.colors.secondary
                                                }
                                            >
                                                <animate
                                                    attributeName="fill-opacity"
                                                    values={values}
                                                    dur={`${defs.animationDurationMs * 4}ms`}
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
                const splitValuesCache: Record<string, string> = {};
                const cellSize = defs.cellSize;
                const cellCount = { rows: 8, cols: 8 };

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
                            getDefsElement: () => (
                                <>
                                    {lozenge}
                                    {SVGPatternDefsUtils.getDiagonalPattern(
                                        `pattern1-${id}`,
                                        cellCount,
                                        cellSize,
                                        (cellId, index, cellCount, isSplit) => {
                                            const isEven = MathUtils.isEven(index.row);
                                            const shapeId = `${id}-lozenge`;
                                            const values = getRandomValuesWithSplitControl(
                                                splitValuesCache,
                                                index,
                                                cellCount,
                                                isSplit,
                                            );

                                            return (
                                                <use
                                                    id={cellId}
                                                    href={`#${shapeId}`}
                                                    fill={
                                                        DEBUG_SEAMS && isSplit
                                                            ? defs.colors.tertiary
                                                            : isEven
                                                              ? defs.colors.primary
                                                              : defs.colors.secondary
                                                    }
                                                >
                                                    <animate
                                                        attributeName="fill-opacity"
                                                        values={values}
                                                        dur={`${defs.animationDurationMs * 4}ms`}
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
                const splitValuesCache: Record<string, string> = {};
                const cellSize = defs.cellSize;
                const cellCount = { rows: 8, cols: 8 };

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
                            getDefsElement: () => (
                                <>
                                    {upTriangle}
                                    {downTriangle}
                                    {SVGPatternDefsUtils.getTrianglePattern(
                                        `pattern1-${id}`,
                                        cellCount,
                                        cellSize,
                                        (cellId, index, cellCount, isSplit) => {
                                            const isEven = MathUtils.isEven(index.col + index.row);
                                            const shapeId = isEven ? `${id}-triangle-up` : `${id}-triangle-down`;
                                            const values = getRandomValuesWithSplitControl(
                                                splitValuesCache,
                                                index,
                                                cellCount,
                                                isSplit,
                                            );

                                            return (
                                                <use
                                                    id={cellId}
                                                    href={`#${shapeId}`}
                                                    fill={
                                                        DEBUG_SEAMS && isSplit
                                                            ? defs.colors.tertiary
                                                            : isEven
                                                              ? defs.colors.primary
                                                              : defs.colors.secondary
                                                    }
                                                >
                                                    <animate
                                                        attributeName="fill-opacity"
                                                        values={values}
                                                        dur={`${defs.animationDurationMs * 4}ms`}
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
                        getDefsElement: () =>
                            SVGGradientDefsUtils.getRadialGradient(
                                {
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: defs.colors.primary },
                                        { value: defs.colors.primary },
                                        { value: defs.colors.secondary },
                                        { value: defs.colors.primary },
                                    ],
                                },
                                SVGAnimationUtils.Radial.grow([0, 2], {
                                    ...defs,
                                    animationDurationMs: defs.animationDurationMs * 0.5,
                                }),
                            ),
                    },
                    clipPath: {
                        id: `clip1-${id}`,
                        getDefsElement: () => (
                            <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                {SVGAnimationUtils.Path.getRotatingWedges(
                                    Math.max(defs.cellSize.width, defs.cellSize.height),
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
            size: Size2d;
            colors: ColorDefs;
            blurWidth?: number;
        };

        export type ConfigDefs = {
            getSVGDefs: (id: string, interactionFlags: InteractionFlags | undefined, defs: ElementDefs) => SVGDefs[];
        };

        const getBaseBorderColor = (defs: { colors: ColorDefs }) =>
            `hsl(from ${defs.colors.background} h s calc(l * 1.5) / 50%)`;

        const offsetDiagonally = (v: number, angle: number) => {
            const rad = (angle * Math.PI) / 180;

            return { x: v * Math.cos(rad), y: v * Math.sin(rad) };
        };

        export const SAMPLE_CONFIGS = {
            plain: {
                getSVGDefs: (_, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                ],
            },

            // ELASTIC

            elastic_circle_3: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient({
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: defs.colors.primary },
                                        { value: defs.colors.secondary },
                                        { value: defs.colors.tertiary },
                                    ],
                                    angle: 90,
                                }),
                        },
                        clipPath: {
                            id: `clip1-${id}`,
                            getDefsElement: () => (
                                <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(
                                            "stretch",
                                            [
                                                ...MathUtils.getIntermediateValues(90, 90, 12),
                                                ...MathUtils.getIntermediateValues(90, 450, 12),
                                            ],
                                            [
                                                ...MathUtils.getIntermediateValues(0, 360, 12),
                                                ...MathUtils.getIntermediateValues(360, 0, 12),
                                            ],
                                        ),
                                        defs,
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                ],
            },

            elastic_semicircle_3: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient({
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: defs.colors.primary },
                                        { value: defs.colors.secondary },
                                        { value: defs.colors.tertiary },
                                    ],
                                    angle: 90,
                                }),
                        },
                        clipPath: {
                            id: `clip1-${id}`,
                            getDefsElement: () => (
                                <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(
                                            "stretch",
                                            [
                                                ...MathUtils.getIntermediateValues(180, 90, 12),
                                                ...MathUtils.getIntermediateValues(90, 180, 12),
                                            ],
                                            [
                                                ...MathUtils.getIntermediateValues(0, 180, 12),
                                                ...MathUtils.getIntermediateValues(180, 0, 12),
                                            ],
                                        ),
                                        defs,
                                    )}
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(
                                            "stretch",
                                            [
                                                ...MathUtils.getIntermediateValues(360, 270, 12),
                                                ...MathUtils.getIntermediateValues(270, 360, 12),
                                            ],
                                            [
                                                ...MathUtils.getIntermediateValues(0, 180, 12),
                                                ...MathUtils.getIntermediateValues(180, 0, 12),
                                            ],
                                        ),
                                        defs,
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                ],
            },

            elastic_inter_semicircle_3: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient({
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: defs.colors.primary },
                                        { value: defs.colors.secondary },
                                        { value: defs.colors.tertiary },
                                    ],
                                    angle: 90,
                                }),
                        },
                        clipPath: {
                            id: `clip1-${id}`,
                            getDefsElement: () => (
                                <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(
                                            "stretch",
                                            [
                                                ...MathUtils.getIntermediateValues(0, 0, 12),
                                                ...MathUtils.getIntermediateValues(0, 180, 12),
                                                ...MathUtils.getIntermediateValues(180, 180, 12),
                                                ...MathUtils.getIntermediateValues(180, 360, 12),
                                            ],
                                            [
                                                ...MathUtils.getIntermediateValues(0, 180, 12),
                                                ...MathUtils.getIntermediateValues(180, 0, 12),
                                                ...MathUtils.getIntermediateValues(0, 180, 12),
                                                ...MathUtils.getIntermediateValues(180, 0, 12),
                                            ],
                                        ),
                                        defs,
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                ],
            },

            elastic_drip_3: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient({
                                    id: `gradient1-${id}`,
                                    colors: [
                                        { value: defs.colors.primary },
                                        { value: defs.colors.secondary },
                                        { value: defs.colors.tertiary },
                                    ],
                                    angle: 90,
                                }),
                        },
                        clipPath: {
                            id: `clip1-${id}`,
                            getDefsElement: () => (
                                <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(
                                            "stretch",
                                            [
                                                ...MathUtils.getIntermediateValues(450, 270, 12),
                                                ...MathUtils.getIntermediateValues(90, 270, 12),
                                            ],
                                            [
                                                ...MathUtils.getIntermediateValues(0, 360, 12),
                                                ...MathUtils.getIntermediateValues(360, 0, 12),
                                            ],
                                        ),
                                        defs,
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                ],
            },

            // FLOW

            flow_2s: {
                getSVGDefs: (id, __, defs) => [
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.primary },
                                        ],
                                        spreadKind: "banded",
                                        scale: { width: 2, height: 1 },
                                        offset: { x: 0.5, y: 0 },
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [0, -1], defs),
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
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.tertiary },
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.tertiary },
                                            { value: defs.colors.primary },
                                        ],
                                        scale: { width: 2, height: 1 },
                                        offset: { x: 0.5, y: 0 },
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [0, -1], defs),
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
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.tertiary },
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.tertiary },
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.tertiary },
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.tertiary },
                                            { value: defs.colors.primary },
                                        ],
                                        spreadKind: "banded",
                                        scale: { width: 2, height: 1 },
                                        offset: { x: 0.5, y: 0 },
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [0, -1], defs),
                                ),
                        },
                    },
                ],
            },

            flow_diag_2s: {
                getSVGDefs: (id, __, defs) => [
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.primary },
                                        ],
                                        spreadKind: "banded",
                                        angle: MathUtils.unwarpAngle(45, defs.size),
                                        scale: { width: 2, height: 2 },
                                        offset: offsetDiagonally(0.25, MathUtils.unwarpAngle(45, defs.size)),
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepDiagonal(
                                            x1,
                                            y1,
                                            x2,
                                            y2,
                                            MathUtils.unwarpAngle(45, defs.size),
                                            [0, -0.5],
                                            defs,
                                        ),
                                ),
                        },
                    },
                ],
            },

            flow_diag_3: {
                getSVGDefs: (id, __, defs) => [
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.tertiary },
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.tertiary },
                                            { value: defs.colors.primary },
                                        ],
                                        angle: MathUtils.unwarpAngle(45, defs.size),
                                        scale: { width: 2, height: 2 },
                                        offset: offsetDiagonally(0.5, MathUtils.unwarpAngle(45, defs.size)),
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepDiagonal(
                                            x1,
                                            y1,
                                            x2,
                                            y2,
                                            MathUtils.unwarpAngle(45, defs.size),
                                            [0, -1],
                                            defs,
                                        ),
                                ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                ],
            },

            flow_diag_3s: {
                getSVGDefs: (id, __, defs) => [
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.tertiary },
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.tertiary },
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.tertiary },
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.tertiary },
                                            { value: defs.colors.primary },
                                        ],
                                        spreadKind: "banded",
                                        angle: MathUtils.unwarpAngle(45, defs.size),
                                        scale: { width: 2, height: 2 },
                                        offset: offsetDiagonally(0.25, MathUtils.unwarpAngle(45, defs.size)),
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepDiagonal(
                                            x1,
                                            y1,
                                            x2,
                                            y2,
                                            MathUtils.unwarpAngle(45, defs.size),
                                            [0, -0.5],
                                            defs,
                                        ),
                                ),
                        },
                    },
                ],
            },

            // HUE

            hue_1: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [{ value: defs.colors.primary }],
                                        angle: 90,
                                    },
                                    SVGAnimationUtils.Gradient.cycleSmoothColors(
                                        `gradient1-${id}`,
                                        [
                                            [
                                                defs.colors.primary,
                                                defs.colors.secondary,
                                                defs.colors.tertiary,
                                                defs.colors.primary,
                                            ],
                                        ],
                                        defs,
                                    ),
                                ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                ],
            },

            hue_pulse_2: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [{ value: defs.colors.primary }],
                                        angle: 90,
                                    },
                                    SVGAnimationUtils.Gradient.cycleSmoothColors(
                                        `gradient1-${id}`,
                                        [
                                            [
                                                defs.colors.primary,
                                                defs.colors.secondary,
                                                defs.colors.primary,
                                                defs.colors.secondary,
                                                defs.colors.primary,
                                            ],
                                        ],
                                        defs,
                                    ),
                                ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                ],
            },

            hue_diag_inter_2: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [{ value: defs.colors.primary }, { value: defs.colors.secondary }],
                                        angle: 45,
                                    },
                                    SVGAnimationUtils.Gradient.cycleSmoothColors(
                                        `gradient1-${id}`,
                                        [
                                            [
                                                defs.colors.primary,
                                                defs.colors.secondary,
                                                defs.colors.secondary,
                                                defs.colors.primary,
                                                defs.colors.primary,
                                            ],
                                            [
                                                defs.colors.primary,
                                                defs.colors.primary,
                                                defs.colors.tertiary,
                                                defs.colors.tertiary,
                                                defs.colors.primary,
                                            ],
                                        ],
                                        defs,
                                    ),
                                ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                ],
            },

            hue_rot_3: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: defs.colors.primary },
                                            { value: defs.colors.secondary },
                                            { value: defs.colors.tertiary },
                                        ],
                                        angle: 0,
                                    },
                                    <>
                                        {SVGAnimationUtils.Linear.rotate(
                                            MathUtils.getIntermediateValues(0, 360, 12),
                                            defs,
                                        )}
                                        {SVGAnimationUtils.Gradient.cycleSmoothColors(
                                            `gradient1-${id}`,
                                            [
                                                [
                                                    defs.colors.primary,
                                                    defs.colors.secondary,
                                                    defs.colors.tertiary,
                                                    defs.colors.primary,
                                                ],
                                                [
                                                    defs.colors.secondary,
                                                    defs.colors.tertiary,
                                                    defs.colors.primary,
                                                    defs.colors.secondary,
                                                ],
                                                [
                                                    defs.colors.tertiary,
                                                    defs.colors.primary,
                                                    defs.colors.secondary,
                                                    defs.colors.tertiary,
                                                ],
                                            ],
                                            defs,
                                        )}
                                    </>,
                                ),
                        },
                        filter: getBaseBlur(id, defs),
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
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: defs.colors.primary },
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                        ],
                                        offset: { x: -1, y: 0 },
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [0, 2, 0], defs),
                                ),
                        },
                        filter: getBaseBlur(id, defs),
                        blend: true,
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient2-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient2-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                                            { value: defs.colors.secondary },
                                        ],
                                        offset: { x: 1, y: 0 },
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [0, -2, 0], defs),
                                ),
                        },
                        filter: getBaseBlur(id, defs),
                        blend: true,
                    },
                ],
            },

            merge_diag_1v1: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: defs.colors.primary },
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                        ],
                                        angle: 45,
                                        offset: offsetDiagonally(-1.25, 45),
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepDiagonal(x1, y1, x2, y2, 45, [0, 2.5, 0], defs),
                                ),
                        },
                        filter: getBaseBlur(id, defs),
                        blend: true,
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient2-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient2-${id}`,
                                        colors: [
                                            { value: defs.colors.secondary },
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                                        ],
                                        angle: 225,
                                        offset: offsetDiagonally(-1.25, 225),
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepDiagonal(x1, y1, x2, y2, 225, [0, 2.5, 0], defs),
                                ),
                        },
                        filter: getBaseBlur(id, defs),
                        blend: true,
                    },
                ],
            },

            merge_diag_async_4: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: defs.colors.primary },
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                        ],
                                        angle: 45,
                                        offset: offsetDiagonally(-1.25, 45),
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepDiagonal(
                                            x1,
                                            y1,
                                            x2,
                                            y2,
                                            45,
                                            [0, 1.25, 2.5, 1.25, 0, 0, 0, 0],
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
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient2-${id}`,
                                        colors: [
                                            { value: defs.colors.secondary },
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                                        ],
                                        angle: 135,
                                        offset: offsetDiagonally(-1.25, 135),
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepDiagonal(
                                            x1,
                                            y1,
                                            x2,
                                            y2,
                                            135,
                                            [0, 0, 0, 1.25, 2.5, 1.25, 0, 0],
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
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient3-${id}`,
                                        colors: [
                                            { value: defs.colors.primary },
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                        ],
                                        angle: 225,
                                        offset: offsetDiagonally(-1.25, 225),
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepDiagonal(
                                            x1,
                                            y1,
                                            x2,
                                            y2,
                                            225,
                                            [0, 0, 1.25, 2.5, 1.25, 0, 0, 0],
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
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient4-${id}`,
                                        colors: [
                                            { value: defs.colors.secondary },
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                                        ],
                                        angle: 315,
                                        offset: offsetDiagonally(-1.25, 315),
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepDiagonal(
                                            x1,
                                            y1,
                                            x2,
                                            y2,
                                            315,
                                            [0, 0, 0, 0, 1.25, 2.5, 1.25, 0],
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
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                            { value: defs.colors.primary },
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
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
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                            { value: defs.colors.primary },
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
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
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient2-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                                            { value: defs.colors.secondary },
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                                        ],
                                        angle: 360,
                                    },
                                    SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(360, 0, 12), defs),
                                ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                ],
            },

            orbit_async_2v1: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [{ value: defs.colors.tertiary }, { value: defs.colors.secondary }],
                                    },
                                    SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                                ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient2-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient2-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                            { value: defs.colors.primary },
                                        ],
                                        angle: 360,
                                    },
                                    SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(360, 0, 12), defs),
                                ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                ],
            },

            orbit_async_3: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                            { value: defs.colors.primary },
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
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
                            id: `gradient2-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient2-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                                            { value: defs.colors.secondary },
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                                        ],
                                    },
                                    SVGAnimationUtils.Linear.rotate(
                                        [
                                            ...MathUtils.getIntermediateValues(0, 360, 12),
                                            ...MathUtils.getIntermediateValues(0, 360, 12),
                                        ],
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
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient3-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.tertiary} r g b / 0)` },
                                            { value: defs.colors.tertiary },
                                            { value: `rgb(from ${defs.colors.tertiary} r g b / 0)` },
                                        ],
                                    },
                                    SVGAnimationUtils.Linear.rotate(
                                        [
                                            ...MathUtils.getIntermediateValues(0, 360, 12),
                                            ...MathUtils.getIntermediateValues(0, 360, 12),
                                            ...MathUtils.getIntermediateValues(0, 360, 12),
                                        ],
                                        defs,
                                    ),
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
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                            { value: defs.colors.primary },
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                        ],
                                        offset: { x: -1, y: 0 },
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [0, 2, 0], defs),
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
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                            { value: defs.colors.primary },
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                        ],
                                        offset: { x: -1, y: 0 },
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [0, 2, 0], defs),
                                ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient2-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient2-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                                            { value: defs.colors.secondary },
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                                        ],
                                        angle: 90,
                                        offset: { x: 0, y: -1 },
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepOrthogonal("y", y1, y2, [0, 2, 0], defs),
                                ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                ],
            },

            scan_diag_1: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                            { value: defs.colors.primary },
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                        ],
                                        angle: 45,
                                        offset: offsetDiagonally(-1.25, 45),
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepDiagonal(x1, y1, x2, y2, 45, [0, 2.5, 0], defs),
                                ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                ],
            },

            scan_diag_1v1: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                            { value: defs.colors.primary },
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                        ],
                                        angle: 45,
                                        offset: offsetDiagonally(-1.25, 45),
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepDiagonal(x1, y1, x2, y2, 45, [0, 2.5, 0], defs),
                                ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient2-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient2-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                                            { value: defs.colors.secondary },
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                                        ],
                                        angle: 135,
                                        offset: offsetDiagonally(-1.25, 135),
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepDiagonal(x1, y1, x2, y2, 135, [0, 2.5, 0], defs),
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
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                            { value: defs.colors.primary },
                                        ],
                                        angle: 90,
                                    },
                                    SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(90, 450, 12), defs),
                                ),
                        },
                        clipPath: {
                            id: `clip1-${id}`,
                            getDefsElement: () => (
                                <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(
                                            "stretch",
                                            MathUtils.getIntermediateValues(90, 450, 12),
                                            [180],
                                        ),
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
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                            { value: defs.colors.primary },
                                        ],
                                        angle: 90,
                                    },
                                    SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(90, 450, 12), defs),
                                ),
                        },
                        clipPath: {
                            id: `clip1-${id}`,
                            getDefsElement: () => (
                                <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(
                                            "stretch",
                                            MathUtils.getIntermediateValues(90, 450, 12),
                                            [180],
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
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient2-${id}`,
                                        colors: [
                                            { value: defs.colors.secondary },
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                                        ],
                                        angle: 630,
                                    },
                                    SVGAnimationUtils.Linear.rotate(
                                        MathUtils.getIntermediateValues(630, 270, 12),
                                        defs,
                                    ),
                                ),
                        },
                        clipPath: {
                            id: `clip2-${id}`,
                            getDefsElement: () => (
                                <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(
                                            "stretch",
                                            MathUtils.getIntermediateValues(630, 270, 12),
                                            [180],
                                        ),
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
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                            { value: defs.colors.primary },
                                        ],
                                        angle: 90,
                                    },
                                    SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(90, 450, 12), defs),
                                ),
                        },
                        clipPath: {
                            id: `clip1-${id}`,
                            getDefsElement: () => (
                                <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(
                                            "stretch",
                                            MathUtils.getIntermediateValues(90, 450, 12),
                                            [180],
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
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient2-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                                            { value: defs.colors.secondary },
                                        ],
                                        angle: 270,
                                    },
                                    SVGAnimationUtils.Linear.rotate(
                                        MathUtils.getIntermediateValues(270, 630, 12),
                                        defs,
                                    ),
                                ),
                        },
                        clipPath: {
                            id: `clip2-${id}`,
                            getDefsElement: () => (
                                <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(
                                            "stretch",
                                            MathUtils.getIntermediateValues(270, 630, 12),
                                            [180],
                                        ),
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
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                                            { value: defs.colors.secondary, stop: 50 },
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)`, stop: 50 },
                                        ],
                                    },
                                    SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(0, 360, 12), defs),
                                ),
                        },
                        clipPath: {
                            id: `clip1-${id}`,
                            getDefsElement: () => (
                                <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(
                                            "stretch",
                                            MathUtils.getIntermediateValues(0, 360, 12),
                                            [180],
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
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient2-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                            { value: defs.colors.primary, stop: 50 },
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)`, stop: 50 },
                                        ],
                                        angle: 90,
                                    },
                                    SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(90, 450, 12), defs),
                                ),
                        },
                        clipPath: {
                            id: `clip2-${id}`,
                            getDefsElement: () => (
                                <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(
                                            "stretch",
                                            MathUtils.getIntermediateValues(90, 450, 12),
                                            [180],
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
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient3-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                                            { value: defs.colors.secondary, stop: 50 },
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)`, stop: 50 },
                                        ],
                                        angle: 180,
                                    },
                                    SVGAnimationUtils.Linear.rotate(
                                        MathUtils.getIntermediateValues(180, 540, 12),
                                        defs,
                                    ),
                                ),
                        },
                        clipPath: {
                            id: `clip3-${id}`,
                            getDefsElement: () => (
                                <clipPath id={`clip3-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(
                                            "stretch",
                                            MathUtils.getIntermediateValues(180, 540, 12),
                                            [180],
                                        ),
                                        defs,
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient4-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient4-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                            { value: defs.colors.primary, stop: 50 },
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)`, stop: 50 },
                                        ],
                                        angle: 270,
                                    },
                                    SVGAnimationUtils.Linear.rotate(
                                        MathUtils.getIntermediateValues(270, 630, 12),
                                        defs,
                                    ),
                                ),
                        },
                        clipPath: {
                            id: `clip4-${id}`,
                            getDefsElement: () => (
                                <clipPath id={`clip4-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(
                                            "stretch",
                                            MathUtils.getIntermediateValues(270, 630, 12),
                                            [180],
                                        ),
                                        defs,
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                ],
            },

            snake_inter_2: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                            { value: defs.colors.primary },
                                        ],
                                        angle: 90,
                                    },
                                    SVGAnimationUtils.Linear.rotate(
                                        [
                                            ...MathUtils.getIntermediateValues(90, 90, 12),
                                            ...MathUtils.getIntermediateValues(90, 90, 12),
                                            ...MathUtils.getIntermediateValues(90, 180, 12),
                                            ...MathUtils.getIntermediateValues(180, 270, 12),
                                            ...MathUtils.getIntermediateValues(270, 360, 12),
                                            ...MathUtils.getIntermediateValues(360, 450, 12),
                                            ...MathUtils.getIntermediateValues(450, 450, 12),
                                            ...MathUtils.getIntermediateValues(450, 450, 12),
                                        ],
                                        defs,
                                    ),
                                ),
                        },
                        clipPath: {
                            id: `clip1-${id}`,
                            getDefsElement: () => (
                                <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(
                                            "stretch",
                                            [
                                                ...MathUtils.getIntermediateValues(90, 90, 12),
                                                ...MathUtils.getIntermediateValues(90, 90, 12),
                                                ...MathUtils.getIntermediateValues(90, 180, 12),
                                                ...MathUtils.getIntermediateValues(180, 270, 12),
                                                ...MathUtils.getIntermediateValues(270, 360, 12),
                                                ...MathUtils.getIntermediateValues(360, 450, 12),
                                                ...MathUtils.getIntermediateValues(450, 450, 12),
                                                ...MathUtils.getIntermediateValues(450, 450, 12),
                                            ],
                                            [180],
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
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient2-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                                            { value: defs.colors.secondary },
                                        ],
                                        angle: 270,
                                    },
                                    SVGAnimationUtils.Linear.rotate(
                                        [
                                            ...MathUtils.getIntermediateValues(90, 180, 12),
                                            ...MathUtils.getIntermediateValues(180, 270, 12),
                                            ...MathUtils.getIntermediateValues(270, 270, 12),
                                            ...MathUtils.getIntermediateValues(270, 270, 12),
                                            ...MathUtils.getIntermediateValues(270, 270, 12),
                                            ...MathUtils.getIntermediateValues(270, 270, 12),
                                            ...MathUtils.getIntermediateValues(270, 360, 12),
                                            ...MathUtils.getIntermediateValues(360, 450, 12),
                                        ],
                                        defs,
                                    ),
                                ),
                        },
                        clipPath: {
                            id: `clip2-${id}`,
                            getDefsElement: () => (
                                <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(
                                            "stretch",
                                            [
                                                ...MathUtils.getIntermediateValues(90, 180, 12),
                                                ...MathUtils.getIntermediateValues(180, 270, 12),
                                                ...MathUtils.getIntermediateValues(270, 270, 12),
                                                ...MathUtils.getIntermediateValues(270, 270, 12),
                                                ...MathUtils.getIntermediateValues(270, 270, 12),
                                                ...MathUtils.getIntermediateValues(270, 270, 12),
                                                ...MathUtils.getIntermediateValues(270, 360, 12),
                                                ...MathUtils.getIntermediateValues(360, 450, 12),
                                            ],
                                            [180],
                                        ),
                                        defs,
                                    )}
                                </clipPath>
                            ),
                        },
                    },
                ],
            },

            snake_async_3: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                            { value: defs.colors.primary },
                                        ],
                                        angle: 90,
                                    },
                                    SVGAnimationUtils.Linear.rotate(MathUtils.getIntermediateValues(90, 450, 12), defs),
                                ),
                        },
                        clipPath: {
                            id: `clip1-${id}`,
                            getDefsElement: () => (
                                <clipPath id={`clip1-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(
                                            "stretch",
                                            MathUtils.getIntermediateValues(90, 450, 12),
                                            [180],
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
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient2-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                                            { value: defs.colors.secondary },
                                        ],
                                        angle: 90,
                                    },
                                    SVGAnimationUtils.Linear.rotate(
                                        [
                                            ...MathUtils.getIntermediateValues(90, 450, 12),
                                            ...MathUtils.getIntermediateValues(90, 450, 12),
                                        ],
                                        defs,
                                    ),
                                ),
                        },
                        clipPath: {
                            id: `clip2-${id}`,
                            getDefsElement: () => (
                                <clipPath id={`clip2-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(
                                            "stretch",
                                            [
                                                ...MathUtils.getIntermediateValues(90, 450, 12),
                                                ...MathUtils.getIntermediateValues(90, 450, 12),
                                            ],
                                            [180],
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
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient3-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.tertiary} r g b / 0)` },
                                            { value: defs.colors.tertiary },
                                        ],
                                        angle: 90,
                                    },
                                    SVGAnimationUtils.Linear.rotate(
                                        [
                                            ...MathUtils.getIntermediateValues(90, 450, 12),
                                            ...MathUtils.getIntermediateValues(90, 450, 12),
                                            ...MathUtils.getIntermediateValues(90, 450, 12),
                                        ],
                                        defs,
                                    ),
                                ),
                        },
                        clipPath: {
                            id: `clip3-${id}`,
                            getDefsElement: () => (
                                <clipPath id={`clip3-${id}`} clipPathUnits="objectBoundingBox">
                                    {SVGAnimationUtils.Path.getRotatingArc(
                                        ObjectUtils.zipArray(
                                            "stretch",
                                            [
                                                ...MathUtils.getIntermediateValues(90, 450, 12),
                                                ...MathUtils.getIntermediateValues(90, 450, 12),
                                                ...MathUtils.getIntermediateValues(90, 450, 12),
                                            ],
                                            [180],
                                        ),
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
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                            { value: defs.colors.primary, stop: 50 },
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)`, stop: 50 },
                                        ],
                                        offset: { x: -1.25, y: 0 },
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [0, 2.5], defs),
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
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                            { value: defs.colors.primary, stop: 50 },
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)`, stop: 50 },
                                        ],
                                        offset: { x: -1.25, y: 0 },
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [0, 2.5], defs),
                                ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient2-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient2-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                                            { value: defs.colors.secondary, stop: 50 },
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)`, stop: 50 },
                                        ],
                                        angle: 180,
                                        offset: { x: 1.25, y: 0 },
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepOrthogonal("x", x1, x2, [0, -2.5], defs),
                                ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                ],
            },

            sweep_diag_1: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                            { value: defs.colors.primary, stop: 50 },
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)`, stop: 50 },
                                        ],
                                        angle: 45,
                                        offset: offsetDiagonally(-1.25, 45),
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepDiagonal(x1, y1, x2, y2, 45, [0, 2.5], defs),
                                ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                ],
            },

            sweep_diag_1v1: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                            { value: defs.colors.primary, stop: 50 },
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)`, stop: 50 },
                                        ],
                                        angle: 45,
                                        offset: offsetDiagonally(-1.25, 45),
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepDiagonal(x1, y1, x2, y2, 45, [0, 2.5], defs),
                                ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient2-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient2-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                                            { value: defs.colors.secondary, stop: 50 },
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)`, stop: 50 },
                                        ],
                                        angle: 225,
                                        offset: offsetDiagonally(-1.25, 225),
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepDiagonal(x1, y1, x2, y2, 225, [0, 2.5], defs),
                                ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                ],
            },

            sweep_diag_async_4: {
                getSVGDefs: (id, __, defs) => [
                    {
                        color: getBaseBorderColor(defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient1-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient1-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                            { value: defs.colors.primary, stop: 50 },
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)`, stop: 50 },
                                        ],
                                        angle: 45,
                                        offset: offsetDiagonally(-1.25, 45),
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepDiagonal(
                                            x1,
                                            y1,
                                            x2,
                                            y2,
                                            45,
                                            [0, 1.25, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5],
                                            defs,
                                        ),
                                ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient2-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient2-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                                            { value: defs.colors.secondary, stop: 50 },
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)`, stop: 50 },
                                        ],
                                        angle: 225,
                                        offset: offsetDiagonally(-1.25, 225),
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepDiagonal(
                                            x1,
                                            y1,
                                            x2,
                                            y2,
                                            225,
                                            [0, 0, 0, 1.25, 2.5, 2.5, 2.5, 2.5, 2.5],
                                            defs,
                                        ),
                                ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient3-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient3-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)` },
                                            { value: defs.colors.primary, stop: 50 },
                                            { value: `rgb(from ${defs.colors.primary} r g b / 0)`, stop: 50 },
                                        ],
                                        angle: 135,
                                        offset: offsetDiagonally(-1.25, 135),
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepDiagonal(
                                            x1,
                                            y1,
                                            x2,
                                            y2,
                                            135,
                                            [0, 0, 0, 0, 0, 1.25, 2.5, 2.5, 2.5],
                                            defs,
                                        ),
                                ),
                        },
                        filter: getBaseBlur(id, defs),
                    },
                    {
                        gradientOrPattern: {
                            id: `gradient4-${id}`,
                            getDefsElement: () =>
                                SVGGradientDefsUtils.getLinearGradient(
                                    {
                                        id: `gradient4-${id}`,
                                        colors: [
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)` },
                                            { value: defs.colors.secondary, stop: 50 },
                                            { value: `rgb(from ${defs.colors.secondary} r g b / 0)`, stop: 50 },
                                        ],
                                        angle: 315,
                                        offset: offsetDiagonally(-1.25, 315),
                                    },
                                    (x1, y1, x2, y2) =>
                                        SVGAnimationUtils.Linear.sweepDiagonal(
                                            x1,
                                            y1,
                                            x2,
                                            y2,
                                            315,
                                            [0, 0, 0, 0, 0, 0, 0, 1.25, 2.5],
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
