import type { Point2d } from "@thewaver/ss-utils";

export namespace ShapeUtils {
    export type PathDefs = {
        edgeThicknessType?: "progressive" | "constant";
        joinType?: "round" | "bevel" | "scoop";
        offset?: number;
    };

    export const getPaths = (
        vertices: Point2d[],
        edgeThicknesses: number[],
        vertexRadii: number[],
        defs: PathDefs = {},
    ) => {
        const { edgeThicknessType = "constant", joinType = "round", offset = 0 } = defs;
        const vertexCount = vertices.length;

        if (vertexCount < 3) return { outer: "", inner: "" };

        const getThickness = (index: number) =>
            index < edgeThicknesses.length ? edgeThicknesses[index] : edgeThicknesses[edgeThicknesses.length - 1];

        const getRadius = (index: number) =>
            index < vertexRadii.length ? vertexRadii[index] : vertexRadii[vertexRadii.length - 1];

        const unitTangents: Point2d[] = [];
        const unitNormals: Point2d[] = [];

        const { totalX, totalY } = vertices.reduce(
            (acc, curr) => ({ totalX: acc.totalX + curr.x, totalY: acc.totalY + curr.y }),
            { totalX: 0, totalY: 0 },
        );
        const polygonCenter = { x: totalX / vertexCount, y: totalY / vertexCount };

        for (let i = 0; i < vertexCount; i++) {
            const currentVertex = vertices[i];
            const nextVertex = vertices[(i + 1) % vertexCount];
            const deltaX = nextVertex.x - currentVertex.x;
            const deltaY = nextVertex.y - currentVertex.y;
            const edgeLength = Math.hypot(deltaX, deltaY);
            const edgeMidpointX = (currentVertex.x + nextVertex.x) * 0.5;
            const edgeMidpointY = (currentVertex.y + nextVertex.y) * 0.5;
            const vectorToMidpoint = { x: edgeMidpointX - polygonCenter.x, y: edgeMidpointY - polygonCenter.y };
            const tangent = { x: deltaX / edgeLength, y: deltaY / edgeLength };
            unitTangents.push(tangent);

            let normal = { x: -tangent.y, y: tangent.x };

            if (normal.x * vectorToMidpoint.x + normal.y * vectorToMidpoint.y < 0) {
                normal = { x: tangent.y, y: -tangent.x };
            }
            unitNormals.push(normal);
        }

        const outerStartPoints: Point2d[] = [];
        const outerEndPoints: Point2d[] = [];
        const innerStartPoints: Point2d[] = [];
        const innerEndPoints: Point2d[] = [];
        const outerSweepFlags: number[] = [];
        const innerArcRadii: number[] = [];

        for (let i = 0; i < vertexCount; i++) {
            const prevIndex = (i - 1 + vertexCount) % vertexCount;
            const currIndex = i;
            const vertex = vertices[currIndex];
            const outerRadius = getRadius(currIndex);
            const prevThickness = getThickness(prevIndex);
            const currThickness = getThickness(currIndex);
            const prevTangent = unitTangents[prevIndex];
            const currTangent = unitTangents[currIndex];
            const prevNormal = unitNormals[prevIndex];
            const currNormal = unitNormals[currIndex];
            const crossProduct = prevTangent.x * currTangent.y - prevTangent.y * currTangent.x;
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
                crossProduct;
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
            outerSweepFlags.push(startVector.x * endVector.y - startVector.y * endVector.x > 0 ? 1 : 0);

            const arcThicknessPrev =
                edgeThicknessType === "constant" ? prevThickness : Math.max(prevThickness, currThickness);
            const arcThicknessCurr =
                edgeThicknessType === "constant" ? currThickness : Math.max(prevThickness, currThickness);
            const prevInnerRadius = outerRadius - arcThicknessPrev;
            const currInnerRadius = outerRadius - arcThicknessCurr;

            if (prevInnerRadius > 0 && currInnerRadius > 0) {
                if (joinType === "scoop") {
                    const chordMidpoint = {
                        x: (outerArcStart.x + outerArcEnd.x) * 0.5,
                        y: (outerArcStart.y + outerArcEnd.y) * 0.5,
                    };
                    const scoopCenter = {
                        x: 2 * chordMidpoint.x - cornerArcCenter.x,
                        y: 2 * chordMidpoint.y - cornerArcCenter.y,
                    };
                    const targetInnerRadius = outerRadius + (arcThicknessPrev + arcThicknessCurr) * 0.5;
                    const prevInnerEdgePt = {
                        x: vertex.x - arcThicknessPrev * prevNormal.x,
                        y: vertex.y - arcThicknessPrev * prevNormal.y,
                    };
                    const toPrevStart = { x: prevInnerEdgePt.x - scoopCenter.x, y: prevInnerEdgePt.y - scoopCenter.y };
                    const bPrev = toPrevStart.x * prevTangent.x + toPrevStart.y * prevTangent.y;
                    const cPrev =
                        toPrevStart.x * toPrevStart.x +
                        toPrevStart.y * toPrevStart.y -
                        targetInnerRadius * targetInnerRadius;
                    const sPrev = -bPrev - Math.sqrt(Math.max(0, bPrev * bPrev - cPrev));
                    const innerArcStart = {
                        x: prevInnerEdgePt.x + sPrev * prevTangent.x,
                        y: prevInnerEdgePt.y + sPrev * prevTangent.y,
                    };
                    const currInnerEdgePt = {
                        x: vertex.x - arcThicknessCurr * currNormal.x,
                        y: vertex.y - arcThicknessCurr * currNormal.y,
                    };
                    const toCurrStart = { x: currInnerEdgePt.x - scoopCenter.x, y: currInnerEdgePt.y - scoopCenter.y };
                    const bCurr = toCurrStart.x * currTangent.x + toCurrStart.y * currTangent.y;
                    const cCurr =
                        toCurrStart.x * toCurrStart.x +
                        toCurrStart.y * toCurrStart.y -
                        targetInnerRadius * targetInnerRadius;
                    const sCurr = -bCurr + Math.sqrt(Math.max(0, bCurr * bCurr - cCurr));
                    const innerArcEnd = {
                        x: currInnerEdgePt.x + sCurr * currTangent.x,
                        y: currInnerEdgePt.y + sCurr * currTangent.y,
                    };

                    innerStartPoints.push(innerArcStart);
                    innerEndPoints.push(innerArcEnd);
                    innerArcRadii.push(targetInnerRadius);
                } else {
                    // Standard Concentric Round behavior
                    const innerArcStart = {
                        x: cornerArcCenter.x + prevInnerRadius * prevNormal.x,
                        y: cornerArcCenter.y + prevInnerRadius * prevNormal.y,
                    };
                    const innerArcEnd = {
                        x: cornerArcCenter.x + currInnerRadius * currNormal.x,
                        y: cornerArcCenter.y + currInnerRadius * currNormal.y,
                    };

                    innerStartPoints.push(innerArcStart);
                    innerEndPoints.push(innerArcEnd);
                    innerArcRadii.push(Math.max(0, (prevInnerRadius + currInnerRadius) * 0.5));
                }
            }
        }

        let outerPath = `M ${outerEndPoints[vertexCount - 1].x} ${outerEndPoints[vertexCount - 1].y}`;

        for (let i = 0; i < vertexCount; i++) {
            outerPath += ` L ${outerStartPoints[i].x} ${outerStartPoints[i].y}`;

            if (joinType === "bevel") {
                outerPath += ` L ${outerEndPoints[i].x} ${outerEndPoints[i].y}`;
            } else {
                const sweep = joinType === "scoop" ? (outerSweepFlags[i] === 1 ? 0 : 1) : outerSweepFlags[i];
                outerPath += ` A ${getRadius(i)} ${getRadius(i)} 0 0 ${sweep} ${outerEndPoints[i].x} ${outerEndPoints[i].y}`;
            }
        }

        let innerPath = `M ${innerEndPoints[vertexCount - 1].x} ${innerEndPoints[vertexCount - 1].y}`;

        for (let i = 0; i < vertexCount; i++) {
            innerPath += ` L ${innerStartPoints[i].x} ${innerStartPoints[i].y}`;

            if (innerArcRadii[i] > 0) {
                if (joinType === "bevel") {
                    innerPath += ` L ${innerEndPoints[i].x} ${innerEndPoints[i].y}`;
                } else {
                    const sweep = joinType === "scoop" ? (outerSweepFlags[i] === 1 ? 0 : 1) : outerSweepFlags[i];
                    innerPath += ` A ${innerArcRadii[i]} ${innerArcRadii[i]} 0 0 ${sweep} ${innerEndPoints[i].x} ${innerEndPoints[i].y}`;
                }
            }
        }

        return { outer: `${outerPath} Z`, inner: `${innerPath} Z` };
    };
}
