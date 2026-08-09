import { createEffect, createMemo, createSignal } from "solid-js";

import { Corners } from "../../../../Lib/Fundamentals/Corners/Corners";
import { Checkbox } from "../../../../Lib/Fundamentals/Input/Checkbox/Checkbox";
import { PageControlRow, PageControlRowLabel } from "../../PageComponents/ControlRow/ControlRow";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageCheckboxContent } from "../../StyledComponents/CheckboxContent/CheckboxContent";
import { PageTooltipContent } from "../../StyledComponents/TooltipContent/TooltipContent";

export const CheckboxPage = () => {
    const defaultSignal = createSignal(false);
    const decoratedSignal = createSignal(true);
    const disabledSignal = createSignal(true);
    const reachableSignal = createSignal(true);
    const erroredSignal = createSignal(false);

    const allSignal = createSignal(false);
    const firstChildSignal = createSignal(true);
    const secondChildSignal = createSignal(false);

    const emailSignal = createSignal(true);
    const smsSignal = createSignal(false);

    const getIsAllMixed = createMemo(() => firstChildSignal[0]() !== secondChildSignal[0]());

    createEffect(() => {
        allSignal[1](firstChildSignal[0]() && secondChildSignal[0]());
    });

    const getVariants = createMemo(() => {
        return [
            {
                name: "Default",
                readout: () => `checked: ${defaultSignal[0]()}`,
                component: () => (
                    <Checkbox
                        checkedSignal={defaultSignal}
                        getAriaLabel={() => "Default checkbox"}
                        renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
                    />
                ),
            },
            {
                name: "Decorated",
                readout: () => `checked: ${decoratedSignal[0]()}`,
                component: () => (
                    <Checkbox
                        checkedSignal={decoratedSignal}
                        getAriaLabel={() => "Decorated checkbox"}
                        getIsPressed={decoratedSignal[0]}
                        renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
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
                        <Checkbox
                            checkedSignal={allSignal}
                            getIsMixed={getIsAllMixed}
                            getAriaLabel={() => "Select all"}
                            renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
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
                                        {`Summarises the two boxes on the right. It reads mixed whenever they disagree, and clicking it sets both. checkedState: ${String(getFlags().checkedState)}.`}
                                    </PageTooltipContent>
                                ),
                            })}
                            onChange={(isChecked) => {
                                firstChildSignal[1](isChecked);
                                secondChildSignal[1](isChecked);
                            }}
                        />

                        <PageControlRowLabel>controls</PageControlRowLabel>

                        <Checkbox
                            checkedSignal={firstChildSignal}
                            getAriaLabel={() => "First child"}
                            renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
                        />

                        <Checkbox
                            checkedSignal={secondChildSignal}
                            getAriaLabel={() => "Second child"}
                            renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
                        />
                    </PageControlRow>
                ),
            },
            {
                name: "Refused write",
                readout: () =>
                    `email: ${emailSignal[0]()} | sms: ${smsSignal[0]()} — whichever is the last one on refuses to go off`,
                component: () => (
                    <PageControlRow>
                        <Checkbox
                            checkedSignal={emailSignal}
                            getAriaLabel={() => "Email"}
                            renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
                            onChange={(isChecked) => {
                                if (isChecked || smsSignal[0]()) return;

                                emailSignal[1](true);
                            }}
                        />

                        <PageControlRowLabel>or</PageControlRowLabel>

                        <Checkbox
                            checkedSignal={smsSignal}
                            getAriaLabel={() => "SMS"}
                            renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
                            onChange={(isChecked) => {
                                if (isChecked || emailSignal[0]()) return;

                                smsSignal[1](true);
                            }}
                        />
                    </PageControlRow>
                ),
            },
            {
                name: "Disabled",
                readout: () => `checked: ${disabledSignal[0]()}`,
                component: () => (
                    <Checkbox
                        checkedSignal={disabledSignal}
                        getAriaLabel={() => "Disabled checkbox"}
                        getIsDisabled={() => true}
                        renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
                    />
                ),
            },
            {
                name: "Disabled + reachable",
                readout: () => `checked: ${reachableSignal[0]()}`,
                component: () => (
                    <Checkbox
                        checkedSignal={reachableSignal}
                        getAriaLabel={() => "Disabled but reachable checkbox"}
                        getIsDisabled={() => true}
                        getIsReachableWhenDisabled={() => true}
                        renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
                        getTooltipDefs={() => ({
                            getPlacement: () => ({ x: "center", y: "top-out" }),
                            getOffset: () => ({ x: 0, y: 5 }),
                            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                                <PageTooltipContent
                                    getVisibilityTarget={getVisibilityTarget}
                                    getTransitionDurationMs={getTransitionDurationMs}
                                >
                                    Focusable so this tooltip can be read, but clicking and pressing Space must leave it
                                    checked.
                                </PageTooltipContent>
                            ),
                        })}
                    />
                ),
            },
            {
                name: "Error",
                readout: () => `checked: ${erroredSignal[0]()}`,
                component: () => (
                    <Checkbox
                        checkedSignal={erroredSignal}
                        getAriaLabel={() => "Errored checkbox"}
                        getHasError={() => !erroredSignal[0]()}
                        renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
                    />
                ),
            },
        ];
    });

    return <PageVariants getItems={getVariants} />;
};
