import { createMemo, createSignal } from "solid-js";

import { Carousel } from "../../../../Lib/Fundamentals/Carousel/Carousel";
import type { CarouselControls } from "../../../../Lib/Fundamentals/Carousel/Carousel.types";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import {
    PageCarouselBar,
    PageCarouselPick,
    PageCarouselRotation,
    PageCarouselSlide,
    PageCarouselStep,
} from "../../StyledComponents/CarouselContent/CarouselContent";
import { PageCheckField, PageNumberField } from "../../StyledComponents/Field/Field";

const MIN_SLIDE_COUNT = 1;
const MAX_SLIDE_COUNT = 8;
const SLIDE_COUNT_STEP = 1;
const STARTING_SLIDE_COUNT = 4;
const MIN_DELAY_MS = 500;
const MAX_DELAY_MS = 10_000;
const DELAY_STEP_MS = 500;
const STARTING_DELAY_MS = 2000;
const CAROUSEL_GAP = 10;
const FIELD_WIDTH = 110;

const TITLES = ["Aurora", "Basalt", "Cinder", "Drift", "Ember", "Fathom", "Glimmer", "Hollow"];

export const CarouselPage = () => {
    const [getSlideCount, setSlideCount] = createSignal(STARTING_SLIDE_COUNT);
    const [getDelayMs, setDelayMs] = createSignal(STARTING_DELAY_MS);
    const [getIsDisabled, setIsDisabled] = createSignal(false);

    const manualIndexSignal = createSignal(0);
    const rotatingIndexSignal = createSignal(0);
    const rotatingPlayingSignal = createSignal(true);
    const barelessIndexSignal = createSignal(0);

    const getSlides = createMemo(() => TITLES.slice(0, getSlideCount()));

    const makeBar = (hasRotation: boolean) => (controls: CarouselControls) => (
        <PageCarouselBar>
            {hasRotation && controls.renderRotationControl()}
            {controls.renderStep("previous")}
            {Array.from({ length: controls.getCount() }, (_, index) => controls.renderPick(index))}
            {controls.renderStep("next")}
        </PageCarouselBar>
    );

    const getVariants = createMemo(() => {
        return [
            {
                key: "manual",
                name: "Stepped by hand",
                readout: () =>
                    `slide ${manualIndexSignal[0]() + 1} of ${getSlideCount()} — stepping past either end wraps round, which is what separates this from the scroller`,
                component: () => (
                    <Carousel
                        getSlides={getSlides}
                        indexSignal={manualIndexSignal}
                        getIsDisabled={getIsDisabled}
                        getGap={() => CAROUSEL_GAP}
                        getAriaLabel={() => "Sampler"}
                        renderSlide={(getSlide, getState) => (
                            <PageCarouselSlide getState={getState}>{getSlide()}</PageCarouselSlide>
                        )}
                        renderStep={(_getStep, getFlags) => <PageCarouselStep getFlags={getFlags} />}
                        renderPick={(_getIndex, getFlags) => <PageCarouselPick getFlags={getFlags} />}
                        renderControls={makeBar(false)}
                    />
                ),
            },
            {
                key: "rotating",
                name: "Rotating on its own",
                readout: () =>
                    `slide ${rotatingIndexSignal[0]() + 1} of ${getSlideCount()} | ${rotatingPlayingSignal[0]() ? "playing" : "stopped"} — it holds while the pointer is over it, while anything inside it has focus, and while the tab is in the background`,
                component: () => (
                    <Carousel
                        getSlides={getSlides}
                        indexSignal={rotatingIndexSignal}
                        playingSignal={rotatingPlayingSignal}
                        getIsDisabled={getIsDisabled}
                        getAutoplayDelayMs={getDelayMs}
                        getGap={() => CAROUSEL_GAP}
                        getAriaLabel={() => "Rotating sampler"}
                        renderSlide={(getSlide, getState) => (
                            <PageCarouselSlide getState={getState}>{getSlide()}</PageCarouselSlide>
                        )}
                        renderStep={(_getStep, getFlags) => <PageCarouselStep getFlags={getFlags} />}
                        renderPick={(_getIndex, getFlags) => <PageCarouselPick getFlags={getFlags} />}
                        renderRotationControl={(getFlags) => <PageCarouselRotation getFlags={getFlags} />}
                        renderControls={makeBar(true)}
                    />
                ),
            },
            {
                key: "noControls",
                name: "No controls at all",
                readout: () =>
                    `slide ${barelessIndexSignal[0]() + 1} of ${getSlideCount()} — nothing is drawn beside the slides, so the surrounding page owns the buttons through the signal it shares`,
                component: () => (
                    <Carousel
                        getSlides={getSlides}
                        indexSignal={barelessIndexSignal}
                        getIsDisabled={getIsDisabled}
                        getAriaLabel={() => "Bare sampler"}
                        renderSlide={(getSlide, getState) => (
                            <PageCarouselSlide getState={getState}>{getSlide()}</PageCarouselSlide>
                        )}
                    />
                ),
            },
        ];
    });

    return (
        <>
            <PagePropsPanel getScope={() => "global"}>
                <PageProp getKey={() => "slideCount"} getLabel={() => "Slide count"}>
                    <PageNumberField
                        getValue={getSlideCount}
                        getMin={() => MIN_SLIDE_COUNT}
                        getMax={() => MAX_SLIDE_COUNT}
                        getStep={() => SLIDE_COUNT_STEP}
                        getWidth={() => FIELD_WIDTH}
                        getAriaLabel={() => "Slide count"}
                        onInput={setSlideCount}
                    />
                </PageProp>

                <PageProp getKey={() => "delayMs"} getLabel={() => "Rotation delay"}>
                    <PageNumberField
                        getValue={getDelayMs}
                        getMin={() => MIN_DELAY_MS}
                        getMax={() => MAX_DELAY_MS}
                        getStep={() => DELAY_STEP_MS}
                        getWidth={() => FIELD_WIDTH}
                        getAriaLabel={() => "Rotation delay in milliseconds"}
                        onInput={setDelayMs}
                    />
                </PageProp>

                <PageProp getKey={() => "isDisabled"} getLabel={() => "Disabled"}>
                    <PageCheckField getValue={getIsDisabled} getAriaLabel={() => "Disabled"} onChange={setIsDisabled} />
                </PageProp>
            </PagePropsPanel>

            <PageVariants getItems={getVariants} />
        </>
    );
};
