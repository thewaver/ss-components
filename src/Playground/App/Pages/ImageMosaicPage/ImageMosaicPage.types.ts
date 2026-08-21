import type { MosaicImageSource, MosaicSizeAnchor } from "../../../../Lib/Exotics/Mosaic/Mosaic.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";
import type { MosaicImages } from "../../Samples/MosaicImages/MosaicImages.const";

export type ImageMosaicExampleProps = AccessorProps<{
    sources: MosaicImageSource[];
    gap: number;
    sizeAnchor: MosaicSizeAnchor;
    shapeKey: MosaicImages.SampleShapeKey;
}>;
