import type { JSX } from "solid-js";

import type { Point2d, Size2d } from "@thewaver/ss-utils";

import type { ShapeEdgeThicknessKind, ShapeJoinKind } from "./Shape.types";

const padArray = <T>(arr: T[] | undefined, defaultVal: T, count: number): T[] => {
    if (!arr || !arr.length) return Array(count).fill(defaultVal);
    return Array.from({ length: count }, (_, i) => (i < arr.length ? arr[i] : arr[arr.length - 1]));
};

export namespace ShapeUtils {
    const INNER_RECT_ITERATIONS = 5;
    const INNER_RECT_SAMPLES = 50;

    export const getInnerRect = (pts: Point2d[]) => {
        if (pts.length < 3) return { x: 0, y: 0, width: 0, height: 0 };

        let yMin = Infinity;
        let yMax = -Infinity;

        for (const p of pts) {
            if (p.y < yMin) yMin = p.y;
            if (p.y > yMax) yMax = p.y;
        }

        const getXBounds = (y: number) => {
            let xMin = Infinity,
                xMax = -Infinity;

            for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
                const p1 = pts[i],
                    p2 = pts[j];

                if ((p1.y <= y && p2.y >= y) || (p2.y <= y && p1.y >= y)) {
                    if (p1.y === p2.y) {
                        xMin = Math.min(xMin, p1.x, p2.x);
                        xMax = Math.max(xMax, p1.x, p2.x);
                    } else {
                        const x = p1.x + ((y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y);
                        xMin = Math.min(xMin, x);
                        xMax = Math.max(xMax, x);
                    }
                }
            }

            return { xMin, xMax };
        };

        let bestRect = { x: 0, y: 0, width: 0, height: 0, area: 0 };
        let yB_min = yMin;
        let yB_max = yMax;
        let yT_min = yMin;
        let yT_max = yMax;

        for (let iter = 0; iter < INNER_RECT_ITERATIONS; iter++) {
            let currentBest = { ...bestRect };

            const stepB = (yB_max - yB_min) / INNER_RECT_SAMPLES;
            const stepT = (yT_max - yT_min) / INNER_RECT_SAMPLES;
            const bVals = [],
                tVals = [];

            for (let i = 0; i <= INNER_RECT_SAMPLES; i++) {
                const yB = yB_min + i * stepB;
                const yT = yT_min + i * stepT;
                bVals.push({ y: yB, bounds: getXBounds(yB) });
                tVals.push({ y: yT, bounds: getXBounds(yT) });
            }

            for (let i = 0; i <= INNER_RECT_SAMPLES; i++) {
                for (let j = 0; j <= INNER_RECT_SAMPLES; j++) {
                    const yB = bVals[i].y;
                    const yT = tVals[j].y;

                    if (yT <= yB) continue;

                    const bB = bVals[i].bounds;
                    const bT = tVals[j].bounds;
                    const xL = Math.max(bB.xMin, bT.xMin);
                    const xR = Math.min(bB.xMax, bT.xMax);

                    if (xR > xL) {
                        const area = (xR - xL) * (yT - yB);
                        if (area > currentBest.area) {
                            currentBest = {
                                x: xL,
                                y: yB,
                                width: xR - xL,
                                height: yT - yB,
                                area,
                            };
                        }
                    }
                }
            }

            if (currentBest.area === 0) break;

            bestRect = currentBest;

            const rangeB = (yB_max - yB_min) * 0.2;
            const rangeT = (yT_max - yT_min) * 0.2;

            yB_min = Math.max(yMin, bestRect.y - rangeB);
            yB_max = Math.min(yMax, bestRect.y + rangeB);
            yT_min = Math.max(yMin, bestRect.y + bestRect.height - rangeT);
            yT_max = Math.min(yMax, bestRect.y + bestRect.height + rangeT);
        }

        return {
            x: bestRect.x,
            y: bestRect.y,
            width: bestRect.width,
            height: bestRect.height,
        };
    };

