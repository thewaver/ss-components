import { For } from "solid-js";

import { SVGUtils } from "@thewaver/ss-utils";

import type { SVGAnimationDefs } from "./SVGAnimationDefs.types";

export namespace SVGAnimationUtils {
    const getCommonAnimDefs = (defs: SVGAnimationDefs) => ({
        dur: `${defs.getAnimationDurationMs()}ms`,
        repeatCount: "indefinite" as const,
    });

    export namespace Linear {
        export const grow = (vName: "x" | "y", v1: number, v2: number, sArr: number[], defs: SVGAnimationDefs) => {
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
            defs: SVGAnimationDefs,
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
            angle: number,
            oArr: number[],
            defs: SVGAnimationDefs,
        ) => {
            const points = [
                [x1, y1],
                [x2, y2],
            ];
            const commonDefs = getCommonAnimDefs(defs);
            const diagonalRad = (angle * Math.PI) / 180;

            return (
                <For each={points}>
                    {(point, getIndex) => {
                        const x = point[0];
                        const y = point[1];

                        return (
                            <>
                                <animate
                                    attributeName={`x${getIndex() + 1}`}
                                    values={oArr.map((o) => `${x + o * Math.cos(diagonalRad)}`).join(";")}
                                    {...commonDefs}
                                />
                                <animate
                                    attributeName={`y${getIndex() + 1}`}
                                    values={oArr.map((o) => `${y + o * Math.sin(diagonalRad)}`).join(";")}
                                    {...commonDefs}
                                />
                            </>
                        );
                    }}
                </For>
            );
        };

        const V_KEYS = ["x1", "y1", "x2", "y2"] as const;

        export const rotate = (aArray: number[], defs: SVGAnimationDefs) => {
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
        export const grow = (rArr: number[], defs: SVGAnimationDefs) => {
            return <animate attributeName="r" values={rArr.join(";")} {...getCommonAnimDefs(defs)} />;
        };

        export const sweepOrthogonal = (vName: "cx" | "cy", vArr: number[], defs: SVGAnimationDefs) => {
            return <animate attributeName={vName} values={vArr.join(";")} {...getCommonAnimDefs(defs)} />;
        };

        export const sweepDiagonal = (
            cx: number,
            cy: number,
            angle: number,
            oArr: number[],
            defs: SVGAnimationDefs,
        ) => {
            const commonDefs = getCommonAnimDefs(defs);
            const diagonalRad = (angle * Math.PI) / 180;

            return (
                <>
                    <animate
                        attributeName="cx"
                        values={oArr.map((o) => `${cx + o * Math.cos(diagonalRad)}`).join(";")}
                        {...commonDefs}
                    />
                    <animate
                        attributeName="cy"
                        values={oArr.map((o) => `${cy + o * Math.sin(diagonalRad)}`).join(";")}
                        {...commonDefs}
                    />
                </>
            );
        };
    }

    export namespace Path {
        export const getRotatingArc = (aArray: [rotation: number, arcSize: number][], defs: SVGAnimationDefs) => {
            const paths = aArray.map(([rotation, arcSize]) => SVGUtils.getArcPath(arcSize, rotation));
            const commonDefs = getCommonAnimDefs(defs);

            return (
                <path d={paths[0]}>
                    <animate attributeName="d" values={paths.join(";")} {...commonDefs} />
                </path>
            );
        };

        export const getRotatingWedges = (
            wedgeCount: number,
            wedgeThickness: number,
            curvature: number,
            aArray: number[],
            defs: SVGAnimationDefs,
        ) => {
            const paths = aArray.map((rotation) =>
                SVGUtils.getWedgesPath(wedgeCount, wedgeThickness, rotation, curvature),
            );
            const commonDefs = getCommonAnimDefs(defs);

            return (
                <path d={paths[0]}>
                    <animate attributeName="d" values={paths.join(";")} {...commonDefs} />
                </path>
            );
        };
    }
}
