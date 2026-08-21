import { ImageMosaic } from "../../../../../Lib/Exotics/ImageMosaic/ImageMosaic";
import { MosaicImages } from "../../../Samples/MosaicImages/MosaicImages.const";
import type { ImageMosaicExampleProps } from "../ImageMosaicPage.types";

type Props = ImageMosaicExampleProps;

export const DefaultExample = ({ getShapeKey, ...otherProps }: Props) => {
    return <ImageMosaic {...otherProps} getTargetAspectRatio={() => MosaicImages.SAMPLE_SHAPES[getShapeKey()]} />;
};
