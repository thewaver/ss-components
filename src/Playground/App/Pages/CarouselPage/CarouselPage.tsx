import { createMemo, createSignal } from "solid-js";

import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageCheckField, PageNumberField } from "../../StyledComponents/Field/Field";
import type { CarouselExampleProps } from "./CarouselPage.types";
import { NoControlsExample } from "./Examples/NoControls";
import { RotatingExample } from "./Examples/Rotating";
import { SteppedExample } from "./Examples/Stepped";

const MIN_SLIDE_COUNT = 1;
const MAX_SLIDE_COUNT = 8;
const SLIDE_COUNT_STEP = 1;
const STARTING_SLIDE_COUNT = 4;
const MIN_DELAY_MS = 500;
const MAX_DELAY_MS = 10_000;
const DELAY_STEP_MS = 500;
const STARTING_DELAY_MS = 2000;
const FIELD_WIDTH = 110;
const EXAMPLES_ROOT = "/src/Playground/App/Pages/CarouselPage/Examples";

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

    const getExamples = createMemo(() => {
        const commonProps: CarouselExampleProps = {
            slides: getSlides,
            isDisabled: getIsDisabled,
            indexSignal: manualIndexSignal,
        };

        return [
            {
                key: "manual",
                name: "Stepped by hand",
                readout: () =>
                    `slide ${manualIndexSignal[0]() + 1} of ${getSlideCount()} — stepping past either end wraps round, which is what separates this from the scroller`,
                component: () => <SteppedExample {...commonProps} />,
                path: `${EXAMPLES_ROOT}/Stepped.tsx`,
            },
            {
                key: "rotating",
                name: "Rotating on its own",
                readout: () =>
                    `slide ${rotatingIndexSignal[0]() + 1} of ${getSlideCount()} | ${rotatingPlayingSignal[0]() ? "playing" : "stopped"} — it holds while the pointer is over it, while anything inside it has focus, and while the tab is in the background`,
                component: () => (
                    <RotatingExample
                        {...commonProps}
                        indexSignal={rotatingIndexSignal}
                        playingSignal={rotatingPlayingSignal}
                        autoplayDelayMs={getDelayMs}
                    />
                ),
                path: `${EXAMPLES_ROOT}/Rotating.tsx`,
            },
            {
                key: "noControls",
                name: "No controls at all",
                readout: () =>
                    `slide ${barelessIndexSignal[0]() + 1} of ${getSlideCount()} — nothing is drawn beside the slides, so the surrounding page owns the buttons through the signal it shares`,
                component: () => <NoControlsExample {...commonProps} indexSignal={barelessIndexSignal} />,
                path: `${EXAMPLES_ROOT}/NoControls.tsx`,
            },
        ];
    });

    return (
        <>
            <PagePropsPanel scope={"global"}>
                <PageProp key={"slideCount"} label={"Slide count"}>
                    <PageNumberField
                        value={getSlideCount}
                        min={() => MIN_SLIDE_COUNT}
                        max={() => MAX_SLIDE_COUNT}
                        step={() => SLIDE_COUNT_STEP}
                        width={() => FIELD_WIDTH}
                        ariaLabel={"Slide count"}
                        onInput={setSlideCount}
                    />
                </PageProp>

                <PageProp key={"delayMs"} label={"Rotation delay"}>
                    <PageNumberField
                        value={getDelayMs}
                        min={() => MIN_DELAY_MS}
                        max={() => MAX_DELAY_MS}
                        step={() => DELAY_STEP_MS}
                        width={() => FIELD_WIDTH}
                        ariaLabel={"Rotation delay in milliseconds"}
                        onInput={setDelayMs}
                    />
                </PageProp>

                <PageProp key={"isDisabled"} label={"Disabled"}>
                    <PageCheckField value={getIsDisabled} ariaLabel={"Disabled"} onChange={setIsDisabled} />
                </PageProp>
            </PagePropsPanel>

            <PageExamples items={getExamples} />
        </>
    );
};
