import { For } from "solid-js";

import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { SpotlightGuide } from "../../../../../Lib/Fundamentals/SpotlightGuide/SpotlightGuide";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import {
    PageSpotlightPopup,
    PageSpotlightPopupActions,
    PageSpotlightPopupText,
} from "../../../StyledComponents/SpotlightPopup/SpotlightPopup";
import { PADDING, TOUR_STEPS, renderHighlight, renderOverlay } from "../SpotlightPage.const";
import type { SpotlightGuideExampleProps } from "../SpotlightPage.types";

import * as styles from "../SpotlightPage.css";

type Props = SpotlightGuideExampleProps;

export const GuideExample = (props: Props) => {
    const stepRefs: HTMLElement[] = [];

    const getIsLastStep = () => props.getStep() >= TOUR_STEPS.length - 1;

    return (
        <div class={styles.root}>
            <For each={TOUR_STEPS}>
                {(step, getIndex) => (
                    <div
                        ref={(element) => {
                            stepRefs[getIndex()] = element;
                        }}
                        class={styles.tourTarget}
                    >
                        {step.title}
                    </div>
                )}
            </For>

            <Button
                renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>Take the tour</PageButtonContent>}
                onClick={async () => {
                    props.onStart();
                    props.visibilitySignal[1](true);
                }}
            />

            <SpotlightGuide
                getElementRef={() => stepRefs[props.getStep()]}
                getPadding={() => PADDING}
                getAriaLabel={() => "Product tour"}
                visibilitySignal={props.visibilitySignal}
                renderHighlight={renderHighlight}
                renderOverlay={renderOverlay}
                renderPopup={(getVisibilityTarget, getTransitionDurationMs) => (
                    <PageSpotlightPopup
                        getVisibilityTarget={getVisibilityTarget}
                        getTransitionDurationMs={getTransitionDurationMs}
                        getTitle={() => TOUR_STEPS[props.getStep()].title}
                    >
                        <PageSpotlightPopupText>{TOUR_STEPS[props.getStep()].text}</PageSpotlightPopupText>

                        <PageSpotlightPopupActions>
                            <Button
                                renderContent={(getFlags) => (
                                    <PageButtonContent getFlags={getFlags}>Skip all</PageButtonContent>
                                )}
                                onClick={async () => props.onEnd("skipped")}
                            />

                            <Button
                                renderContent={(getFlags) => (
                                    <PageButtonContent getFlags={getFlags}>
                                        {getIsLastStep() ? "Done" : "Next"}
                                    </PageButtonContent>
                                )}
                                onClick={async () => {
                                    if (!getIsLastStep()) {
                                        props.onStepChange(props.getStep() + 1);

                                        return;
                                    }

                                    props.onEnd("finished");
                                }}
                            />
                        </PageSpotlightPopupActions>
                    </PageSpotlightPopup>
                )}
            />
        </div>
    );
};
