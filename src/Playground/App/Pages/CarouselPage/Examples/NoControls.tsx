import { Carousel } from "../../../../../Lib/Fundamentals/Carousel/Carousel";
import { PageCarouselSlide } from "../../../StyledComponents/CarouselContent/CarouselContent";
import type { CarouselExampleProps } from "../CarouselPage.types";

type Props = CarouselExampleProps;

export const NoControlsExample = (props: Props) => {
    return (
        <Carousel
            slides={props.slides}
            indexSignal={props.indexSignal}
            isDisabled={props.isDisabled}
            ariaLabel={"Bare sampler"}
            renderSlide={(getSlide, getState) => <PageCarouselSlide state={getState}>{getSlide()}</PageCarouselSlide>}
        />
    );
};
