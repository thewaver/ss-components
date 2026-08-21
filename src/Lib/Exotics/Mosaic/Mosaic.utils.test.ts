import { describe, expect, it } from "vitest";

import type { Size2d } from "@thewaver/ss-utils";

import type { MosaicPlacement } from "./Mosaic.types";
import { MosaicUtils } from "./Mosaic.utils";

const spell = (placements: MosaicPlacement[]) =>
    placements
        .map((placement) => `${placement.index}@${placement.x},${placement.y} ${placement.width}x${placement.height}`)
        .join(" | ");

const spellOrder = (placements: MosaicPlacement[]) => placements.map((placement) => placement.index).join(" ");

const pack = (sizes: Size2d[], anchoredExtent: number, gap: number) =>
    MosaicUtils.packFixed({ sizes, anchoredExtent, gap });

const at = (index: number, x: number, y: number, width: number, height: number): MosaicPlacement => ({
    index,
    x,
    y,
    width,
    height,
});

describe("packFixed", () => {
    it("puts a lone item in the corner", () => {
        expect(spell(pack([{ width: 100, height: 50 }], 200, 0))).toBe("0@0,0 100x50");
    });

    it("puts two items side by side with exactly the gap between them and none at the edges", () => {
        const packed = pack(
            [
                { width: 100, height: 50 },
                { width: 100, height: 50 },
            ],
            210,
            10,
        );

        expect(spell(packed)).toBe("0@0,0 100x50 | 1@110,0 100x50");
    });

    it("starts a new row when the next item will not fit, one gap below", () => {
        const packed = pack(
            [
                { width: 100, height: 50 },
                { width: 100, height: 50 },
                { width: 100, height: 50 },
            ],
            210,
            10,
        );

        expect(spell(packed)).toBe("0@0,0 100x50 | 1@110,0 100x50 | 2@0,60 100x50");
    });

    it("fills the hole beside a tall item rather than opening a row under it", () => {
        const packed = pack(
            [
                { width: 100, height: 100 },
                { width: 100, height: 40 },
                { width: 100, height: 40 },
            ],
            210,
            10,
        );

        expect(spell(packed)).toBe("0@0,0 100x100 | 1@110,0 100x40 | 2@110,50 100x40");
        expect(MosaicUtils.getFreeExtent(packed)).toBe(100);
    });

    it("places the tallest item first however the items were given", () => {
        const packed = pack(
            [
                { width: 100, height: 40 },
                { width: 100, height: 100 },
            ],
            210,
            10,
        );

        expect(spellOrder(packed)).toBe("1 0");
    });

    it("leaves out an item with no area, so nothing reserves a cell for it", () => {
        const packed = pack(
            [
                { width: 0, height: 0 },
                { width: 50, height: 50 },
            ],
            100,
            0,
        );

        expect(spell(packed)).toBe("1@0,0 50x50");
    });

    it("gives an item wider than the container its own row and lets it overhang", () => {
        const packed = pack(
            [
                { width: 300, height: 20 },
                { width: 50, height: 20 },
            ],
            100,
            0,
        );

        expect(spell(packed)).toBe("0@0,0 300x20 | 1@0,20 50x20");
    });
});

describe("sortIntoReadingOrder", () => {
    it("reads two rows left to right, top row first", () => {
        const packed = pack(
            Array.from({ length: 4 }, () => ({ width: 100, height: 50 })),
            210,
            10,
        );

        expect(spellOrder(MosaicUtils.sortIntoReadingOrder(packed))).toBe("0 1 2 3");
    });

    it("reads a tall item before the two stacked beside it, because the cut falls between the columns", () => {
        const packed = [at(7, 0, 0, 100, 100), at(8, 110, 0, 100, 40), at(9, 110, 50, 100, 40)];

        expect(spellOrder(MosaicUtils.sortIntoReadingOrder(packed))).toBe("7 8 9");
    });

    it("reads by corner when neither axis has a clear line to cut on", () => {
        const packed = [at(1, 0, 50, 100, 20), at(2, 40, 0, 20, 100)];

        expect(spellOrder(MosaicUtils.sortIntoReadingOrder(packed))).toBe("2 1");
    });

    it("keeps a single item as it is", () => {
        expect(spellOrder(MosaicUtils.sortIntoReadingOrder([at(3, 10, 10, 5, 5)]))).toBe("3");
    });
});

