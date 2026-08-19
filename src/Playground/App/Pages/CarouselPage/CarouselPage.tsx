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
            getSlides,
            getIsDisabled,
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
                        getAutoplayDelayMs={getDelayMs}
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

            <PageExamples getItems={getExamples} />
        </>
    );
};
