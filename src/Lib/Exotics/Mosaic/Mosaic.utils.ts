import type { Size2d } from "@thewaver/ss-utils";

import type { MosaicPackDefs, MosaicPlacement } from "./Mosaic.types";

type MosaicSkylineSegment = {
    x: number;
    width: number;
    y: number;
};

type MosaicSpot = {
    x: number;
    y: number;
};

const CUT_TOLERANCE_PX = 0.5;

const getSkylineTop = (skyline: MosaicSkylineSegment[], x: number, width: number) =>
    skyline.reduce(
        (top, segment) => (segment.x + segment.width <= x || segment.x >= x + width ? top : Math.max(top, segment.y)),
        0,
    );

const getLowestSpot = (skyline: MosaicSkylineSegment[], width: number, limit: number): MosaicSpot =>
    skyline
        .filter((segment) => segment.x + width <= limit)
        .map((segment) => ({ x: segment.x, y: getSkylineTop(skyline, segment.x, width) }))
        .reduce((lowest, spot) => (spot.y < lowest.y ? spot : lowest));

const withSkylineTop = (skyline: MosaicSkylineSegment[], x: number, width: number, top: number) => {
    const end = x + width;

    const split = skyline.flatMap((segment) => {
        if (segment.x + segment.width <= x || segment.x >= end) return [segment];

        const head = segment.x < x ? [{ x: segment.x, width: x - segment.x, y: segment.y }] : [];
        const tail =
            segment.x + segment.width > end ? [{ x: end, width: segment.x + segment.width - end, y: segment.y }] : [];

        return [...head, ...tail];
    });

    const sorted = [...split, { x, width, y: top }].sort((a, b) => a.x - b.x);
    const merged: MosaicSkylineSegment[] = [];

    for (const segment of sorted) {
        const last = merged[merged.length - 1];

        if (last && last.y === segment.y && last.x + last.width === segment.x) {
            last.width += segment.width;
        } else {
            merged.push({ ...segment });
        }
    }

    return merged;
};

type MosaicRow = {
    from: number;
    to: number;
};

type MosaicCell = {
    index: number;
    ratio: number;
};

const getRowExtent = (ratioSums: number[], row: MosaicRow, anchoredExtent: number, gap: number) => {
    const span = anchoredExtent - (row.to - row.from - 1) * gap;
    const ratioSum = ratioSums[row.to] - ratioSums[row.from];

    return span > 0 && ratioSum > 0 ? span / ratioSum : Infinity;
};

const getTotalExtent = (rows: MosaicRow[], ratioSums: number[], anchoredExtent: number, gap: number) =>
    rows.reduce((extent, row) => extent + getRowExtent(ratioSums, row, anchoredExtent, gap), 0) +
    (rows.length - 1) * gap;

const partitionIntoRows = (
    ratioSums: number[],
    rowCount: number,
    anchoredExtent: number,
    gap: number,
    targetRowExtent: number,
) => {
    const cellCount = ratioSums.length - 1;
    const cost = Array.from({ length: rowCount + 1 }, () => new Array<number>(cellCount + 1).fill(Infinity));
    const cut = Array.from({ length: rowCount + 1 }, () => new Array<number>(cellCount + 1).fill(0));

    cost[0][0] = 0;

    for (let row = 1; row <= rowCount; row++) {
        for (let end = row; end <= cellCount; end++) {
            for (let start = row - 1; start < end; start++) {
                if (cost[row - 1][start] === Infinity) continue;

                const extent = getRowExtent(ratioSums, { from: start, to: end }, anchoredExtent, gap);

                if (extent === Infinity) continue;

                const total = cost[row - 1][start] + (extent - targetRowExtent) ** 2;

                if (total >= cost[row][end]) continue;

                cost[row][end] = total;
                cut[row][end] = start;
            }
        }
    }

    if (cost[rowCount][cellCount] === Infinity) return undefined;

    const rows: MosaicRow[] = [];
    let end = cellCount;

    for (let row = rowCount; row > 0; row--) {
        const from = cut[row][end];

        rows.unshift({ from, to: end });
        end = from;
    }

    return rows;
};

const getBandStart = (placement: MosaicPlacement, isBanded: boolean) => (isBanded ? placement.y : placement.x);

const getBandEnd = (placement: MosaicPlacement, isBanded: boolean) =>
    isBanded ? placement.y + placement.height : placement.x + placement.width;

