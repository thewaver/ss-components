import { For, type JSX, Show, createMemo, createSignal } from "solid-js";

import { EMPTY_ARRAY, SVGUtils } from "@thewaver/ss-utils";

import type { SVGAnimationDefs, SVGAnimationIterationPattern } from "./SVGAnimationDefs.types";

export namespace SVGAnimationUtils {
    export const unrollSelfReferencingPatterns = (
        patterns: SVGAnimationIterationPattern[],
    ): SVGAnimationIterationPattern[] => {
        if (patterns.length === 0) return patterns;

        const result = patterns.map((p) => ({ ...p }));
        const originalLength = result.length;

        for (let i = 0; i < originalLength; i++) {
            const pattern = result[i];

            if (pattern.nextIndex === i) {
                const duplicateIndex = result.length;

                pattern.nextIndex = duplicateIndex;
                result.push({ ...pattern, nextIndex: i });
            }
        }

        return result;
    };

    export const useAnimateDefs = (defs: SVGAnimationDefs): JSX.AnimateSVGAttributes<SVGAnimateElement> => {
        const [getPatternIndex, setPatternIndex] = createSignal(0);

        const getPatterns = createMemo(() => unrollSelfReferencingPatterns(defs.animationIterationPatterns ?? []));

        return {
            get dur() {
                return `${defs.animationDurationMs}ms`;
            },
            get repeatCount() {
                const pattern = getPatterns()[getPatternIndex()];
                return !pattern || pattern.count === Infinity ? "indefinite" : pattern.count;
            },
            fill: "freeze",
            begin: "indefinite",
            ref: (el: SVGAnimateElement) => {
                requestAnimationFrame(() => {
                    if (!el.isConnected) return;

                    const svg = el.ownerSVGElement;
                    const now = svg ? svg.getCurrentTime() : 0;
                    const delaySecs = (getPatterns()[0]?.beginDelayMs ?? 0) / 1000;

                    el.setAttribute("begin", `${now + delaySecs}s`);
                });

                el.addEventListener("endEvent", () => {
                    const currentIndex = getPatternIndex();
                    const nextIndex = getPatterns()[currentIndex]?.nextIndex;

                    defs.onAnimationIteration?.(currentIndex);

                    if (nextIndex !== undefined) {
                        setPatternIndex(nextIndex);
                        const nextPattern = getPatterns()[nextIndex];
                        el.beginElementAt((nextPattern?.beginDelayMs ?? 0) / 1000);
                    } else {
                        defs.onAnimationEnd?.();
                    }
                });
            },
        };
    };

    export namespace Linear {
        export const grow = (vName: "x" | "y", v1: number, v2: number, sArr: number[], defs: SVGAnimationDefs) => {
            const halfDist = Math.abs(v2 - v1) * 0.5;

            return (
                <Show when={defs.animationIterationPatterns ?? EMPTY_ARRAY} keyed>
                    <animate
                        attributeName={`${vName}1`}
                        values={sArr.map((s) => `${v1 + halfDist - halfDist * s}`).join(";")}
                        {...useAnimateDefs(defs)}
                    />
                    <animate
                        attributeName={`${vName}2`}
                        values={sArr.map((s) => `${v2 - halfDist + halfDist * s}`).join(";")}
                        {...useAnimateDefs(defs)}
                    />
                </Show>
            );
        };