    export const setupPaths = (
        vertices: Point2d[],
        edgeThicknesses: number[],
        edgeThicknessKinds?: ShapeEdgeThicknessKind[],
        joinRadii?: number[],
        joinKinds?: ShapeJoinKind[],
        offset: number = 0,
    ) => {
        const vertexCount = vertices.length;

        const common = {
            edgeThicknesses: padArray(edgeThicknesses, 0, vertexCount),
            edgeThicknessKinds: padArray(edgeThicknessKinds, "constant" as ShapeEdgeThicknessKind, vertexCount),
            joinKinds: padArray(joinKinds, "round" as ShapeJoinKind, vertexCount),
        };

        const outer = {
            vertices: [] as Point2d[],
            joinRadii: padArray(joinRadii, 0, vertexCount),
        };

        const inner = {
            vertices: [] as Point2d[],
            joinRadii: [] as number[],
        };

        const vectors = {
            unitTangents: [] as Point2d[],
            unitNormals: [] as Point2d[],
            crossChecks: [] as number[],
        };

        if (vertexCount < 3) return { outer, inner, common, vectors };

        const { totalX, totalY } = vertices.reduce(
            (acc, curr) => ({ totalX: acc.totalX + curr.x, totalY: acc.totalY + curr.y }),
            { totalX: 0, totalY: 0 },
        );
        const polygonCenter = { x: totalX / vertexCount, y: totalY / vertexCount };

        for (let i = 0; i < vertexCount; i++) {
            const curr = vertices[i];
            const next = vertices[(i + 1) % vertexCount];
            const deltaX = next.x - curr.x;
            const deltaY = next.y - curr.y;
            const edgeLength = Math.hypot(deltaX, deltaY);
            const vectorToMidpoint = {
                x: (curr.x + next.x) * 0.5 - polygonCenter.x,
                y: (curr.y + next.y) * 0.5 - polygonCenter.y,
            };
            const tangent = { x: deltaX / edgeLength, y: deltaY / edgeLength };

            vectors.unitTangents.push(tangent);

            let normal = { x: -tangent.y, y: tangent.x };
            if (normal.x * vectorToMidpoint.x + normal.y * vectorToMidpoint.y < 0) {
                normal = { x: tangent.y, y: -tangent.x };
            }
            vectors.unitNormals.push(normal);
        }

        for (let i = 0; i < vertexCount; i++) {
            const prevIndex = (i - 1 + vertexCount) % vertexCount;
            const vertex = vertices[i];
            const prevTangent = vectors.unitTangents[prevIndex];
            const currTangent = vectors.unitTangents[i];
            const prevNormal = vectors.unitNormals[prevIndex];
            const currNormal = vectors.unitNormals[i];
            const crossProduct = prevTangent.x * currTangent.y - prevTangent.y * currTangent.x;
            const crossCheck = crossProduct || 0.001;
            vectors.crossChecks.push(crossCheck);

            const prevOuterWall = { x: vertex.x + offset * prevNormal.x, y: vertex.y + offset * prevNormal.y };
            const currOuterWall = { x: vertex.x + offset * currNormal.x, y: vertex.y + offset * currNormal.y };
            const outerScale =
                ((currOuterWall.x - prevOuterWall.x) * currTangent.y -
                    (currOuterWall.y - prevOuterWall.y) * currTangent.x) /
                crossCheck;

            outer.vertices.push({
                x: prevOuterWall.x + outerScale * prevTangent.x,
                y: prevOuterWall.y + outerScale * prevTangent.y,
            });

            const prevThickness = common.edgeThicknesses[prevIndex];
            const currThickness = common.edgeThicknesses[i];
            const isConstant = common.edgeThicknessKinds[i] === "constant";
            const arcThicknessPrev = isConstant ? prevThickness : Math.max(prevThickness, currThickness);
            const arcThicknessCurr = isConstant ? currThickness : Math.max(prevThickness, currThickness);
            const prevInnerWall = {
                x: vertex.x - arcThicknessPrev * prevNormal.x,
                y: vertex.y - arcThicknessPrev * prevNormal.y,
            };
            const currInnerWall = {
                x: vertex.x - arcThicknessCurr * currNormal.x,
                y: vertex.y - arcThicknessCurr * currNormal.y,
            };
            const innerScale =
                ((currInnerWall.x - prevInnerWall.x) * currTangent.y -
                    (currInnerWall.y - prevInnerWall.y) * currTangent.x) /
                crossCheck;

            inner.vertices.push({
                x: prevInnerWall.x + innerScale * prevTangent.x,
                y: prevInnerWall.y + innerScale * prevTangent.y,
            });

            inner.joinRadii.push(outer.joinRadii[i] - Math.max(arcThicknessPrev, arcThicknessCurr));
        }

        return { outer, inner, common, vectors };
    };

