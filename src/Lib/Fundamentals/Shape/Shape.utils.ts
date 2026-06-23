import type { Point2d } from "@thewaver/ss-utils";

import type { ShapeEdgeThicknessKind, ShapeJoinKind } from "./Shape.types";

export namespace ShapeUtils {
    export const getPaths = (
        vertices: Point2d[],
        edgeThicknesses: number[],
        edgeThicknessKinds?: ShapeEdgeThicknessKind[],
        joinRadii?: number[],
        joinKinds?: ShapeJoinKind[],
        offset: number = 0,
    ) => {
        const vertexCount = vertices.length;

        if (vertexCount < 3) return { outer: "", inner: "" };

        const getThickness = (index: number) =>
            index < edgeThicknesses.length ? edgeThicknesses[index] : edgeThicknesses[edgeThicknesses.length - 1];

        const getRadius = (index: number) =>
            !joinRadii?.length ? 0 : index < joinRadii.length ? joinRadii[index] : joinRadii[joinRadii.length - 1];

        const getEdgeThicknessType = (index: number) =>
            !edgeThicknessKinds?.length
                ? "constant"
                : index < edgeThicknessKinds.length
                  ? edgeThicknessKinds[index]
                  : edgeThicknessKinds[edgeThicknessKinds.length - 1];

        const getJoinType = (index: number) =>
            !joinKinds?.length
                ? "round"
                : index < joinKinds.length
                  ? joinKinds[index]
                  : joinKinds[joinKinds.length - 1];

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
        const outerSweepFlags: number[] = [];
        const innerPathSegments: string[] = [];
        const innerEndPoints: Point2d[] = [];

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
            const currentJoinType = getJoinType(currIndex);
            const currentEdgeThicknessType = getEdgeThicknessType(currIndex);
            const crossProduct = prevTangent.x * currTangent.y - prevTangent.y * currTangent.x;
            const crossCheck = crossProduct || 0.001;

            // --- OUTER PATH GEOMETRY ---
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

            // --- INNER PATH GEOMETRY ---
            const arcThicknessPrev =
                currentEdgeThicknessType === "constant" ? prevThickness : Math.max(prevThickness, currThickness);
            const arcThicknessCurr =
                currentEdgeThicknessType === "constant" ? currThickness : Math.max(prevThickness, currThickness);
            const prevInnerRadius = outerRadius - arcThicknessPrev;
            const currInnerRadius = outerRadius - arcThicknessCurr;
            const innerRadius = outerRadius - Math.max(arcThicknessPrev, arcThicknessCurr);
            const prevInnerWallPt = {
                x: vertex.x - arcThicknessPrev * prevNormal.x,
                y: vertex.y - arcThicknessPrev * prevNormal.y,
            };
            const currInnerWallPt = {
                x: vertex.x - arcThicknessCurr * currNormal.x,
                y: vertex.y - arcThicknessCurr * currNormal.y,
            };
            const innerIntersectionScale =
                ((currInnerWallPt.x - prevInnerWallPt.x) * currTangent.y -
                    (currInnerWallPt.y - prevInnerWallPt.y) * currTangent.x) /
                crossCheck;
            const sharpInnerIntersection = {
                x: prevInnerWallPt.x + innerIntersectionScale * prevTangent.x,
                y: prevInnerWallPt.y + innerIntersectionScale * prevTangent.y,
            };

            let cornerString = "";
            let finalSegmentEnd = { x: 0, y: 0 };

            if (currentJoinType === "scoop") {
                const scoopRadius = outerRadius + Math.abs(arcThicknessPrev - arcThicknessCurr);
                const pA = {
                    x: prevInnerWallPt.x - scoopRadius * prevNormal.x,
                    y: prevInnerWallPt.y - scoopRadius * prevNormal.y,
                };
                const pB = {
                    x: currInnerWallPt.x - scoopRadius * currNormal.x,
                    y: currInnerWallPt.y - scoopRadius * currNormal.y,
                };
                const centerScale = ((pB.x - pA.x) * currTangent.y - (pB.y - pA.y) * currTangent.x) / crossCheck;
                const scoopCenter = {
                    x: pA.x + centerScale * prevTangent.x,
                    y: pA.y + centerScale * prevTangent.y,
                };
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
                finalSegmentEnd = scoopEnd;
            } else if (prevInnerRadius <= 0 || currInnerRadius <= 0) {
                cornerString = `L ${sharpInnerIntersection.x} ${sharpInnerIntersection.y}`;
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
                finalSegmentEnd = innerArcEnd;
            } else {
                const pA = {
                    x: prevInnerWallPt.x - innerRadius * prevNormal.x,
                    y: prevInnerWallPt.y - innerRadius * prevNormal.y,
                };
                const pB = {
                    x: currInnerWallPt.x - innerRadius * currNormal.x,
                    y: currInnerWallPt.y - innerRadius * currNormal.y,
                };
                const centerScale = ((pB.x - pA.x) * currTangent.y - (pB.y - pA.y) * currTangent.x) / crossCheck;
                const innerArcCenter = {
                    x: pA.x + centerScale * prevTangent.x,
                    y: pA.y + centerScale * prevTangent.y,
                };
                const innerArcStart = {
                    x: innerArcCenter.x + innerRadius * prevNormal.x,
                    y: innerArcCenter.y + innerRadius * prevNormal.y,
                };
                const innerArcEnd = {
                    x: innerArcCenter.x + innerRadius * currNormal.x,
                    y: innerArcCenter.y + innerRadius * currNormal.y,
                };

                cornerString = `L ${innerArcStart.x} ${innerArcStart.y} A ${innerRadius} ${innerRadius} 0 0 ${sweepFlag} ${innerArcEnd.x} ${innerArcEnd.y}`;
                finalSegmentEnd = innerArcEnd;
            }

            innerPathSegments.push(cornerString);
            innerEndPoints.push(finalSegmentEnd);
        }

        let outerPath = `M ${outerEndPoints[vertexCount - 1].x} ${outerEndPoints[vertexCount - 1].y}`;

        for (let i = 0; i < vertexCount; i++) {
            const currentJoinType = getJoinType(i);

            outerPath += ` L ${outerStartPoints[i].x} ${outerStartPoints[i].y}`;

            if (currentJoinType === "bevel") {
                outerPath += ` L ${outerEndPoints[i].x} ${outerEndPoints[i].y}`;
            } else {
                const sweep = currentJoinType === "scoop" ? (outerSweepFlags[i] === 1 ? 0 : 1) : outerSweepFlags[i];

                outerPath += ` A ${getRadius(i)} ${getRadius(i)} 0 0 ${sweep} ${outerEndPoints[i].x} ${outerEndPoints[i].y}`;
            }
        }

        const finalInnerEnd = innerEndPoints[vertexCount - 1];

        let innerPath = `M ${finalInnerEnd.x} ${finalInnerEnd.y}`;

        for (let i = 0; i < vertexCount; i++) {
            innerPath += " " + innerPathSegments[i];
        }

        return { outer: `${outerPath} Z`, inner: `${innerPath} Z` };
    };
}