describe("transposePlacement", () => {
    it("swaps the axes so a layout packed sideways reads back the right way round", () => {
        expect(spell([MosaicUtils.transposePlacement(at(2, 10, 20, 30, 40))])).toBe("2@20,10 40x30");
    });
});

describe("getFreeExtent", () => {
    it("is the lowest edge any item reaches", () => {
        expect(MosaicUtils.getFreeExtent([at(0, 0, 0, 10, 30), at(1, 20, 10, 10, 15)])).toBe(30);
    });

    it("is nothing when there is nothing placed", () => {
        expect(MosaicUtils.getFreeExtent([])).toBe(0);
    });
});

const RATIOS: Size2d[] = [
    { width: 1600, height: 900 },
    { width: 900, height: 1600 },
    { width: 1200, height: 1200 },
    { width: 1500, height: 1000 },
    { width: 1000, height: 1500 },
    { width: 2000, height: 800 },
    { width: 800, height: 1000 },
];

const ANCHORED_EXTENT = 600;
const SCALED_GAP = 12;
const SQUARE: Size2d = { width: 1, height: 1 };

const scale = (targetAspectRatio: Size2d, sizes = RATIOS, anchoredExtent = ANCHORED_EXTENT, gap = SCALED_GAP) =>
    MosaicUtils.packScaled({ sizes, anchoredExtent, gap }, targetAspectRatio);

const rowsOf = (placements: MosaicPlacement[]) => {
    const byTop = new Map<number, MosaicPlacement[]>();

    for (const placement of placements) {
        const top = Math.round(placement.y);

        byTop.set(top, [...(byTop.get(top) ?? []), placement]);
    }

    return [...byTop.values()];
};

describe("packScaled", () => {
    it("gives a lone pair a row each when a square is what was asked for", () => {
        const packed = scale(
            SQUARE,
            [
                { width: 200, height: 100 },
                { width: 200, height: 100 },
            ],
            210,
            10,
        );

        expect(spell(packed)).toBe("0@0,0 210x105 | 1@0,115 210x105");
    });

    it("puts the same pair side by side when the target shape is twice as wide as it is tall", () => {
        const packed = scale(
            { width: 2, height: 1 },
            [
                { width: 200, height: 100 },
                { width: 200, height: 100 },
            ],
            210,
            10,
        );

        expect(spell(packed)).toBe("0@0,0 100x50 | 1@110,0 100x50");
    });

    it("fills the anchored side exactly on every row, gaps included", () => {
        const spans = rowsOf(scale(SQUARE)).map((row) =>
            Math.round(row.reduce((span, placement) => span + placement.width, 0) + (row.length - 1) * SCALED_GAP),
        );

        expect(spans).toEqual(spans.map(() => ANCHORED_EXTENT));
    });

    it("keeps every image its own shape while it resizes them", () => {
        const distorted = scale(SQUARE).filter((placement) => {
            const source = RATIOS[placement.index];

            return Math.abs(placement.width / placement.height - source.width / source.height) > 0.001;
        });

        expect(distorted).toEqual([]);
    });

    it("takes more rows for a tall target shape than for a wide one", () => {
        expect(rowsOf(scale({ width: 1, height: 3 })).length).toBeGreaterThan(
            rowsOf(scale({ width: 3, height: 1 })).length,
        );
    });

    it("lands nearer the target shape than the row count either side of it would", () => {
        const packed = scale(SQUARE);
        const extent = MosaicUtils.getFreeExtent(packed);

        expect(Math.abs(extent - ANCHORED_EXTENT)).toBeLessThan(ANCHORED_EXTENT / 2);
    });

    it("leaves out an image whose size is not known yet", () => {
        const packed = scale(
            SQUARE,
            [
                { width: 0, height: 0 },
                { width: 100, height: 100 },
            ],
            100,
            0,
        );

        expect(spell(packed)).toBe("1@0,0 100x100");
    });
});
