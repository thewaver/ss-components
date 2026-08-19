import { For, createMemo, createSignal } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Corners } from "../../../../Lib/Fundamentals/Corners/Corners";
import { SpotlightGuide } from "../../../../Lib/Fundamentals/SpotlightGuide/SpotlightGuide";
import { SpotlightHint } from "../../../../Lib/Fundamentals/SpotlightHint/SpotlightHint";
import { SpotlightPrompt } from "../../../../Lib/Fundamentals/SpotlightPrompt/SpotlightPrompt";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import {
    PageSpotlightPopup,
    PageSpotlightPopupActions,
    PageSpotlightPopupText,
} from "../../StyledComponents/SpotlightPopup/SpotlightPopup";

import * as styles from "./SpotlightPage.css";

const PADDING = 20;

const TOUR_STEPS = [
    { title: "This is a potato", text: "It sits here and does very little, which is most of its charm." },
    { title: "This one is a turnip", text: "It does the same, but with less enthusiasm and a worse aftertaste." },
];

const renderOverlay = (getVisibilityTarget: () => 0 | 1, getTransitionDurationMs: () => number) => (
    <div
        class={getVisibilityTarget() === 1 ? styles.overlayOn : styles.overlayOff}
        style={{
            transition: `background-color ${getTransitionDurationMs()}ms, backdrop-filter ${getTransitionDurationMs()}ms`,
        }}
    />
);

const renderHighlight = (getVisibilityTarget: () => 0 | 1) => (
    <Corners getColor={() => (getVisibilityTarget() === 1 ? "yellow" : "transparent")} />
);

export const SpotlightPage = () => {
    const hintRefs: HTMLElement[] = [];
    const tourRefs: HTMLElement[] = [];

    const [getHintIndex, setHintIndex] = createSignal(0);
    const [getPromptRef, setPromptRef] = createSignal<HTMLElement>();
    const [getStep, setStep] = createSignal(0);
    const [getBought, setBought] = createSignal(0);
    const [getFinished, setFinished] = createSignal("not started");

    const hintVisibility = createSignal(false);
    const promptVisibility = createSignal(false);
    const tourVisibility = createSignal(false);

    const endTour = (reason: string) => {
        tourVisibility[1](false);
        setFinished(reason);
    };

    const getVariants = createMemo(() => {
        return [
            {
                key: "hint",
                name: "Hint",
                readout: () => `open: ${hintVisibility[0]()} — a click anywhere or any real key puts it away`,
                component: () => (
                    <div class={styles.root}>
                        <For each={Array.from({ length: 2 }, (_, i) => i)}>
                            {(_, getIndex) => (
                                <div
                                    ref={(el) => {
                                        hintRefs[getIndex()] = el;
                                    }}
                                    class={styles.anchorWrapper}
                                    style={{ "animation-name": getIndex() === 0 ? styles.slideH : styles.slideV }}
                                >
                                    <Button
                                        onClick={async () => {
                                            setHintIndex(getIndex());
                                            hintVisibility[1]((prev) => !prev);
                                        }}
                                        renderContent={(getFlags) => (
                                            <PageButtonContent getFlags={getFlags}>Highlight Me</PageButtonContent>
                                        )}
                                    />
                                </div>
                            )}
                        </For>

                        <SpotlightHint
                            getElementRef={() => hintRefs[getHintIndex()]}
                            getPadding={() => PADDING}
                            visibilitySignal={hintVisibility}
                            renderHighlight={renderHighlight}
                            renderOverlay={renderOverlay}
                        />
                    </div>
                ),
            },
            {
                key: "prompt",
                name: "Prompt",
                readout: () => `bought: ${getBought()} — nothing else on the page answers until you do`,
                component: () => (
                    <div class={styles.root}>
                        <Button
                            ref={setPromptRef}
                            renderContent={(getFlags) => (
                                <PageButtonContent getFlags={getFlags}>Buy the potato</PageButtonContent>
                            )}
                            onClick={async () => {
                                if (!promptVisibility[0]()) return;

                                setBought((prev) => prev + 1);
                                promptVisibility[1](false);
                            }}
                        />

                        <Button
                            renderContent={(getFlags) => (
                                <PageButtonContent getFlags={getFlags}>Insist</PageButtonContent>
                            )}
                            onClick={async () => {
                                promptVisibility[1](true);
                            }}
                        />

                        <SpotlightPrompt
                            getElementRef={getPromptRef}
                            getPadding={() => PADDING}
                            visibilitySignal={promptVisibility}
                            renderHighlight={renderHighlight}
                            renderOverlay={renderOverlay}
                        />
                    </div>
                ),
            },
            {
                key: "guide",
                name: "Guide",
                readout: () => `step: ${getStep() + 1} of ${TOUR_STEPS.length} — ${getFinished()}`,
                component: () => (
                    <div class={styles.root}>
                        <For each={TOUR_STEPS}>
                            {(step, getIndex) => (
                                <div
                                    ref={(el) => {
                                        tourRefs[getIndex()] = el;
                                    }}
                                    class={styles.tourTarget}
                                >
                                    {step.title}
                                </div>
                            )}
                        </For>

                        <Button
                            renderContent={(getFlags) => (
                                <PageButtonContent getFlags={getFlags}>Take the tour</PageButtonContent>
                            )}
                            onClick={async () => {
                                setStep(0);
                                setFinished("running");
                                tourVisibility[1](true);
                            }}
                        />

                        <SpotlightGuide
                            getElementRef={() => tourRefs[getStep()]}
                            getPadding={() => PADDING}
                            getAriaLabel={() => "Product tour"}
                            visibilitySignal={tourVisibility}
                            renderHighlight={renderHighlight}
                            renderOverlay={renderOverlay}
                            renderPopup={(getVisibilityTarget, getTransitionDurationMs) => (
                                <PageSpotlightPopup
                                    getVisibilityTarget={getVisibilityTarget}
                                    getTransitionDurationMs={getTransitionDurationMs}
                                    getTitle={() => TOUR_STEPS[getStep()].title}
                                >
                                    <PageSpotlightPopupText>{TOUR_STEPS[getStep()].text}</PageSpotlightPopupText>

                                    <PageSpotlightPopupActions>
                                        <Button
                                            renderContent={(getFlags) => (
                                                <PageButtonContent getFlags={getFlags}>Skip all</PageButtonContent>
                                            )}
                                            onClick={async () => endTour("skipped")}
                                        />

                                        <Button
                                            renderContent={(getFlags) => (
                                                <PageButtonContent getFlags={getFlags}>
                                                    {getStep() < TOUR_STEPS.length - 1 ? "Next" : "Done"}
                                                </PageButtonContent>
                                            )}
                                            onClick={async () => {
                                                if (getStep() < TOUR_STEPS.length - 1) {
                                                    setStep((prev) => prev + 1);

                                                    return;
                                                }

                                                endTour("finished");
                                            }}
                                        />
                                    </PageSpotlightPopupActions>
                                </PageSpotlightPopup>
                            )}
                        />
                    </div>
                ),
            },
        ];
    });

    return <PageVariants getItems={getVariants} />;
};
