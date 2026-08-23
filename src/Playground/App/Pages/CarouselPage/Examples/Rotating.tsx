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

export const RotatingExample = (props: Props) => {
    return (
        <Carousel
            slides={props.slides}
            indexSignal={props.indexSignal}
            playingSignal={props.playingSignal}
            isDisabled={props.isDisabled}
            autoplayDelayMs={props.autoplayDelayMs}
            gap={() => CAROUSEL_GAP}
            ariaLabel={"Rotating sampler"}
            renderSlide={(getSlide, getState) => <PageCarouselSlide state={getState}>{getSlide()}</PageCarouselSlide>}
            renderStep={(_getStep, getFlags) => <PageCarouselStep flags={getFlags} />}
            renderPick={(_getIndex, getFlags) => <PageCarouselPick flags={getFlags} />}
            renderRotationControl={(getFlags) => <PageCarouselRotation flags={getFlags} />}
            renderControls={renderBar}
        />
    );
};
