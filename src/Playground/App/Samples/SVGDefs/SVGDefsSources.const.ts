import { render } from "solid-js/web";

import type { Size2d } from "@thewaver/ss-utils";

import type { SVGDefs } from "../../../../Lib/Abstracts/SVG/Defs/SVGDefs.types";
import { SVGDefsSamples } from "./SVGDefs.const";
import { SVGDefsUri } from "./SVGDefsUri.const";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

const SOURCE_ANIMATION_ID = "source-animation";

const CONTINUOUS = 0;

export const SOURCE_SIZE: Size2d = { width: 1200, height: 1200 };

export const SOURCE_CELL_SIZE: Size2d = { width: 150, height: 150 };

const appendRect = (svg: SVGElement, size: Size2d, defs: SVGDefs) => {
    const rect = document.createElementNS(SVG_NAMESPACE, "rect");

    rect.setAttribute("width", `${size.width}`);
    rect.setAttribute("height", `${size.height}`);
    rect.setAttribute("fill", defs.color ?? `url(#${defs.gradientOrPattern!.id})`);

    if (defs.clipPath) rect.setAttribute("clip-path", `url(#${defs.clipPath.id})`);
    if (defs.filter) rect.setAttribute("filter", `url(#${defs.filter.id})`);
    if (defs.opacity !== undefined) rect.setAttribute("opacity", `${defs.opacity}`);

    svg.appendChild(rect);
};

export namespace SVGDefsSources {
    export const toSourceSvg = (size: Size2d, entries: SVGDefs[], iterationDelayMs: number) => {
        const svg = document.createElementNS(SVG_NAMESPACE, "svg");
        const defsNode = document.createElementNS(SVG_NAMESPACE, "defs");

        svg.setAttribute("width", `${size.width}`);
        svg.setAttribute("height", `${size.height}`);
        svg.appendChild(defsNode);

        const dispose = render(
            () =>
                entries
                    .flatMap((entry) => [entry.clipPath, entry.filter, entry.gradientOrPattern])
                    .filter((slot) => slot !== undefined)
                    .map((slot) => slot.renderDefsElement()),
            defsNode,
        );

        for (const entry of entries) appendRect(svg, size, entry);

        const animations = [...svg.querySelectorAll("animate, animateTransform, animateMotion, set")];

        animations.forEach((animation, index) => {
            if (iterationDelayMs <= 0) {
                if (animation.getAttribute("begin") === "indefinite") animation.setAttribute("begin", "0s");

                return;
            }

            const id = animation.getAttribute("id") ?? `${SOURCE_ANIMATION_ID}-${index}`;

            animation.setAttribute("id", id);
            animation.setAttribute("repeatCount", "1");
            animation.setAttribute("begin", `0s;${id}.end+${iterationDelayMs}ms`);
        });

        const markup = new XMLSerializer().serializeToString(svg);

        dispose();

        return markup;
    };

    export const computeGradientSource = (
        key: SVGDefsSamples.Gradient.SampleKey,
        animationDurationMs: number,
        animationIterationDelayMs: number,
    ) =>
        SVGDefsUri.toDataUri(
            toSourceSvg(
                SOURCE_SIZE,
                SVGDefsSamples.Gradient.SAMPLE_CONFIGS[key].computeSVGDefs(`cell-gradient`, undefined, {
                    getSize: () => SOURCE_SIZE,
                    animationDurationMs,
                    colors: SVGDefsSamples.SAMPLE_COLORS,
                    ...SVGDefsSamples.Iteration.SAMPLE_CONFIGS.constant.computeDefs(animationDurationMs),
                }),
                animationIterationDelayMs,
            ),
        );

    export const computePatternSource = (key: SVGDefsSamples.Pattern.SampleKey, animationDurationMs: number) =>
        SVGDefsUri.toDataUri(
            toSourceSvg(
                SOURCE_SIZE,
                SVGDefsSamples.Pattern.SAMPLE_CONFIGS[key].computeSVGDefs(`cell-pattern`, undefined, {
                    getSize: () => SOURCE_SIZE,
                    cellSize: SOURCE_CELL_SIZE,
                    animationDurationMs,
                    colors: SVGDefsSamples.SAMPLE_COLORS,
                    ...SVGDefsSamples.Iteration.SAMPLE_CONFIGS.constant.computeDefs(animationDurationMs),
                }),
                CONTINUOUS,
            ),
        );

    export const GRADIENT_KEYS = Object.keys(
        SVGDefsSamples.Gradient.SAMPLE_CONFIGS,
    ) as SVGDefsSamples.Gradient.SampleKey[];

    export const PATTERN_KEYS = Object.keys(
        SVGDefsSamples.Pattern.SAMPLE_CONFIGS,
    ) as SVGDefsSamples.Pattern.SampleKey[];
}
