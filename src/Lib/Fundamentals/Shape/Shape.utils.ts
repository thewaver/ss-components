import type { Point2d } from "@thewaver/ss-utils";

export namespace ShapeUtils {
    export const getPaths = (pts: Point2d[], edgeThickness: number[], vertexRadius: number[]) => {
        const N = pts.length;

        if (N < 3) return { outer: "", inner: "" };

        const getThickness = (i: number) =>
            i < edgeThickness.length ? edgeThickness[i] : edgeThickness[edgeThickness.length - 1];

        const getRadius = (i: number) =>
            i < vertexRadius.length ? vertexRadius[i] : vertexRadius[vertexRadius.length - 1];

        const uVectors: Point2d[] = [];
        const nVectors: Point2d[] = [];

        const { cx, cy } = pts.reduce((res, cur) => ({ cx: res.cx + cur.x, cy: res.cy + cur.y }), { cx: 0, cy: 0 });
        const center = { x: cx / N, y: cy / N };

        for (let i = 0; i < N; i++) {
            const pCurr = pts[i];
            const pNext = pts[(i + 1) % N];
            const dx = pNext.x - pCurr.x;
            const dy = pNext.y - pCurr.y;
            const len = Math.hypot(dx, dy);
            const midX = (pCurr.x + pNext.x) * 0.5;
            const midY = (pCurr.y + pNext.y) * 0.5;
            const u = { x: dx / len, y: dy / len };
            uVectors.push(u);

            let n = { x: -u.y, y: u.x };

            if (n.x * (midX - center.x) + n.y * (midY - center.y) < 0) {
                n = { x: u.y, y: -u.x };
            }
            nVectors.push(n);
        }

        const outS: Point2d[] = [];
        const outE: Point2d[] = [];
        const inS: Point2d[] = [];
        const inE: Point2d[] = [];
        const sweepOuter: number[] = [];
        const hasArcIn: boolean[] = [];

        for (let i = 0; i < N; i++) {
            const prev = (i - 1 + N) % N;
            const curr = i;

            const pVertex = pts[i];
            const rArc = getRadius(i);
            const tPrev = getThickness(prev);
            const tCurr = getThickness(curr);

            const uPrev = uVectors[prev];
            const uCurr = uVectors[curr];
            const nPrev = nVectors[prev];
            const nCurr = nVectors[curr];

            const cross = uPrev.x * uCurr.y - uPrev.y * uCurr.x;

            const outOffsetPrev = 0;
            const outOffsetCurr = 0;
            const inOffsetPrev = tPrev;
            const inOffsetCurr = tCurr;
            const tMaxIn = Math.max(inOffsetPrev, inOffsetCurr);

            const b1 = {
                x: pVertex.x + (outOffsetPrev - rArc) * nPrev.x,
                y: pVertex.y + (outOffsetPrev - rArc) * nPrev.y,
            };
            const b2 = {
                x: pVertex.x + (outOffsetCurr - rArc) * nCurr.x,
                y: pVertex.y + (outOffsetCurr - rArc) * nCurr.y,
            };

            const alphaOut = ((b2.x - b1.x) * uCurr.y - (b2.y - b1.y) * uCurr.x) / cross;
            const arcCenter = { x: b1.x + alphaOut * uPrev.x, y: b1.y + alphaOut * uPrev.y };
            const startPtOut = { x: arcCenter.x + rArc * nPrev.x, y: arcCenter.y + rArc * nPrev.y };
            const endPtOut = { x: arcCenter.x + rArc * nCurr.x, y: arcCenter.y + rArc * nCurr.y };

            outS.push(startPtOut);
            outE.push(endPtOut);

            const v1 = { x: startPtOut.x - arcCenter.x, y: startPtOut.y - arcCenter.y };
            const v2 = { x: endPtOut.x - arcCenter.x, y: endPtOut.y - arcCenter.y };
            sweepOuter.push(v1.x * v2.y - v1.y * v2.x > 0 ? 1 : 0);

            const rIn = rArc - tMaxIn;

            if (rIn > 0) {
                const startPtIn = { x: arcCenter.x + rIn * nPrev.x, y: arcCenter.y + rIn * nPrev.y };
                const endPtIn = { x: arcCenter.x + rIn * nCurr.x, y: arcCenter.y + rIn * nCurr.y };

                inS.push(startPtIn);
                inE.push(endPtIn);
                hasArcIn.push(true);
            } else {
                const c1 = { x: pVertex.x - inOffsetPrev * nPrev.x, y: pVertex.y - inOffsetPrev * nPrev.y };
                const c2 = { x: pVertex.x - inOffsetCurr * nCurr.x, y: pVertex.y - inOffsetCurr * nCurr.y };
                const alphaIn = ((c2.x - c1.x) * uCurr.y - (c2.y - c1.y) * uCurr.x) / cross;
                const miterPt = { x: c1.x + alphaIn * uPrev.x, y: c1.y + alphaIn * uPrev.y };

                inS.push(miterPt);
                inE.push(miterPt);
                hasArcIn.push(false);
            }
        }

        let outerPath = `M ${outE[N - 1].x} ${outE[N - 1].y}`;

        for (let i = 0; i < N; i++) {
            outerPath += ` L ${outS[i].x} ${outS[i].y}`;
            outerPath += ` A ${getRadius(i)} ${getRadius(i)} 0 0 ${sweepOuter[i]} ${outE[i].x} ${outE[i].y}`;
        }

        let innerPath = `M ${inE[N - 1].x} ${inE[N - 1].y}`;

        for (let i = 0; i < N; i++) {
            innerPath += ` L ${inS[i].x} ${inS[i].y}`;

            if (hasArcIn[i]) {
                const prev = (i - 1 + N) % N;
                const inOffsetPrev = getThickness(prev);
                const inOffsetCurr = getThickness(i);
                const rIn = getRadius(i) - Math.max(inOffsetPrev, inOffsetCurr);

                innerPath += ` A ${rIn} ${rIn} 0 0 ${sweepOuter[i]} ${inE[i].x} ${inE[i].y}`;
            }
        }

        return { outer: `${outerPath} Z`, inner: `${innerPath} Z` };
    };
}