    export const getPaths = (
        vertices: Point2d[],
        edgeThicknesses: number[],
        edgeThicknessKinds?: ShapeEdgeThicknessKind[],
        joinRadii?: number[],
        joinKinds?: ShapeJoinKind[],
        offset: number = 0,
    ) => {
        const vertexCount = vertices.length;

        if (vertexCount < 3) return { outerPath: "", innerPath: "", outerPoints: [], innerPoints: [] };

        const { outer, inner, common, vectors } = setupPaths(
            vertices,
            edgeThicknesses,
            edgeThicknessKinds,
            joinRadii,
            joinKinds,
            offset,
        );
        const { unitTangents, unitNormals, crossChecks } = vectors;

        const outerStartPoints: Point2d[] = [];
        const outerEndPoints: Point2d[] = [];
        const outerSweepFlags: number[] = [];
        const innerPathSegments: string[] = [];
        const innerStartPoints: Point2d[] = [];
        const innerEndPoints: Point2d[] = [];

        for (let i = 0; i < vertexCount; i++) {
            const prevIndex = (i - 1 + vertexCount) % vertexCount;
            const vertex = vertices[i];
            const outerRadius = outer.joinRadii[i];
            const prevThickness = common.edgeThicknesses[prevIndex];
            const currThickness = common.edgeThicknesses[i];
            const currentJoinType = common.joinKinds[i];
            const prevTangent = unitTangents[prevIndex];
            const currTangent = unitTangents[i];
            const prevNormal = unitNormals[prevIndex];
            const currNormal = unitNormals[i];
            const crossCheck = crossChecks[i];
            const prevArcRefPt = {
                x: vertex.x + (offset - outerRadius) * prevNormal.x,
                y: vertex.y + (offset - outerRadius) * prevNormal.y,
            };
            const currArcRefPt = {
                x: vertex.x + (offset - outerRadius) * currNormal.x,
                y: vertex.y + (offset - outerRadius) * currNormal.y,
            };
            const outerIntersectionScale =
                ((currArcRefPt.x - prevArcRefPt.x) * currTangent.y -
                    (currArcRefPt.y - prevArcRefPt.y) * currTangent.x) /
                crossCheck;
            const cornerArcCenter = {
                x: prevArcRefPt.x + outerIntersectionScale * prevTangent.x,
                y: prevArcRefPt.y + outerIntersectionScale * prevTangent.y,
            };
            const outerArcStart = {
                x: cornerArcCenter.x + outerRadius * prevNormal.x,
                y: cornerArcCenter.y + outerRadius * prevNormal.y,
            };
            const outerArcEnd = {
                x: cornerArcCenter.x + outerRadius * currNormal.x,
                y: cornerArcCenter.y + outerRadius * currNormal.y,
            };

            outerStartPoints.push(outerArcStart);
            outerEndPoints.push(outerArcEnd);

            const startVector = { x: outerArcStart.x - cornerArcCenter.x, y: outerArcStart.y - cornerArcCenter.y };
            const endVector = { x: outerArcEnd.x - cornerArcCenter.x, y: outerArcEnd.y - cornerArcCenter.y };
            const sweepFlag = startVector.x * endVector.y - startVector.y * endVector.x > 0 ? 1 : 0;
            outerSweepFlags.push(sweepFlag);

            const isConstant = common.edgeThicknessKinds[i] === "constant";
            const arcThicknessPrev = isConstant ? prevThickness : Math.max(prevThickness, currThickness);
            const arcThicknessCurr = isConstant ? currThickness : Math.max(prevThickness, currThickness);
            const prevInnerRadius = outerRadius - arcThicknessPrev;
            const currInnerRadius = outerRadius - arcThicknessCurr;
            const innerRadius = inner.joinRadii[i];
            const sharpInnerIntersection = inner.vertices[i];

            let cornerString = "";
            let finalSegmentStart: Point2d = { x: 0, y: 0 };
            let finalSegmentEnd: Point2d = { x: 0, y: 0 };

            if (currentJoinType === "scoop") {
                const scoopRadius = outerRadius + Math.abs(arcThicknessPrev - arcThicknessCurr);
                const prevInnerWallPt = {
                    x: vertex.x - arcThicknessPrev * prevNormal.x,
                    y: vertex.y - arcThicknessPrev * prevNormal.y,
                };
                const currInnerWallPt = {
                    x: vertex.x - arcThicknessCurr * currNormal.x,
                    y: vertex.y - arcThicknessCurr * currNormal.y,
                };
                const pA = {
                    x: prevInnerWallPt.x - scoopRadius * prevNormal.x,
                    y: prevInnerWallPt.y - scoopRadius * prevNormal.y,
                };
                const pB = {
                    x: currInnerWallPt.x - scoopRadius * currNormal.x,
                    y: currInnerWallPt.y - scoopRadius * currNormal.y,
                };
                const centerScale = ((pB.x - pA.x) * currTangent.y - (pB.y - pA.y) * currTangent.x) / crossCheck;
                const scoopCenter = { x: pA.x + centerScale * prevTangent.x, y: pA.y + centerScale * prevTangent.y };
                const scoopStart = {
                    x: scoopCenter.x + scoopRadius * prevNormal.x,
                    y: scoopCenter.y + scoopRadius * prevNormal.y,
                };
                const scoopEnd = {
                    x: scoopCenter.x + scoopRadius * currNormal.x,
                    y: scoopCenter.y + scoopRadius * currNormal.y,
                };
                const scoopSweep = sweepFlag === 1 ? 0 : 1;

                cornerString = `L ${scoopStart.x} ${scoopStart.y} A ${scoopRadius} ${scoopRadius} 0 0 ${scoopSweep} ${scoopEnd.x} ${scoopEnd.y}`;
                finalSegmentStart = scoopStart;
                finalSegmentEnd = scoopEnd;
            } else if (prevInnerRadius <= 0 || currInnerRadius <= 0) {
                cornerString = `L ${sharpInnerIntersection.x} ${sharpInnerIntersection.y}`;
                finalSegmentStart = sharpInnerIntersection;
                finalSegmentEnd = sharpInnerIntersection;
            } else if (currentJoinType === "bevel") {
                const innerArcStart = {
                    x: outerArcStart.x - arcThicknessPrev * prevNormal.x,
                    y: outerArcStart.y - arcThicknessPrev * prevNormal.y,
                };
                const innerArcEnd = {
                    x: outerArcEnd.x - arcThicknessCurr * currNormal.x,
                    y: outerArcEnd.y - arcThicknessCurr * currNormal.y,
                };

                cornerString = `L ${innerArcStart.x} ${innerArcStart.y} L ${innerArcEnd.x} ${innerArcEnd.y}`;
                finalSegmentStart = innerArcStart;
                finalSegmentEnd = innerArcEnd;
            } else {
                const prevInnerWallPt = {
                    x: vertex.x - arcThicknessPrev * prevNormal.x,
                    y: vertex.y - arcThicknessPrev * prevNormal.y,
                };
                const currInnerWallPt = {
                    x: vertex.x - arcThicknessCurr * currNormal.x,
                    y: vertex.y - arcThicknessCurr * currNormal.y,
                };
                const pA = {
                    x: prevInnerWallPt.x - innerRadius * prevNormal.x,
                    y: prevInnerWallPt.y - innerRadius * prevNormal.y,
                };
                const pB = {
                    x: currInnerWallPt.x - innerRadius * currNormal.x,
                    y: currInnerWallPt.y - innerRadius * currNormal.y,
                };
                const centerScale = ((pB.x - pA.x) * currTangent.y - (pB.y - pA.y) * currTangent.x) / crossCheck;
                const innerArcCenter = { x: pA.x + centerScale * prevTangent.x, y: pA.y + centerScale * prevTangent.y };
                const innerArcStart = {
                    x: innerArcCenter.x + innerRadius * prevNormal.x,
                    y: innerArcCenter.y + innerRadius * prevNormal.y,
                };
                const innerArcEnd = {
                    x: innerArcCenter.x + innerRadius * currNormal.x,
                    y: innerArcCenter.y + innerRadius * currNormal.y,
                };

                cornerString = `L ${innerArcStart.x} ${innerArcStart.y} A ${innerRadius} ${innerRadius} 0 0 ${sweepFlag} ${innerArcEnd.x} ${innerArcEnd.y}`;
                finalSegmentStart = innerArcStart;
                finalSegmentEnd = innerArcEnd;
            }

            innerStartPoints.push(finalSegmentStart);
            innerPathSegments.push(cornerString);
            innerEndPoints.push(finalSegmentEnd);
        }

        const outerPoints: Point2d[] = [];
        const innerPoints: Point2d[] = [];

        let outerPath = `M ${outerEndPoints[vertexCount - 1].x} ${outerEndPoints[vertexCount - 1].y}`;
        for (let i = 0; i < vertexCount; i++) {
            const currentJoinType = common.joinKinds[i];

            outerPath += ` L ${outerStartPoints[i].x} ${outerStartPoints[i].y}`;
            if (currentJoinType === "bevel") {
                outerPath += ` L ${outerEndPoints[i].x} ${outerEndPoints[i].y}`;
            } else {
                const sweep = currentJoinType === "scoop" ? (outerSweepFlags[i] === 1 ? 0 : 1) : outerSweepFlags[i];
                outerPath += ` A ${outer.joinRadii[i]} ${outer.joinRadii[i]} 0 0 ${sweep} ${outerEndPoints[i].x} ${outerEndPoints[i].y}`;
            }

            outerPoints.push(outerStartPoints[i]);
            if (outerStartPoints[i].x !== outerEndPoints[i].x || outerStartPoints[i].y !== outerEndPoints[i].y) {
                outerPoints.push(outerEndPoints[i]);
            }

            innerPoints.push(innerStartPoints[i]);
            if (innerStartPoints[i].x !== innerEndPoints[i].x || innerStartPoints[i].y !== innerEndPoints[i].y) {
                innerPoints.push(innerEndPoints[i]);
            }
        }

        let innerPath = `M ${innerEndPoints[vertexCount - 1].x} ${innerEndPoints[vertexCount - 1].y}`;
        for (let i = 0; i < vertexCount; i++) {
            innerPath += " " + innerPathSegments[i];
        }

        return {
            outerPath: `${outerPath} Z`,
            innerPath: `${innerPath} Z`,
            outerPoints,
            innerPoints,
        };
    };

