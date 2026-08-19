import { Carousel } from "../../../../../Lib/Fundamentals/Carousel/Carousel";
import type { CarouselControls } from "../../../../../Lib/Fundamentals/Carousel/Carousel.types";
import {
    PageCarouselBar,
    PageCarouselPick,
    PageCarouselRotation,
    PageCarouselSlide,
    PageCarouselStep,
} from "../../../StyledComponents/CarouselContent/CarouselContent";
import type { CarouselExampleProps } from "../CarouselPage.types";

const CAROUSEL_GAP = 10;

type Props = CarouselExampleProps;

const renderBar = (controls: CarouselControls) => (
    <PageCarouselBar>
        {controls.renderRotationControl()}
        {controls.renderStep("previous")}
        {Array.from({ length: controls.getCount() }, (_, index) => controls.renderPick(index))}
        {controls.renderStep("next")}
    </PageCarouselBar>
);

export const RotatingExample = (props: Props) => (
    <Carousel
        getSlides={props.getSlides}
        indexSignal={props.indexSignal}
        playingSignal={props.playingSignal}
        getIsDisabled={props.getIsDisabled}
        getAutoplayDelayMs={props.getAutoplayDelayMs}
        getGap={() => CAROUSEL_GAP}
        getAriaLabel={() => "Rotating sampler"}
        renderSlide={(getSlide, getState) => <PageCarouselSlide getState={getState}>{getSlide()}</PageCarouselSlide>}
        renderStep={(_getStep, getFlags) => <PageCarouselStep getFlags={getFlags} />}
        renderPick={(_getIndex, getFlags) => <PageCarouselPick getFlags={getFlags} />}
        renderRotationControl={(getFlags) => <PageCarouselRotation getFlags={getFlags} />}
        renderControls={renderBar}
    />
);
