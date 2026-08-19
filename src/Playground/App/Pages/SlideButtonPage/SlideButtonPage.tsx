import { createMemo, createSignal } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { SlideButton } from "../../../../Lib/Fundamentals/SlideButton/SlideButton";
import { PageControlColumn } from "../../PageComponents/ControlRow/ControlRow";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import { PageSlideButtonContent } from "../../StyledComponents/SlideButtonContent/SlideButtonContent";
import { PageTooltipContent } from "../../StyledComponents/TooltipContent/TooltipContent";

import { SLIDE_BUTTON_THUMB_SIZE } from "../../StyledComponents/SlideButtonContent/SlideButtonContent.css";

export const SlideButtonPage = () => {
    const [getSends, setSends] = createSignal(0);
    const [getIsArmed, setIsArmed] = createSignal(false);
    const [getDisabledSends, setDisabledSends] = createSignal(0);
    const [getReachableSends, setReachableSends] = createSignal(0);
    const [getHasError, setHasError] = createSignal(true);

    const getVariants = createMemo(() => {
        return [
            {
                key: "default",
                name: "Default",
                readout: () => `activations: ${getSends()}`,
                component: () => (
                    <SlideButton
                        getThumbSize={() => SLIDE_BUTTON_THUMB_SIZE}
                        renderContent={(getFlags) => (
                            <PageSlideButtonContent getFlags={getFlags}>Slide or hold to send</PageSlideButtonContent>
                        )}
                        onActivate={async () => {
                            setSends((prev) => prev + 1);
                        }}
                    />
                ),
            },
            {
                key: "held",
                name: "Held at the end by the owner",
                readout: () => `armed: ${getIsArmed()}`,
                component: () => (
                    <PageControlColumn>
                        <SlideButton
                            getIsPressed={getIsArmed}
                            getThumbSize={() => SLIDE_BUTTON_THUMB_SIZE}
                            renderContent={(getFlags) => (
                                <PageSlideButtonContent getFlags={getFlags}>
                                    Slide or hold to arm
                                </PageSlideButtonContent>
                            )}
                            onActivate={async () => {
                                setIsArmed(true);
                            }}
                        />

                        <Button
                            getIsDisabled={() => !getIsArmed()}
                            renderContent={(getFlags) => (
                                <PageButtonContent getFlags={getFlags}>Reset</PageButtonContent>
                            )}
                            onClick={async () => {
                                setIsArmed(false);
                            }}
                        />
                    </PageControlColumn>
                ),
            },
            {
                key: "disabled",
                name: "Disabled",
                readout: () => `activations: ${getDisabledSends()}`,
                component: () => (
                    <SlideButton
                        getIsDisabled={() => true}
                        getThumbSize={() => SLIDE_BUTTON_THUMB_SIZE}
                        renderContent={(getFlags) => (
                            <PageSlideButtonContent getFlags={getFlags}>Slide or hold to send</PageSlideButtonContent>
                        )}
                        onActivate={async () => {
                            setDisabledSends((prev) => prev + 1);
                        }}
                    />
                ),
            },
            {
                key: "reachable",
                name: "Disabled + reachable",
                readout: () => `activations: ${getReachableSends()}`,
                component: () => (
                    <SlideButton
                        getIsDisabled={() => true}
                        getIsReachableWhenDisabled={() => true}
                        getThumbSize={() => SLIDE_BUTTON_THUMB_SIZE}
                        renderContent={(getFlags) => (
                            <PageSlideButtonContent getFlags={getFlags}>Slide or hold to send</PageSlideButtonContent>
                        )}
                        getTooltipDefs={() => ({
                            getPlacement: () => ({ x: "center", y: "top-out" }),
                            getOffset: () => ({ x: 0, y: 5 }),
                            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                                <PageTooltipContent
                                    getVisibilityTarget={getVisibilityTarget}
                                    getTransitionDurationMs={getTransitionDurationMs}
                                >
                                    Focusable so this tooltip can be read, but neither a drag nor a held Enter may leave
                                    the count above zero.
                                </PageTooltipContent>
                            ),
                        })}
                        onActivate={async () => {
                            setReachableSends((prev) => prev + 1);
                        }}
                    />
                ),
            },
            {
                key: "errored",
                name: "Error",
                readout: () => `hasError: ${getHasError()}`,
                component: () => (
                    <SlideButton
                        getHasError={getHasError}
                        getThumbSize={() => SLIDE_BUTTON_THUMB_SIZE}
                        renderContent={(getFlags) => (
                            <PageSlideButtonContent getFlags={getFlags}>Slide or hold to retry</PageSlideButtonContent>
                        )}
                        onActivate={async () => {
                            setHasError((prev) => !prev);
                        }}
                    />
                ),
            },
        ];
    });

    return <PageVariants getItems={getVariants} />;
};
