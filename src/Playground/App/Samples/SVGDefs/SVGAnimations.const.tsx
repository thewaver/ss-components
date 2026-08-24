import { For } from "solid-js";

import { SVGUtils } from "@thewaver/ss-utils";

import type { SVGAnimationDefs } from "../../../../Lib/Abstracts/SVG/Defs/Animation/SVGAnimationDefs.types";
import { SVGAnimationUtils } from "../../../../Lib/Abstracts/SVG/Defs/Animation/SVGAnimationDefs.utils";
import { SVGAnimationTracks } from "./SVGAnimationTracks.const";

const join = (values: number[]) => values.map((value) => `${value}`).join(";");

export namespace SVGAnimations {
    export namespace Linear {
        export const grow = (vName: "x" | "y", v1: number, v2: number, sArr: number[], defs: SVGAnimationDefs) => {
            const tracks = SVGAnimationTracks.computeGrowTracks(v1, v2, sArr);
            const animateDefs = SVGAnimationUtils.createAnimateDefs(defs);

            return (
                <>
                    <animate attributeName={`${vName}1`} values={join(tracks.from)} {...animateDefs()} />
                    <animate attributeName={`${vName}2`} values={join(tracks.to)} {...animateDefs()} />
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
            const animateDefs = SVGAnimationUtils.createAnimateDefs(defs);

            return (
                <>
                    <animate
                        attributeName={`${vName}1`}
                        values={join(SVGAnimationTracks.computeOffsetTrack(v1, oArr))}
                        {...animateDefs()}
                    />
                    <animate
                        attributeName={`${vName}2`}
                        values={join(SVGAnimationTracks.computeOffsetTrack(v2, oArr))}
                        {...animateDefs()}
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
            const animateDefs = SVGAnimationUtils.createAnimateDefs(defs);

            return (
                <For each={points}>
                    {(point, getIndex) => {
                        const tracks = SVGAnimationTracks.computeDiagonalTracks(point[0], point[1], angle, oArr);

                        return (
                            <>
                                <animate
                                    attributeName={`x${getIndex() + 1}`}
                                    values={join(tracks.x)}
                                    {...animateDefs()}
                                />
                                <animate
                                    attributeName={`y${getIndex() + 1}`}
                                    values={join(tracks.y)}
                                    {...animateDefs()}
                                />
                            </>
                        );
                    }}
                </For>
            );
        };

        export const rotate = (aArray: number[], defs: SVGAnimationDefs) => {
            const tracks = SVGAnimationTracks.computeRotationTracks(aArray);
            const animateDefs = SVGAnimationUtils.createAnimateDefs(defs);

            return (
                <For each={SVGAnimationTracks.V_KEYS}>
                    {(vKey) => <animate attributeName={vKey} values={join(tracks[vKey])} {...animateDefs()} />}
                </For>
            );
        };
    }

    export namespace Radial {
        export const grow = (rArr: number[], defs: SVGAnimationDefs) => {
            const animateDefs = SVGAnimationUtils.createAnimateDefs(defs);

            return <animate attributeName="r" values={rArr.join(";")} {...animateDefs()} />;
        };

        export const sweepOrthogonal = (vName: "cx" | "cy", vArr: number[], defs: SVGAnimationDefs) => {
            const animateDefs = SVGAnimationUtils.createAnimateDefs(defs);

            return <animate attributeName={vName} values={vArr.join(";")} {...animateDefs()} />;
        };

        export const sweepDiagonal = (
            cx: number,
            cy: number,
            angle: number,
            oArr: number[],
            defs: SVGAnimationDefs,
        ) => {
            const tracks = SVGAnimationTracks.computeDiagonalTracks(cx, cy, angle, oArr);
            const animateDefs = SVGAnimationUtils.createAnimateDefs(defs);

            return (
                <>
                    <animate attributeName="cx" values={join(tracks.x)} {...animateDefs()} />
                    <animate attributeName="cy" values={join(tracks.y)} {...animateDefs()} />
                </>
            );
        };
    }

    export namespace Path {
        export const rotatingArc = (aArray: [rotation: number, arcSize: number][], defs: SVGAnimationDefs) => {
            const paths = aArray.map(([rotation, arcSize]) => SVGUtils.getArcPath(arcSize, rotation));
            const animateDefs = SVGAnimationUtils.createAnimateDefs(defs);

            return (
                <path d={paths[0]}>
                    <animate attributeName="d" values={paths.join(";")} {...animateDefs()} />
                </path>
            );
        };

        export const rotatingWedges = (
            wedgeCount: number,
            wedgeThickness: number,
            curvature: number,
            aArray: number[],
            defs: SVGAnimationDefs,
        ) => {
            const paths = aArray.map((rotation) =>
                SVGUtils.getWedgesPath(wedgeCount, wedgeThickness, rotation, curvature),
            );
            const animateDefs = SVGAnimationUtils.createAnimateDefs(defs);

            return (
                <path d={paths[0]}>
                    <animate attributeName="d" values={paths.join(";")} {...animateDefs()} />
                </path>
            );
        };
    }

    export namespace Gradient {
        export const cycleSmoothColors = (gradientId: string, sArray: string[][], defs: SVGAnimationDefs) => {
            const animateDefs = SVGAnimationUtils.createAnimateDefs(defs);

            return (
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
            );
        };
    }
}
