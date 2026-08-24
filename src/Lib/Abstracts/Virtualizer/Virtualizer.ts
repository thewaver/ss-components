import type { Accessor } from "solid-js";
import { createEffect, createMemo, createSignal, onMount } from "solid-js";

import { createVirtualizer, defaultRangeExtractor, measureElement } from "@tanstack/solid-virtual";

import type { VirtualizerRowWindow, VirtualizerRowWindowOpts } from "./Virtualizer.types";

const SCROLLING_OVERFLOWS = new Set(["auto", "scroll", "overlay"]);

export namespace Virtualizer {
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

    export const createRowWindow = (
        getRef: Accessor<HTMLElement | undefined>,
        getCount: Accessor<number>,
        opts: VirtualizerRowWindowOpts,
    ): VirtualizerRowWindow => {
        const getScrollParent = createScrollParent(getRef, opts.getIsEnabled);

        const [getScrollMargin, setScrollMargin] = createSignal(0);

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
            get enabled() {
                return opts.getIsEnabled() && getScrollParent() !== undefined;
            },
            get estimateSize() {
                return opts.computeEstimatedSize;
            },
            get scrollMargin() {
                return getScrollMargin();
            },
            get rangeExtractor() {
                const pinned = opts.getPinnedRows?.() ?? [];

                return (range: Parameters<typeof defaultRangeExtractor>[0]) =>
                    [...new Set([...pinned, ...defaultRangeExtractor(range)])].sort((a, b) => a - b);
            },
            getScrollElement: () => getScrollParent() ?? null,
            measureElement: (element, entry, instance) => {
                const box = entry?.borderBoxSize?.[0];

                if (!box) return measureElement(element, entry, instance);

                return instance.options.horizontal ? box.inlineSize : box.blockSize;
            },
            overscan: opts.getOverscan?.(),
        });

        const getRows = createMemo(() => (opts.getIsEnabled() ? virtualizer.getVirtualItems() : []));

        const getTotalSize = createMemo(() => (opts.getIsEnabled() ? virtualizer.getTotalSize() : 0));

        return {
            getIsLive: () => opts.getIsEnabled() && getScrollParent() !== undefined,
            getRows,
            getTotalSize,
            getRowStart: (row) => row.start - getScrollMargin(),
            measureRow: (element, index) => {
                element.dataset.index = String(index);

                onMount(() => virtualizer.measureElement(element));
            },
            scrollToRow: (index) => virtualizer.scrollToIndex(index, { align: "auto" }),
        };
    };
}
