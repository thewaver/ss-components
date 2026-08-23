import { For } from "solid-js";

import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { SpotlightGuide } from "../../../../../Lib/Fundamentals/SpotlightGuide/SpotlightGuide";
import { access } from "../../../../../Lib/Utils/propUtils";
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

    const getIsLastStep = () => access(props.step) >= TOUR_STEPS.length - 1;

    return (
        <div class={styles.root}>
            <div class={styles.tourStrip} data-scroll-box>
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
            </div>

            <Button
                renderContent={(getFlags) => <PageButtonContent flags={getFlags}>Take the tour</PageButtonContent>}
                onClick={async () => {
                    props.onStart();
                    props.visibilitySignal[1](true);
                }}
            />

            <SpotlightGuide
                elementRef={() => stepRefs[access(props.step)]}
                padding={() => PADDING}
                ariaLabel={"Product tour"}
                visibilitySignal={props.visibilitySignal}
                renderHighlight={renderHighlight}
                renderOverlay={renderOverlay}
                renderPopup={(getVisibilityTarget, getTransitionDurationMs) => (
                    <PageSpotlightPopup
                        visibilityTarget={getVisibilityTarget}
                        transitionDurationMs={getTransitionDurationMs}
                        title={() => TOUR_STEPS[access(props.step)].title}
                    >
                        <PageSpotlightPopupText>{TOUR_STEPS[access(props.step)].text}</PageSpotlightPopupText>

                        <PageSpotlightPopupActions>
                            <Button
                                renderContent={(getFlags) => (
                                    <PageButtonContent flags={getFlags}>Skip all</PageButtonContent>
                                )}
                                onClick={async () => props.onEnd("skipped")}
                            />

                            <Button
                                renderContent={(getFlags) => (
                                    <PageButtonContent flags={getFlags}>
                                        {getIsLastStep() ? "Done" : "Next"}
                                    </PageButtonContent>
                                )}
                                onClick={async () => {
                                    if (!getIsLastStep()) {
                                        props.onStepChange(access(props.step) + 1);

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
