import { describe, expect, it } from "vitest";

import type { PaginatorEntry } from "./Paginator.types";
import { PaginatorUtils } from "./Paginator.utils";

const DEFAULT_RANGE = { siblingCount: 1, boundaryCount: 1 };

const spell = (entries: PaginatorEntry[]) =>
    entries.map((entry) => (entry.kind === "page" ? String(entry.page) : `${entry.from}-${entry.to}`)).join(" ");

const entriesOf = (page: number, pageCount: number, range = DEFAULT_RANGE) =>
    spell(PaginatorUtils.getEntries(page, { ...range, pageCount }));

describe("getEntries", () => {
    it("lists every page when they all fit between the boundaries", () => {
        expect(entriesOf(3, 5)).toBe("1 2 3 4 5");
    });

    it("puts a gap on the far side when the current page sits at the start", () => {
        expect(entriesOf(1, 10)).toBe("1 2 3 4 5-9 10");
    });

    it("mirrors that when the current page sits at the end", () => {
        expect(entriesOf(10, 10)).toBe("1 2-6 7 8 9 10");
    });

    it("puts a gap either side once the current page is clear of both boundaries", () => {
        expect(entriesOf(5, 10)).toBe("1 2-3 4 5 6 7-9 10");
    });

    it("names the pages a gap stands for, rather than only that there are some", () => {
        const gap = PaginatorUtils.getEntries(5, { ...DEFAULT_RANGE, pageCount: 10 }).find(
            (entry) => entry.kind === "gap",
        );

        expect(gap).toEqual({ kind: "gap", from: 2, to: 3 });
    });

    it("spells a one-page gap as that page, since hiding one page behind an ellipsis saves nothing", () => {
        expect(entriesOf(4, 9)).toBe("1 2 3 4 5 6-8 9");
    });

    it("widens the window around the current page as the sibling count grows", () => {
        expect(entriesOf(10, 20, { siblingCount: 2, boundaryCount: 1 })).toBe("1 2-7 8 9 10 11 12 13-19 20");
    });

    it("pins more pages at each end as the boundary count grows", () => {
        expect(entriesOf(10, 20, { siblingCount: 1, boundaryCount: 2 })).toBe("1 2 3-8 9 10 11 12-18 19 20");
    });

    it("keeps only the window when there are no boundaries to pin", () => {
        expect(entriesOf(5, 10, { siblingCount: 1, boundaryCount: 0 })).toBe("1-3 4 5 6 7-10");
    });

    it("clamps a page beyond the end rather than producing a window past it", () => {
        expect(entriesOf(99, 10)).toBe(entriesOf(10, 10));
    });

    it("clamps a page below the first for the same reason", () => {
        expect(entriesOf(-4, 10)).toBe(entriesOf(1, 10));
    });

    it("has nothing to show when there are no pages", () => {
        expect(PaginatorUtils.getEntries(1, { ...DEFAULT_RANGE, pageCount: 0 })).toEqual([]);
    });

    it("shows the single page when that is all there is", () => {
        expect(entriesOf(1, 1)).toBe("1");
    });
});

describe("getStepTarget", () => {
    it("walks one page at a time in either direction", () => {
        expect(PaginatorUtils.getStepTarget("next", 4, 10)).toBe(5);
        expect(PaginatorUtils.getStepTarget("previous", 4, 10)).toBe(3);
    });

    it("jumps to either end", () => {
        expect(PaginatorUtils.getStepTarget("first", 4, 10)).toBe(1);
        expect(PaginatorUtils.getStepTarget("last", 4, 10)).toBe(10);
    });

    it("reports the page it is already on at each end, which is what makes the control disabled there", () => {
        expect(PaginatorUtils.getStepTarget("previous", 1, 10)).toBe(1);
        expect(PaginatorUtils.getStepTarget("next", 10, 10)).toBe(10);
    });
});
