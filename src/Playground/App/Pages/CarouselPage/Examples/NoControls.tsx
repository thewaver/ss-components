import { Carousel } from "../../../../../Lib/Fundamentals/Carousel/Carousel";
import { PageCarouselSlide } from "../../../StyledComponents/CarouselContent/CarouselContent";
import type { CarouselExampleProps } from "../CarouselPage.types";

type Props = CarouselExampleProps;

export const NoControlsExample = (props: Props) => (
    <Carousel
        getSlides={props.getSlides}
        indexSignal={props.indexSignal}
        getIsDisabled={props.getIsDisabled}
        getAriaLabel={() => "Bare sampler"}
        renderSlide={(getSlide, getState) => <PageCarouselSlide getState={getState}>{getSlide()}</PageCarouselSlide>}
    />
);
