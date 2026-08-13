import type { Accessor } from "solid-js";
import { createEffect, createMemo, createSignal, onMount } from "solid-js";

import { createVirtualizer, defaultRangeExtractor } from "@tanstack/solid-virtual";

import type { VirtualizerRowWindow, VirtualizerRowWindowOpts } from "./Virtualizer.types";

const SCROLLING_OVERFLOWS = new Set(["auto", "scroll", "overlay"]);

export namespace Virtualizer {
    /**
     * The scrolling element belongs to whoever painted the popup, so it is found rather than held: the walk
     * starts at an element the library owns and climbs until the computed `overflow-y` says the box scrolls.
     * A control cannot take a ref to it — the `max-height` and the `overflow-y` are in the consumer's paint,
     * and the consumer never sees the element the rows are mounted into.
     */
    export const createScrollParent = (getRef: Accessor<HTMLElement | undefined>, getIsEnabled: Accessor<boolean>) => {
        const [getScrollParent, setScrollParent] = createSignal<HTMLElement>();

        createEffect(() => {
            const ref = getRef();

            if (!ref || !getIsEnabled()) {
                setScrollParent(undefined);

                return;
            }

            let element = ref.parentElement;

            while (element) {
                if (SCROLLING_OVERFLOWS.has(getComputedStyle(element).overflowY)) break;

                element = element.parentElement;
            }

            setScrollParent(element ?? undefined);
        });

        return getScrollParent;
    };

    /**
     * A window onto a list too long to mount. Rows outside it are never built, so what the estimate buys is
     * the height of the scrollbar before anything has been measured — every row that is on screen is measured
     * for real, and the estimate is only ever consulted for rows nobody can see.
     */
    export const createRowWindow = (
        getRef: Accessor<HTMLElement | undefined>,
        getCount: Accessor<number>,
        opts: VirtualizerRowWindowOpts,
    ): VirtualizerRowWindow => {
        const getScrollParent = createScrollParent(getRef, opts.getIsEnabled);

        const [getScrollMargin, setScrollMargin] = createSignal(0);

        /**
         * Row offsets are measured from the top of the rows' own container, while a scroll position is measured
         * from the top of whatever is scrolling — and between the two sits however much padding and border the
         * consumer put on their popup. Without this every scroll target lands short by exactly that inset, which
         * reads as an arrow key that stops one option before the one it highlighted.
         *
         * The subtraction is done in layout space rather than on the raw rects: `Viewport` scales the page, so a
         * client rect is the layout value times that factor, and the factor is recovered from the scrolling
         * element's own two measurements of itself.
         */
        createEffect(() => {
            const ref = getRef();
            const scrollParent = getScrollParent();

            if (!ref || !scrollParent) {
                setScrollMargin(0);

                return;
            }

            const scrollParentRect = scrollParent.getBoundingClientRect();
            const scale = scrollParent.offsetHeight ? scrollParentRect.height / scrollParent.offsetHeight : 1;
            const inset = (ref.getBoundingClientRect().top - scrollParentRect.top) / (scale || 1);

            setScrollMargin(inset - scrollParent.clientTop + scrollParent.scrollTop);
        });

        const virtualizer = createVirtualizer({
            get count() {
                return getCount();
            },
            /**
             * Reading the scroll parent here rather than only inside `getScrollElement` is what makes the
             * virtualizer notice one arriving: the adapter re-reads the options from a computation, and a
             * function-valued option is never called during that read, so the dependency has to be taken by
             * something whose value is.
             */
            get enabled() {
                return opts.getIsEnabled() && getScrollParent() !== undefined;
            },
            get estimateSize() {
                return opts.computeEstimatedSize;
            },
            get scrollMargin() {
                return getScrollMargin();
            },
            /**
             * A pinned row is mounted whether or not it is in view. The caller needs this for any row something
             * else is pointing at — a highlight announced through `aria-activedescendant` names an element by
             * id, and scrolling to a row is not the same instant as mounting it, so without pinning the name
             * refers to nothing for as long as it takes the window to catch up.
             */
            get rangeExtractor() {
                const pinned = opts.getPinnedRows?.() ?? [];

                return (range: Parameters<typeof defaultRangeExtractor>[0]) =>
                    [...new Set([...pinned, ...defaultRangeExtractor(range)])].sort((a, b) => a - b);
            },
            getScrollElement: () => getScrollParent() ?? null,
            overscan: opts.getOverscan?.(),
        });

        const getRows = createMemo(() => (opts.getIsEnabled() ? virtualizer.getVirtualItems() : []));

        const getTotalSize = createMemo(() => (opts.getIsEnabled() ? virtualizer.getTotalSize() : 0));

        return {
            getIsLive: () => opts.getIsEnabled() && getScrollParent() !== undefined,
            getRows,
            getTotalSize,
            /**
             * A row reports where it sits in the scrolling element, and it is drawn inside a container that
             * already starts below that element's padding — so the inset comes back off again here. The total
             * size needs no such correction; it is reported net of the inset already.
             */
            getRowStart: (row) => row.start - getScrollMargin(),
            /**
             * The index is written onto the element here, and the measurement is deferred to mount, because
             * the measurer identifies a row by reading that attribute off the node it is handed. Solid runs a
             * `ref` while the element is still being built — before a dynamic attribute is on it and before it
             * is in the document — so measuring from the `ref` itself reads an unnamed, unlaid-out element and
             * silently keeps the estimate. React's adapter does not hit this because it runs refs after commit.
             */
            measureRow: (element, index) => {
                element.dataset.index = String(index);

                onMount(() => virtualizer.measureElement(element));
            },
            scrollToRow: (index) => virtualizer.scrollToIndex(index, { align: "auto" }),
        };
    };
}
