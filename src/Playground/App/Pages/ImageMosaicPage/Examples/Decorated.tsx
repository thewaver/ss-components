import { ImageMosaic } from "../../../../../Lib/Exotics/ImageMosaic/ImageMosaic";
import { access } from "../../../../../Lib/Utils/propUtils";
import { MosaicImages } from "../../../Samples/MosaicImages/MosaicImages.const";
import { PageMosaicLink } from "../../../StyledComponents/MosaicContent/MosaicContent";
import type { ImageMosaicExampleProps } from "../ImageMosaicPage.types";

type Props = ImageMosaicExampleProps;

const IMAGE_MOSAIC_ROUTE = "/image-mosaic";

export const DecoratedExample = ({ shapeKey, ...otherProps }: Props) => {
    return (
        <ImageMosaic
            {...otherProps}
            targetAspectRatio={() => MosaicImages.SAMPLE_SHAPES[access(shapeKey)]}
            renderItem={(renderImage, getState) => (
                <PageMosaicLink
                    href={() => IMAGE_MOSAIC_ROUTE}
                    caption={() => `${getState().readingIndex + 1} of ${getState().itemCount}`}
                >
                    {renderImage()}
                </PageMosaicLink>
            )}
        />
    );
};