const splitIntoBands = (placements: MosaicPlacement[], isBanded: boolean) => {
    const sorted = [...placements].sort(
        (a, b) => getBandStart(a, isBanded) - getBandStart(b, isBanded) || a.index - b.index,
    );

    const bands: MosaicPlacement[][] = [];
    let frontier = -Infinity;

    for (const placement of sorted) {
        if (!bands.length || getBandStart(placement, isBanded) + CUT_TOLERANCE_PX >= frontier) {
            bands.push([]);
            frontier = -Infinity;
        }

        bands[bands.length - 1].push(placement);
        frontier = Math.max(frontier, getBandEnd(placement, isBanded));
    }

    return bands;
};

const compareByReadingCorner = (a: MosaicPlacement, b: MosaicPlacement) => a.y - b.y || a.x - b.x || a.index - b.index;

const cutIntoReadingOrder = (
    placements: MosaicPlacement[],
    isBanded: boolean,
    hasTriedBothAxes: boolean,
): MosaicPlacement[] => {
    if (placements.length < 2) return placements;

    const bands = splitIntoBands(placements, isBanded);

    if (bands.length > 1) return bands.flatMap((band) => cutIntoReadingOrder(band, !isBanded, false));

    if (hasTriedBothAxes) return [...placements].sort(compareByReadingCorner);

    return cutIntoReadingOrder(placements, !isBanded, true);
};

export namespace MosaicUtils {
    export const transposeSize = (size: Size2d): Size2d => ({ width: size.height, height: size.width });

    export const transposePlacement = (placement: MosaicPlacement): MosaicPlacement => ({
        index: placement.index,
        x: placement.y,
        y: placement.x,
        width: placement.height,
        height: placement.width,
    });

    export const getFreeExtent = (placements: MosaicPlacement[]) =>
        placements.reduce((extent, placement) => Math.max(extent, placement.y + placement.height), 0);

    export const packFixed = ({ sizes, anchoredExtent, gap }: MosaicPackDefs): MosaicPlacement[] => {
        const limit = anchoredExtent + gap;
        const cells = sizes
            .map((size, index) => ({ index, width: size.width + gap, height: size.height + gap }))
            .filter((cell) => cell.width > gap && cell.height > gap)
            .sort((a, b) => b.height - a.height || b.width - a.width || a.index - b.index);

        const placements: MosaicPlacement[] = [];
        let skyline: MosaicSkylineSegment[] = [{ x: 0, width: limit, y: 0 }];

        for (const cell of cells) {
            const reserved = Math.min(cell.width, limit);
            const spot = getLowestSpot(skyline, reserved, limit);

            placements.push({
                index: cell.index,
                x: spot.x,
                y: spot.y,
                width: cell.width - gap,
                height: cell.height - gap,
            });

            skyline = withSkylineTop(skyline, spot.x, reserved, spot.y + cell.height);
        }

        return placements;
    };

    export const packScaled = (
        { sizes, anchoredExtent, gap }: MosaicPackDefs,
        targetAspectRatio: Size2d,
    ): MosaicPlacement[] => {
        const cells: MosaicCell[] = sizes
            .map((size, index) => ({ index, ratio: size.height > 0 ? size.width / size.height : 0 }))
            .filter((cell) => cell.ratio > 0);

        if (!cells.length) return [];

        const ratioSums = cells.reduce((sums, cell) => [...sums, sums[sums.length - 1] + cell.ratio], [0]);

        const targetExtent =
            targetAspectRatio.width > 0
                ? (anchoredExtent * targetAspectRatio.height) / targetAspectRatio.width
                : anchoredExtent;

        let best: MosaicRow[] | undefined;
        let bestDistance = Infinity;

        for (let rowCount = 1; rowCount <= cells.length; rowCount++) {
            const targetRowExtent = Math.max(0, (targetExtent - (rowCount - 1) * gap) / rowCount);
            const rows = partitionIntoRows(ratioSums, rowCount, anchoredExtent, gap, targetRowExtent);

            if (!rows) continue;

            const extent = getTotalExtent(rows, ratioSums, anchoredExtent, gap);
            const distance = Math.abs(extent - targetExtent);

            if (distance < bestDistance) {
                best = rows;
                bestDistance = distance;
            }

            if (extent >= targetExtent) break;
        }

        if (!best) return [];

        const placements: MosaicPlacement[] = [];
        let y = 0;

        for (const row of best) {
            const extent = getRowExtent(ratioSums, row, anchoredExtent, gap);
            let x = 0;

            for (let at = row.from; at < row.to; at++) {
                const width = cells[at].ratio * extent;

                placements.push({ index: cells[at].index, x, y, width, height: extent });
                x += width + gap;
            }

            y += extent + gap;
        }

        return placements;
    };

    export const sortIntoReadingOrder = (placements: MosaicPlacement[]) => cutIntoReadingOrder(placements, true, false);
}
