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

            // Calculate the true intersection point of inner parallel edge walls
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

            // If edge thickness swallows the radius, inner corner naturally sharpens to a single intersection point
            if (prevInnerRadius <= 0 || currInnerRadius <= 0) {
                cornerString = `L ${sharpInnerIntersection.x} ${sharpInnerIntersection.y}`;
                finalSegmentEnd = sharpInnerIntersection;
            } else if (currentJoinType === "bevel") {
                const innerArcStart = {
                    x: cornerArcCenter.x + prevInnerRadius * prevNormal.x,
                    y: cornerArcCenter.y + prevInnerRadius * prevNormal.y,
                };
                const innerArcEnd = {
                    x: cornerArcCenter.x + currInnerRadius * currNormal.x,
                    y: cornerArcCenter.y + currInnerRadius * currNormal.y,
                };
                cornerString = `L ${innerArcStart.x} ${innerArcStart.y} L ${innerArcEnd.x} ${innerArcEnd.y}`;
                finalSegmentEnd = innerArcEnd;
            } else if (currentJoinType === "scoop") {
                const chordMidpoint = {
                    x: (outerArcStart.x + outerArcEnd.x) * 0.5,
                    y: (outerArcStart.y + outerArcEnd.y) * 0.5,
                };
                const scoopCenter = {
                    x: 2 * chordMidpoint.x - cornerArcCenter.x,
                    y: 2 * chordMidpoint.y - cornerArcCenter.y,
                };
                const targetInnerRadius = outerRadius + (arcThicknessPrev + arcThicknessCurr) * 0.5;

                const toPrevStart = { x: prevInnerWallPt.x - scoopCenter.x, y: prevInnerWallPt.y - scoopCenter.y };
                const bPrev = toPrevStart.x * prevTangent.x + toPrevStart.y * prevTangent.y;
                const cPrev =
                    toPrevStart.x * toPrevStart.x +
                    toPrevStart.y * toPrevStart.y -
                    targetInnerRadius * targetInnerRadius;
                const sPrev = -bPrev - Math.sqrt(Math.max(0, bPrev * bPrev - cPrev));
                const scoopStart = {
                    x: prevInnerWallPt.x + sPrev * prevTangent.x,
                    y: prevInnerWallPt.y + sPrev * prevTangent.y,
                };

                const toCurrStart = { x: currInnerWallPt.x - scoopCenter.x, y: currInnerWallPt.y - scoopCenter.y };
                const bCurr = toCurrStart.x * currTangent.x + toCurrStart.y * currTangent.y;
                const cCurr =
                    toCurrStart.x * toCurrStart.x +
                    toCurrStart.y * toCurrStart.y -
                    targetInnerRadius * targetInnerRadius;
                const sCurr = -bCurr + Math.sqrt(Math.max(0, bCurr * bCurr - cCurr));
                const scoopEnd = {
                    x: currInnerWallPt.x + sCurr * currTangent.x,
                    y: currInnerWallPt.y + sCurr * currTangent.y,
                };

                const scoopSweep = sweepFlag === 1 ? 0 : 1;
                cornerString = `L ${scoopStart.x} ${scoopStart.y} A ${targetInnerRadius} ${targetInnerRadius} 0 0 ${scoopSweep} ${scoopEnd.x} ${scoopEnd.y}`;
                finalSegmentEnd = scoopEnd;
            } else {
                // "round" join handling
                const startAngle = Math.atan2(prevNormal.y, prevNormal.x);
                let endAngle = Math.atan2(currNormal.y, currNormal.x);

                if (sweepFlag === 1 && endAngle < startAngle) endAngle += Math.PI * 2;
                if (sweepFlag === 0 && endAngle > startAngle) endAngle -= Math.PI * 2;

                const steps = 16; // Increased resolution for smoother asymmetric curves
                const innerArcStart = {
                    x: cornerArcCenter.x + prevInnerRadius * prevNormal.x,
                    y: cornerArcCenter.y + prevInnerRadius * prevNormal.y,
                };
                cornerString = `L ${innerArcStart.x} ${innerArcStart.y}`;

                let lastPt = innerArcStart;
                for (let s = 1; s <= steps; s++) {
                    const t = s / steps;

                    // Using a smoothstep / cubic easing interpolation prevents the angular
                    // acceleration that causes the dimple artifact when thicknesses diverge.
                    const smoothT = t * t * (3 - 2 * t);

                    const currentAngle = startAngle + (endAngle - startAngle) * t;
                    const currentRadius = prevInnerRadius + (currInnerRadius - prevInnerRadius) * smoothT;

                    lastPt = {
                        x: cornerArcCenter.x + currentRadius * Math.cos(currentAngle),
                        y: cornerArcCenter.y + currentRadius * Math.sin(currentAngle),
                    };
                    cornerString += ` L ${lastPt.x} ${lastPt.y}`;
                }
                finalSegmentEnd = lastPt;
            }

            innerPathSegments.push(cornerString);
            innerEndPoints.push(finalSegmentEnd);
        }

        // Outer path generation
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

        // Inner path generation with explicitly safe start coordinates
        const finalInnerEnd = innerEndPoints[vertexCount - 1];
        let innerPath = `M ${finalInnerEnd.x} ${finalInnerEnd.y}`;
        for (let i = 0; i < vertexCount; i++) {
            innerPath += " " + innerPathSegments[i];
        }

        return { outer: `${outerPath} Z`, inner: `${innerPath} Z` };
    };
}
