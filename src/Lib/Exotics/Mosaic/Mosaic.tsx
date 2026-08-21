import { For, createMemo, createSignal } from "solid-js";

import type { Rect } from "@thewaver/ss-utils";

import { ElementObserver } from "../../Abstracts/ElementObserver/ElementObserver";
import type { MosaicPlacement, MosaicProps, MosaicSizeAnchor } from "./Mosaic.types";
import { MosaicUtils } from "./Mosaic.utils";

import * as styles from "./Mosaic.css";

const DEFAULT_MOSAIC_SIZE_ANCHOR: MosaicSizeAnchor = "width";
const DEFAULT_MOSAIC_GAP = 0;

const EMPTY_RECT: Rect = { x: 0, y: 0, width: 0, height: 0 };
const EMPTY_LAYOUT = { placements: [] as MosaicPlacement[], freeExtent: 0 };

const isSameOrder = (prev: number[], next: number[]) =>
    prev.length === next.length && prev.every((index, at) => index === next[at]);

export const Mosaic = (props: MosaicProps) => {
    const getSizeAnchor = createMemo(() => props.getSizeAnchor?.() ?? DEFAULT_MOSAIC_SIZE_ANCHOR);

    const getGap = createMemo(() => props.getGap?.() ?? DEFAULT_MOSAIC_GAP);

    const [getRootRef, setRootRef] = createSignal<HTMLElement>();

    const getRootSize = ElementObserver.createBorderBoxSizeObserver(getRootRef);

    const getAnchoredExtent = createMemo(() =>
        getSizeAnchor() === "width" ? getRootSize().width : getRootSize().height,
    );

    const getLayout = createMemo(() => {
        const sizes = props.getSizes();
        const anchoredExtent = getAnchoredExtent();

        if (anchoredExtent <= 0 || !sizes.length) return EMPTY_LAYOUT;

        const isTransposed = getSizeAnchor() === "height";

        const packed = MosaicUtils.sortIntoReadingOrder(
            props.computePlacements({
                sizes: isTransposed ? sizes.map(MosaicUtils.transposeSize) : sizes,
                anchoredExtent,
                gap: getGap(),
            }),
        );

        return {
            placements: isTransposed ? packed.map(MosaicUtils.transposePlacement) : packed,
            freeExtent: MosaicUtils.getFreeExtent(packed),
        };
    });

    const getRectByIndex = createMemo(
        () => new Map(getLayout().placements.map((placement) => [placement.index, placement as Rect])),
    );

    const getOrder = createMemo<number[], undefined>(
        () => {
            const placed = getLayout().placements.map((placement) => placement.index);
            const isPlaced = new Set(placed);

            return [...placed, ...props.getSizes().flatMap((_, index) => (isPlaced.has(index) ? [] : [index]))];
        },
        undefined,
        { equals: isSameOrder },
    );

    return (
        <div
            ref={setRootRef}
            class={styles.mosaicRoot}
            style={{
                width: getSizeAnchor() === "width" ? "100%" : `${getLayout().freeExtent}px`,
                height: getSizeAnchor() === "height" ? "100%" : `${getLayout().freeExtent}px`,
            }}
        >
            <For each={getOrder()}>
                {(index, getReadingIndex) => {
                    const getIsPlaced = createMemo(() => getRectByIndex().has(index));
                    const getRect = createMemo(() => getRectByIndex().get(index) ?? EMPTY_RECT);

                    return (
                        <div
                            class={styles.mosaicItem}
                            classList={{ [styles.mosaicSizedItem]: props.getIsItemSized() }}
                            style={{
                                left: `${getRect().x}px`,
                                top: `${getRect().y}px`,
                                width: props.getIsItemSized() ? `${getRect().width}px` : undefined,
                                height: props.getIsItemSized() ? `${getRect().height}px` : undefined,
                                visibility: getIsPlaced() ? undefined : "hidden",
                            }}
                        >
                            {props.renderItem(index, () => ({
                                index,
                                readingIndex: getReadingIndex(),
                                itemCount: props.getSizes().length,
                                rect: getRect(),
                            }))}
                        </div>
                    );
                }}
            </For>
        </div>
    );
};
