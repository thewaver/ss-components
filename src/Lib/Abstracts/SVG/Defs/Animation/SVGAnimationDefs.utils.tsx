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

    export const createAnimateDefs = (defs: SVGAnimationDefs) => {
        const [getPatternIndex, setPatternIndex] = createSignal(0);

        const getPatterns = createMemo(() => unrollSelfReferencingPatterns(defs.animationIterationPatterns ?? []));

        let notifier: SVGAnimateElement | undefined;

        return (): JSX.AnimateSVGAttributes<SVGAnimateElement> => ({
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
                notifier ??= el;

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
                    const isNotifier = el === notifier;

                    if (isNotifier) defs.onAnimationIteration?.(currentIndex);

                    if (nextIndex !== undefined) {
                        if (isNotifier) setPatternIndex(nextIndex);

                        el.beginElementAt((getPatterns()[nextIndex]?.beginDelayMs ?? 0) / 1000);
                    } else if (isNotifier) {
                        defs.onAnimationEnd?.();
                    }
                });
            },
        });
    };

    export namespace Linear {
        export const grow = (vName: "x" | "y", v1: number, v2: number, sArr: number[], defs: SVGAnimationDefs) => {
            const halfDist = Math.abs(v2 - v1) * 0.5;
            const animateDefs = createAnimateDefs(defs);

            return (
                <Show when={defs.animationIterationPatterns ?? EMPTY_ARRAY} keyed>
                    <animate
                        attributeName={`${vName}1`}
                        values={sArr.map((s) => `${v1 + halfDist - halfDist * s}`).join(";")}
                        {...animateDefs()}
                    />
                    <animate
                        attributeName={`${vName}2`}
                        values={sArr.map((s) => `${v2 - halfDist + halfDist * s}`).join(";")}
                        {...animateDefs()}
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
            const animateDefs = createAnimateDefs(defs);

            return (
                <Show when={defs.animationIterationPatterns ?? EMPTY_ARRAY} keyed>
                    <animate
                        attributeName={`${vName}1`}
                        values={oArr.map((o) => `${v1 + o}`).join(";")}
                        {...animateDefs()}
                    />
                    <animate
                        attributeName={`${vName}2`}
                        values={oArr.map((o) => `${v2 + o}`).join(";")}
                        {...animateDefs()}
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
            const animateDefs = createAnimateDefs(defs);

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
                                        {...animateDefs()}
                                    />
                                    <animate
                                        attributeName={`y${getIndex() + 1}`}
                                        values={oArr.map((o) => `${y + o * Math.sin(diagonalRad)}`).join(";")}
                                        {...animateDefs()}
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
            const animateDefs = createAnimateDefs(defs);

            return (
                <Show when={defs.animationIterationPatterns ?? EMPTY_ARRAY} keyed>
                    <For each={V_KEYS}>
                        {(vKey) => (
                            <animate
                                attributeName={vKey}
                                values={steps.map((step) => step[vKey]).join(";")}
                                {...animateDefs()}
                            />
                        )}
                    </For>
                </Show>
            );
        };
    }

    export namespace Radial {
        export const grow = (rArr: number[], defs: SVGAnimationDefs) => {
            const animateDefs = createAnimateDefs(defs);

            return (
                <Show when={defs.animationIterationPatterns ?? EMPTY_ARRAY} keyed>
                    <animate attributeName="r" values={rArr.join(";")} {...animateDefs()} />
                </Show>
            );
        };

        export const sweepOrthogonal = (vName: "cx" | "cy", vArr: number[], defs: SVGAnimationDefs) => {
            const animateDefs = createAnimateDefs(defs);

            return (
                <Show when={defs.animationIterationPatterns ?? EMPTY_ARRAY} keyed>
                    <animate attributeName={vName} values={vArr.join(";")} {...animateDefs()} />
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
            const animateDefs = createAnimateDefs(defs);

            return (
                <Show when={defs.animationIterationPatterns ?? EMPTY_ARRAY} keyed>
                    <animate
                        attributeName="cx"
                        values={oArr.map((o) => `${cx + o * Math.cos(diagonalRad)}`).join(";")}
                        {...animateDefs()}
                    />
                    <animate
                        attributeName="cy"
                        values={oArr.map((o) => `${cy + o * Math.sin(diagonalRad)}`).join(";")}
                        {...animateDefs()}
                    />
                </Show>
            );
        };
    }

    export namespace Path {
        export const getRotatingArc = (aArray: [rotation: number, arcSize: number][], defs: SVGAnimationDefs) => {
            const paths = aArray.map(([rotation, arcSize]) => SVGUtils.getArcPath(arcSize, rotation));
            const animateDefs = createAnimateDefs(defs);

            return (
                <path d={paths[0]}>
                    <Show when={defs.animationIterationPatterns ?? EMPTY_ARRAY} keyed>
                        <animate attributeName="d" values={paths.join(";")} {...animateDefs()} />
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
            const animateDefs = createAnimateDefs(defs);

            return (
                <path d={paths[0]}>
                    <Show when={defs.animationIterationPatterns ?? EMPTY_ARRAY} keyed>
                        <animate attributeName="d" values={paths.join(";")} {...animateDefs()} />
                    </Show>
                </path>
            );
        };
    }

    export namespace Gradient {
        export const cycleSmoothColors = (gradientId: string, sArray: string[][], defs: SVGAnimationDefs) => {
            const animateDefs = createAnimateDefs(defs);

            return (
                <Show when={defs.animationIterationPatterns ?? EMPTY_ARRAY} keyed>
                    <For each={sArray}>
                        {(stop, getIndex) => (
                            <animate
                                {...{ href: `#${gradientId}-stop-${getIndex()}` }}
                                attributeName="stop-color"
                                values={stop.join(";")}
                                {...animateDefs()}
                            />
                        )}
                    </For>
                </Show>
            );
        };
    }
}
