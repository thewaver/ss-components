import type { MosaicItemState } from "../../../../Lib/Exotics/Mosaic/Mosaic.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type PageMosaicTileProps = AccessorProps<{
    state: MosaicItemState;
    width: number;
    height: number;
}>;

export type PageMosaicLinkProps = AccessorProps<{
    href: string;
    caption: string;
}>;
