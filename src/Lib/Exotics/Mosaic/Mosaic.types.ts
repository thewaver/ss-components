import type { Accessor, JSX } from "solid-js";

import type { Rect, Size2d } from "@thewaver/ss-utils";

import type { AccessorProps, MaybeAccessor } from "../../Utils/typeUtils";

export type MosaicSizeAnchor = "width" | "height";

export type MosaicPlacement = Rect & {
    index: number;
};

export type MosaicPackDefs = {
    sizes: Size2d[];
    anchoredExtent: number;
    gap: number;
};

export type MosaicItemState = {
    index: number;
    readingIndex: number;
    itemCount: number;
    rect: Rect;
};

export type MosaicState = {
    sizeAnchor?: MosaicSizeAnchor;
    gap?: number;
};

export type MosaicProps = AccessorProps<MosaicState & { isItemSized: boolean }> & {
    sizes: MaybeAccessor<Size2d[]>;
    computePlacements: (defs: MosaicPackDefs) => MosaicPlacement[];
    renderItem: (index: number, getState: Accessor<MosaicItemState>) => JSX.Element;
};

export type MosaicImageSource = {
    src: string;
    alt: string;
};

export type ImageMosaicProps = AccessorProps<
    MosaicState & {
        sources: MosaicImageSource[];
        targetAspectRatio?: Size2d;
        renderItem?: (renderImage: () => JSX.Element, getState: Accessor<MosaicItemState>) => JSX.Element;
    }
>;

export type ElementMosaicProps<T> = AccessorProps<MosaicState> & {
    items: MaybeAccessor<T[]>;
    renderItem: (getItem: Accessor<T>, getState: Accessor<MosaicItemState>) => JSX.Element;
};
