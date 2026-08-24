import type { JSX } from "solid-js";
import { createMemo, createSignal, onCleanup } from "solid-js";

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

        const elements = new Set<SVGAnimateElement>();

        const getLeadElement = () => {
            for (const candidate of elements) {
                if (candidate.isConnected) return candidate;
            }

            return undefined;
        };

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
                elements.add(el);

                const frameId = requestAnimationFrame(() => {
                    if (!el.isConnected) return;

                    el.beginElementAt((getPatterns()[0]?.beginDelayMs ?? 0) / 1000);
                });

                const handleEndEvent = () => {
                    if (el !== getLeadElement()) return;

                    const currentIndex = getPatternIndex();
                    const nextIndex = getPatterns()[currentIndex]?.nextIndex;

                    defs.onAnimationIteration?.(currentIndex);

                    if (nextIndex === undefined) {
                        defs.onAnimationEnd?.();
                        return;
                    }

                    setPatternIndex(nextIndex);

                    const delaySecs = (getPatterns()[nextIndex]?.beginDelayMs ?? 0) / 1000;

                    for (const element of elements) {
                        if (element.isConnected) {
                            element.beginElementAt(delaySecs);
                        }
                    }
                };

                el.addEventListener("endEvent", handleEndEvent);

                onCleanup(() => {
                    cancelAnimationFrame(frameId);
                    el.removeEventListener("endEvent", handleEndEvent);
                    elements.delete(el);
                });
            },
        });
    };
}
