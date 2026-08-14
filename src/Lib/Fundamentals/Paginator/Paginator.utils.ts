import { MathUtils } from "@thewaver/ss-utils";

import type { PaginatorEntry, PaginatorRange, PaginatorStep } from "./Paginator.types";

const FIRST_PAGE = 1;

const getRange = (from: number, to: number) =>
    from > to ? [] : Array.from({ length: to - from + 1 }, (_, index) => from + index);

const toPages = (pages: number[]): PaginatorEntry[] => pages.map((page) => ({ kind: "page", page }));

const bridge = (from: number, to: number): PaginatorEntry[] => {
    if (to < from) return [];
    if (to === from) return [{ kind: "page", page: from }];

    return [{ kind: "gap", from, to }];
};

export namespace PaginatorUtils {
    export const getEntries = (page: number, range: PaginatorRange): PaginatorEntry[] => {
        const pageCount = Math.max(Math.trunc(range.pageCount), 0);

        if (pageCount < FIRST_PAGE) return [];

        const siblingCount = Math.max(Math.trunc(range.siblingCount), 0);
        const boundaryCount = Math.max(Math.trunc(range.boundaryCount), 0);
        const current = MathUtils.clamp(Math.trunc(page), FIRST_PAGE, pageCount);

        const startPages = getRange(FIRST_PAGE, Math.min(boundaryCount, pageCount));
        const endPages = getRange(Math.max(pageCount - boundaryCount + 1, boundaryCount + 1), pageCount);

        const firstFree = boundaryCount + 1;
        const lastFree = pageCount - boundaryCount;

        if (lastFree < firstFree) return toPages(getRange(FIRST_PAGE, pageCount));

        const width = siblingCount * 2 + 1;
        const siblingsStart = MathUtils.clamp(
            current - siblingCount,
            firstFree,
            Math.max(lastFree - width + 1, firstFree),
        );
        const siblingsEnd = Math.min(siblingsStart + width - 1, lastFree);

        return [
            ...toPages(startPages),
            ...bridge(firstFree, siblingsStart - 1),
            ...toPages(getRange(siblingsStart, siblingsEnd)),
            ...bridge(siblingsEnd + 1, lastFree),
            ...toPages(endPages),
        ];
    };

    export const getStepTarget = (step: PaginatorStep, page: number, pageCount: number) => {
        const last = Math.max(Math.trunc(pageCount), FIRST_PAGE);
        const current = MathUtils.clamp(Math.trunc(page), FIRST_PAGE, last);

        if (step === "first") return FIRST_PAGE;
        if (step === "last") return last;

        return MathUtils.clamp(step === "previous" ? current - 1 : current + 1, FIRST_PAGE, last);
    };
}
