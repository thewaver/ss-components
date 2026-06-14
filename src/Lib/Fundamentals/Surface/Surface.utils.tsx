import { For } from "solid-js";

import type { Point2d, Size2d } from "@thewaver/ss-utils";

import type { CSSBorderRadius, CSSBorderWidth } from "../../Abstracts/CSS/CSS.types";
import { SVGUtils } from "../../Abstracts/SVG/SVG.utils";

export namespace SurfaceUtils {
    export const fitCornerRadii = (width: number, height: number, radii: CSSBorderRadius): CSSBorderRadius => {
        const safeWidth = Math.max(0, width);
        const safeHeight = Math.max(0, height);

        const topSum = radii.borderTopLeftRadius + radii.borderTopRightRadius;
        const bottomSum = radii.borderBottomLeftRadius + radii.borderBottomRightRadius;
        const leftSum = radii.borderTopLeftRadius + radii.borderBottomLeftRadius;
        const rightSum = radii.borderTopRightRadius + radii.borderBottomRightRadius;

        const scale = Math.min(
            1,
            topSum > 0 ? safeWidth / topSum : 1,
            bottomSum > 0 ? safeWidth / bottomSum : 1,
            leftSum > 0 ? safeHeight / leftSum : 1,
            rightSum > 0 ? safeHeight / rightSum : 1,
        );

        return {
            borderTopLeftRadius: radii.borderTopLeftRadius * scale,
            borderTopRightRadius: radii.borderTopRightRadius * scale,
            borderBottomRightRadius: radii.borderBottomRightRadius * scale,
            borderBottomLeftRadius: radii.borderBottomLeftRadius * scale,
        };
    };

    const getRoundedRectPathInternal = (
        x: number,
        y: number,
        width: number,
        height: number,
        radii: CSSBorderRadius,
    ): string => {
        const right = x + width;
        const bottom = y + height;

        const {
            borderBottomLeftRadius: bl,
            borderBottomRightRadius: br,
            borderTopLeftRadius: tl,
            borderTopRightRadius: tr,
        } = fitCornerRadii(width, height, radii);

        return [
            `M ${x + tl} ${y}`,
            `L ${right - tr} ${y}`,
            tr > 0 ? `A ${tr} ${tr} 0 0 1 ${right} ${y + tr}` : `L ${right} ${y}`,

            `L ${right} ${bottom - br}`,
            br > 0 ? `A ${br} ${br} 0 0 1 ${right - br} ${bottom}` : `L ${right} ${bottom}`,

            `L ${x + bl} ${bottom}`,
            bl > 0 ? `A ${bl} ${bl} 0 0 1 ${x} ${bottom - bl}` : `L ${x} ${bottom}`,

            `L ${x} ${y + tl}`,
            tl > 0 ? `A ${tl} ${tl} 0 0 1 ${x + tl} ${y}` : `L ${x} ${y}`,

            "Z",
        ].join(" ");
    };

    export const getCornerRadii = ({
        width,
        height,
        borderTopLeftRadius,
        borderTopRightRadius,
        borderBottomRightRadius,
        borderBottomLeftRadius,
        borderTopWidth,
        borderRightWidth,
        borderBottomWidth,
        borderLeftWidth,
    }: Size2d & CSSBorderWidth & CSSBorderRadius) => {
        const outerRadii = fitCornerRadii(width, height, {
            borderTopLeftRadius: Math.max(borderTopLeftRadius, 0),
            borderTopRightRadius: Math.max(borderTopRightRadius, 0),
            borderBottomRightRadius: Math.max(borderBottomRightRadius, 0),
            borderBottomLeftRadius: Math.max(borderBottomLeftRadius, 0),
        });

        const innerWidth = Math.max(width - borderLeftWidth - borderRightWidth, 0);
        const innerHeight = Math.max(height - borderTopWidth - borderBottomWidth, 0);

        const innerRadii = fitCornerRadii(innerWidth, innerHeight, {
            borderTopLeftRadius: Math.max(
                outerRadii.borderTopLeftRadius - Math.max(borderLeftWidth, borderTopWidth),
                0,
            ),
            borderTopRightRadius: Math.max(
                outerRadii.borderTopRightRadius - Math.max(borderRightWidth, borderTopWidth),
                0,
            ),
            borderBottomRightRadius: Math.max(
                outerRadii.borderBottomRightRadius - Math.max(borderRightWidth, borderBottomWidth),
                0,
            ),
            borderBottomLeftRadius: Math.max(
                outerRadii.borderBottomLeftRadius - Math.max(borderLeftWidth, borderBottomWidth),
                0,
            ),
        });

        return {
            innerRadii,
            outerRadii,
        };
    };

    export const getRoundedRectPaths = ({
        x,
        y,
        width,
        height,
        borderTopLeftRadius,
        borderTopRightRadius,
        borderBottomRightRadius,
        borderBottomLeftRadius,
        borderTopWidth,
        borderRightWidth,
        borderBottomWidth,
        borderLeftWidth,
    }: Point2d & Size2d & CSSBorderWidth & CSSBorderRadius) => {
        const innerX = x + borderLeftWidth;
        const innerY = y + borderTopWidth;

        const innerWidth = Math.max(width - borderLeftWidth - borderRightWidth, 0);
        const innerHeight = Math.max(height - borderTopWidth - borderBottomWidth, 0);

        const { innerRadii, outerRadii } = getCornerRadii({
            width,
            height,
            borderTopLeftRadius,
            borderTopRightRadius,
            borderBottomRightRadius,
            borderBottomLeftRadius,
            borderTopWidth,
            borderRightWidth,
            borderBottomWidth,
            borderLeftWidth,
        });

        return {
            outerRadii,
            outerPath: getRoundedRectPathInternal(x, y, width, height, outerRadii),
            innerRadii,
            innerPath:
                innerWidth > 0 && innerHeight > 0
                    ? getRoundedRectPathInternal(innerX, innerY, innerWidth, innerHeight, innerRadii)
                    : "",
        };
    };
}