        export const sweepOrthogonal = (
            vName: "x" | "y",
            v1: number,
            v2: number,
            oArr: number[],
            defs: SVGAnimationDefs,
        ) => {
            return (
                <Show when={defs.animationIterationPatterns ?? EMPTY_ARRAY} keyed>
                    <animate
                        attributeName={`${vName}1`}
                        values={oArr.map((o) => `${v1 + o}`).join(";")}
                        {...useAnimateDefs(defs)}
                    />
                    <animate
                        attributeName={`${vName}2`}
                        values={oArr.map((o) => `${v2 + o}`).join(";")}
                        {...useAnimateDefs(defs)}
                    />
                </Show>
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
            const diagonalRad = (angle * Math.PI) / 180;

            return (
                <Show when={defs.animationIterationPatterns ?? EMPTY_ARRAY} keyed>
                    <For each={points}>
                        {(point, getIndex) => {
                            const x = point[0];
                            const y = point[1];

                            return (
                                <>
                                    <animate
                                        attributeName={`x${getIndex() + 1}`}
                                        values={oArr.map((o) => `${x + o * Math.cos(diagonalRad)}`).join(";")}
                                        {...useAnimateDefs(defs)}
                                    />
                                    <animate
                                        attributeName={`y${getIndex() + 1}`}
                                        values={oArr.map((o) => `${y + o * Math.sin(diagonalRad)}`).join(";")}
                                        {...useAnimateDefs(defs)}
                                    />
                                </>
                            );
                        }}
                    </For>
                </Show>
            );
        };

        const V_KEYS = ["x1", "y1", "x2", "y2"] as const;

        export const rotate = (aArray: number[], defs: SVGAnimationDefs) => {
            const steps = aArray.map((angle) => SVGUtils.getLinearCoords({ angle }));

            return (
                <Show when={defs.animationIterationPatterns ?? EMPTY_ARRAY} keyed>
                    <For each={V_KEYS}>
                        {(vKey) => (
                            <animate
                                attributeName={vKey}
                                values={steps.map((step) => step[vKey]).join(";")}
                                {...useAnimateDefs(defs)}
                            />
                        )}
                    </For>
                </Show>
            );
        };
    }

    export namespace Radial {
        export const grow = (rArr: number[], defs: SVGAnimationDefs) => {
            return (
                <Show when={defs.animationIterationPatterns ?? EMPTY_ARRAY} keyed>
                    <animate attributeName="r" values={rArr.join(";")} {...useAnimateDefs(defs)} />
                </Show>
            );
        };

        export const sweepOrthogonal = (vName: "cx" | "cy", vArr: number[], defs: SVGAnimationDefs) => {
            return (
                <Show when={defs.animationIterationPatterns ?? EMPTY_ARRAY} keyed>
                    <animate attributeName={vName} values={vArr.join(";")} {...useAnimateDefs(defs)} />
                </Show>
            );
        };

        export const sweepDiagonal = (
            cx: number,
            cy: number,
            angle: number,
            oArr: number[],
            defs: SVGAnimationDefs,
        ) => {
            const diagonalRad = (angle * Math.PI) / 180;

            return (
                <Show when={defs.animationIterationPatterns ?? EMPTY_ARRAY} keyed>
                    <animate
                        attributeName="cx"
                        values={oArr.map((o) => `${cx + o * Math.cos(diagonalRad)}`).join(";")}
                        {...useAnimateDefs(defs)}
                    />
                    <animate
                        attributeName="cy"
                        values={oArr.map((o) => `${cy + o * Math.sin(diagonalRad)}`).join(";")}
                        {...useAnimateDefs(defs)}
                    />
                </Show>
            );
        };
    }

    export namespace Path {
        export const getRotatingArc = (aArray: [rotation: number, arcSize: number][], defs: SVGAnimationDefs) => {
            const paths = aArray.map(([rotation, arcSize]) => SVGUtils.getArcPath(arcSize, rotation));

            return (
                <path d={paths[0]}>
                    <Show when={defs.animationIterationPatterns ?? EMPTY_ARRAY} keyed>
                        <animate attributeName="d" values={paths.join(";")} {...useAnimateDefs(defs)} />
                    </Show>
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

            return (
                <path d={paths[0]}>
                    <Show when={defs.animationIterationPatterns ?? EMPTY_ARRAY} keyed>
                        <animate attributeName="d" values={paths.join(";")} {...useAnimateDefs(defs)} />
                    </Show>
                </path>
            );
        };
    }
}
