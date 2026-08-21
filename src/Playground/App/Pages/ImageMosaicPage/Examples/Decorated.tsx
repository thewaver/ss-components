import { ImageMosaic } from "../../../../../Lib/Exotics/ImageMosaic/ImageMosaic";
import { MosaicImages } from "../../../Samples/MosaicImages/MosaicImages.const";
import { PageMosaicLink } from "../../../StyledComponents/MosaicContent/MosaicContent";
import type { ImageMosaicExampleProps } from "../ImageMosaicPage.types";

type Props = ImageMosaicExampleProps;

const IMAGE_MOSAIC_ROUTE = "/image-mosaic";

export const DecoratedExample = ({ getShapeKey, ...otherProps }: Props) => {
    return (
        <ImageMosaic
            {...otherProps}
            getTargetAspectRatio={() => MosaicImages.SAMPLE_SHAPES[getShapeKey()]}
            renderItem={(renderImage, getState) => (
                <PageMosaicLink
                    getHref={() => IMAGE_MOSAIC_ROUTE}
                    getCaption={() => `${getState().readingIndex + 1} of ${getState().itemCount}`}
                >
                    {renderImage()}
                </PageMosaicLink>
            )}
        />
    );
};