export namespace SurfaceAnimationUtils {
    export type SurfaceAnimationDefs = {
        getAnimationDurationMs: () => number;
    };

    const getCommonAnimDefs = (defs: SurfaceAnimationDefs) => ({
        dur: `${defs.getAnimationDurationMs()}ms`,
        repeatCount: "indefinite" as const,
    });

    const DIAGONAL_RAD = (45 * Math.PI) / 180;

    export namespace Linear {
        export const grow = (vName: "x" | "y", v1: number, v2: number, sArr: number[], defs: SurfaceAnimationDefs) => {
            const commonDefs = getCommonAnimDefs(defs);
            const halfDist = Math.abs(v2 - v1) * 0.5;

            return (
                <>
                    <animate
                        attributeName={`${vName}1`}
                        values={sArr.map((s) => `${v1 + halfDist - halfDist * s}`).join(";")}
                        {...commonDefs}
                    />
                    <animate
                        attributeName={`${vName}2`}
                        values={sArr.map((s) => `${v2 - halfDist + halfDist * s}`).join(";")}
                        {...commonDefs}
                    />
                </>
            );
        };

        export const sweepOrthogonal = (
            vName: "x" | "y",
            v1: number,
            v2: number,
            oArr: number[],
            defs: SurfaceAnimationDefs,
        ) => {
            const commonDefs = getCommonAnimDefs(defs);

            return (
                <>
                    <animate
                        attributeName={`${vName}1`}
                        values={oArr.map((o) => `${v1 + o}`).join(";")}
                        {...commonDefs}
                    />
                    <animate
                        attributeName={`${vName}2`}
                        values={oArr.map((o) => `${v2 + o}`).join(";")}
                        {...commonDefs}
                    />
                </>
            );
        };

        export const sweepDiagonal = (
            x1: number,
            y1: number,
            x2: number,
            y2: number,
            oArr: [oX: number, oY: number][],
            defs: SurfaceAnimationDefs,
        ) => {
            const points = [
                [x1, y1],
                [x2, y2],
            ];
            const commonDefs = getCommonAnimDefs(defs);

            return (
                <For each={points}>
                    {(point, getIndex) => {
                        const x = point[0];
                        const y = point[1];

                        return (
                            <>
                                <animate
                                    attributeName={`x${getIndex() + 1}`}
                                    values={oArr.map((o) => `${x + o[0] * Math.cos(DIAGONAL_RAD)}`).join(";")}
                                    {...commonDefs}
                                />
                                <animate
                                    attributeName={`y${getIndex() + 1}`}
                                    values={oArr.map((o) => `${y + o[1] * Math.sin(DIAGONAL_RAD)}`).join(";")}
                                    {...commonDefs}
                                />
                            </>
                        );
                    }}
                </For>
            );
        };

        const V_KEYS = ["x1", "y1", "x2", "y2"] as const;

        export const rotate = (aArray: number[], defs: SurfaceAnimationDefs) => {
            const steps = aArray.map((angle) => SVGUtils.getLinearCoords({ angle }));
            const commonDefs = getCommonAnimDefs(defs);

            return (
                <For each={V_KEYS}>
                    {(vKey) => (
                        <animate
                            attributeName={vKey}
                            values={steps.map((step) => step[vKey]).join(";")}
                            {...commonDefs}
                        />
                    )}
                </For>
            );
        };
    }

    export namespace Radial {
        export const grow = (rArr: number[], defs: SurfaceAnimationDefs) => {
            return <animate attributeName="r" values={rArr.join(";")} {...getCommonAnimDefs(defs)} />;
        };

        export const sweepOrthogonal = (vName: "cx" | "cy", vArr: number[], defs: SurfaceAnimationDefs) => {
            return <animate attributeName={vName} values={vArr.join(";")} {...getCommonAnimDefs(defs)} />;
        };

        export const sweepDiagonal = (
            cx: number,
            cy: number,
            oArr: [x: number, y: number][],
            defs: SurfaceAnimationDefs,
        ) => {
            const commonDefs = getCommonAnimDefs(defs);

            return (
                <>
                    <animate
                        attributeName="cx"
                        values={oArr.map((o) => `${cx + o[0] * Math.cos(DIAGONAL_RAD)}`).join(";")}
                        {...commonDefs}
                    />
                    <animate
                        attributeName="cy"
                        values={oArr.map((o) => `${cy + o[1] * Math.sin(DIAGONAL_RAD)}`).join(";")}
                        {...commonDefs}
                    />
                </>
            );
        };
    }

    export namespace Path {
        export const getRotatingArc = (aArray: [rotation: number, arcSize: number][], defs: SurfaceAnimationDefs) => {
            const steps = aArray.map(([rotation, arcSize]) => SVGUtils.getArcPath(arcSize, rotation));
            const commonDefs = getCommonAnimDefs(defs);

            return (
                <path d={steps[0]}>
                    <animate attributeName="d" values={steps.join(";")} {...commonDefs} />
                </path>
            );
        };
    }
}
