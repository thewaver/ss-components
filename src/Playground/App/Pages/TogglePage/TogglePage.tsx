import { createEffect, createMemo, createSignal } from "solid-js";

import { Corners } from "../../../../Lib/Fundamentals/Corners/Corners";
import { Toggle } from "../../../../Lib/Fundamentals/Input/Toggle/Toggle";
import { PageControlRow, PageControlRowLabel } from "../../PageComponents/ControlRow/ControlRow";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageToggleContent } from "../../StyledComponents/ToggleContent/ToggleContent";
import { PageTooltipContent } from "../../StyledComponents/TooltipContent/TooltipContent";

export const TogglePage = () => {
    const defaultSignal = createSignal(false);
    const decoratedSignal = createSignal(true);
    const disabledSignal = createSignal(true);
    const reachableSignal = createSignal(true);
    const erroredSignal = createSignal(false);

    const allSignal = createSignal(false);
    const firstChildSignal = createSignal(true);
    const secondChildSignal = createSignal(false);

    const getIsAllMixed = createMemo(() => firstChildSignal[0]() !== secondChildSignal[0]());

    createEffect(() => {
        allSignal[1](firstChildSignal[0]() && secondChildSignal[0]());
    });

    const getVariants = createMemo(() => {
        return [
            {
                name: "Default",
                readout: () => `on: ${defaultSignal[0]()}`,
                component: () => (
                    <Toggle
                        checkedSignal={defaultSignal}
                        getAriaLabel={() => "Default toggle"}
                        renderContent={(getFlags) => <PageToggleContent getFlags={getFlags} />}
                    />
                ),
            },
            {
                name: "Decorated",
                readout: () => `on: ${decoratedSignal[0]()}`,
                component: () => (
                    <Toggle
                        checkedSignal={decoratedSignal}
                        getAriaLabel={() => "Decorated toggle"}
                        getIsPressed={decoratedSignal[0]}
                        renderContent={(getFlags) => <PageToggleContent getFlags={getFlags} />}
                        renderDecoration={(getFlags) => (
                            <Corners
                                getColor={() => (getFlags().isPressed ? "yellow" : "transparent")}
                                getCornerLength={() => ({ width: 8, height: 8 })}
                                getStrokeThickness={() => 2}
                            />
                        )}
                    />
                ),
            },
            {
                name: "Mixed",
                readout: () =>
                    `mixed: ${getIsAllMixed()} | all: ${allSignal[0]()} | children: ${firstChildSignal[0]()}, ${secondChildSignal[0]()}`,
                component: () => (
                    <PageControlRow>
                        <Toggle
                            checkedSignal={allSignal}
                            getIsMixed={getIsAllMixed}
                            getAriaLabel={() => "All settings"}
                            renderContent={(getFlags) => <PageToggleContent getFlags={getFlags} />}
                            getTooltipDefs={() => ({
                                getPlacement: () => ({ x: "center", y: "top-out" }),
                                getOffset: () => ({ x: 0, y: 5 }),
                                renderContent: (
                                    getVisibilityTarget,
                                    getTransitionDurationMs,
                                    _getPlacement,
                                    getFlags,
                                ) => (
                                    <PageTooltipContent
                                        getVisibilityTarget={getVisibilityTarget}
                                        getTransitionDurationMs={getTransitionDurationMs}
                                    >
                                        {`Mixed while the two toggles on the right disagree, and clicking it sets both. A switch cannot announce "mixed", so this control drops role="switch" and reads as a mixed checkbox exactly while mixed. checkedState: ${String(getFlags().checkedState)}.`}
                                    </PageTooltipContent>
                                ),
                            })}
                            onChange={(isChecked) => {
                                firstChildSignal[1](isChecked);
                                secondChildSignal[1](isChecked);
                            }}
                        />

                        <PageControlRowLabel>controls</PageControlRowLabel>

                        <Toggle
                            checkedSignal={firstChildSignal}
                            getAriaLabel={() => "First setting"}
                            renderContent={(getFlags) => <PageToggleContent getFlags={getFlags} />}
                        />

                        <Toggle
                            checkedSignal={secondChildSignal}
                            getAriaLabel={() => "Second setting"}
                            renderContent={(getFlags) => <PageToggleContent getFlags={getFlags} />}
                        />
                    </PageControlRow>
                ),
            },
            {
                name: "Disabled",
                readout: () => `on: ${disabledSignal[0]()}`,
                component: () => (
                    <Toggle
                        checkedSignal={disabledSignal}
                        getAriaLabel={() => "Disabled toggle"}
                        getIsDisabled={() => true}
                        renderContent={(getFlags) => <PageToggleContent getFlags={getFlags} />}
                    />
                ),
            },
            {
                name: "Disabled + reachable",
                readout: () => `on: ${reachableSignal[0]()}`,
                component: () => (
                    <Toggle
                        checkedSignal={reachableSignal}
                        getAriaLabel={() => "Disabled but reachable toggle"}
                        getIsDisabled={() => true}
                        getIsReachableWhenDisabled={() => true}
                        renderContent={(getFlags) => <PageToggleContent getFlags={getFlags} />}
                        getTooltipDefs={() => ({
                            getPlacement: () => ({ x: "center", y: "top-out" }),
                            getOffset: () => ({ x: 0, y: 5 }),
                            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                                <PageTooltipContent
                                    getVisibilityTarget={getVisibilityTarget}
                                    getTransitionDurationMs={getTransitionDurationMs}
                                >
                                    Focusable so this tooltip can be read, but clicking and pressing Space must leave it
                                    on.
                                </PageTooltipContent>
                            ),
                        })}
                    />
                ),
            },
            {
                name: "Error",
                readout: () => `on: ${erroredSignal[0]()}`,
                component: () => (
                    <Toggle
                        checkedSignal={erroredSignal}
                        getAriaLabel={() => "Errored toggle"}
                        getHasError={() => !erroredSignal[0]()}
                        renderContent={(getFlags) => <PageToggleContent getFlags={getFlags} />}
                    />
                ),
            },
        ];
    });

    return <PageVariants getItems={getVariants} />;
};
