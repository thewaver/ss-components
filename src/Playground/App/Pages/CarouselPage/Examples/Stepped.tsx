import { Carousel } from "../../../../../Lib/Fundamentals/Carousel/Carousel";
import type { CarouselControls } from "../../../../../Lib/Fundamentals/Carousel/Carousel.types";
import {
    PageCarouselBar,
    PageCarouselPick,
    PageCarouselSlide,
    PageCarouselStep,
} from "../../../StyledComponents/CarouselContent/CarouselContent";
import type { CarouselExampleProps } from "../CarouselPage.types";

const CAROUSEL_GAP = 10;

type Props = CarouselExampleProps;

const renderBar = (controls: CarouselControls) => (
    <PageCarouselBar>
        {controls.renderStep("previous")}
        {Array.from({ length: controls.getCount() }, (_, index) => controls.renderPick(index))}
        {controls.renderStep("next")}
    </PageCarouselBar>
);

export const SteppedExample = (props: Props) => (
    <Carousel
        getSlides={props.getSlides}
        indexSignal={props.indexSignal}
        getIsDisabled={props.getIsDisabled}
        getGap={() => CAROUSEL_GAP}
        getAriaLabel={() => "Sampler"}
        renderSlide={(getSlide, getState) => <PageCarouselSlide getState={getState}>{getSlide()}</PageCarouselSlide>}
        renderStep={(_getStep, getFlags) => <PageCarouselStep getFlags={getFlags} />}
        renderPick={(_getIndex, getFlags) => <PageCarouselPick getFlags={getFlags} />}
        renderControls={renderBar}
    />
);
