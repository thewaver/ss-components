import type { Accessor, ParentProps } from "solid-js";

import type { MosaicItemState } from "../../../../Lib/Exotics/Mosaic/Mosaic.types";

export type PageMosaicTileProps = ParentProps<{
    getState: Accessor<MosaicItemState>;
    getWidth: Accessor<number>;
    getHeight: Accessor<number>;
}>;

export type PageMosaicLinkProps = ParentProps<{
    getHref: Accessor<string>;
    getCaption: Accessor<string>;
}>;
