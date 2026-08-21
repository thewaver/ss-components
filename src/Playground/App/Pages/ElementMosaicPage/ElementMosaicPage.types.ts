import type { MosaicSizeAnchor } from "../../../../Lib/Exotics/Mosaic/Mosaic.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type PageMosaicTileDefs = {
    name: string;
    width: number;
    height: number;
};

export type ElementMosaicExampleProps = AccessorProps<{
    items: PageMosaicTileDefs[];
    gap: number;
    sizeAnchor: MosaicSizeAnchor;
}>;