    export const getRectPadding = (
        edgeThicknesses: number[],
        edgeThicknessKinds?: ShapeEdgeThicknessKind[],
        joinRadii?: number[],
        joinKinds?: ShapeJoinKind[],
    ): JSX.CSSProperties => {
        const count = 4;

        const t = padArray(edgeThicknesses, 0, count);
        const tk = padArray(edgeThicknessKinds, "constant" as ShapeEdgeThicknessKind, count);
        const jr = padArray(joinRadii, 0, count);
        const jk = padArray(joinKinds, "round" as ShapeJoinKind, count);

        const getEdgePadding = (index: number) => {
            const thickness = tk[index] === "constant" ? t[index] : Math.max(t[index], t[(index + 1) % 4]);
            const thicknessMult = jk[index] === "round" ? 0.7 : jk[index] === "scoop" ? 1 : 0.5;
            const joinMult = jk[index] === "round" ? 0.3 : jk[index] === "scoop" ? 0.7 : 0.5;

            return Math.max(thickness, thickness * thicknessMult + jr[index] * joinMult);
        };

        const edgePadding = Array.from({ length: count }, (_, idx) => getEdgePadding(idx));

        return {
            "padding-top": `${Math.max(edgePadding[0], edgePadding[1])}px`,
            "padding-right": `${Math.max(edgePadding[1], edgePadding[2])}px`,
            "padding-bottom": `${Math.max(edgePadding[2], edgePadding[3])}px`,
            "padding-left": `${Math.max(edgePadding[3], edgePadding[0])}px`,
        };
    };

    export const getPolygonPadding = (size: Size2d, innerPoints: Point2d[]): JSX.CSSProperties => {
        const innerRect = ShapeUtils.getInnerRect(innerPoints);

        return {
            "padding-top": `${innerRect.y}px`,
            "padding-left": `${innerRect.x}px`,
            "padding-bottom": `${size.height - innerRect.y - innerRect.height}px`,
            "padding-right": `${size.width - innerRect.x - innerRect.width}px`,
        };
    };
}
