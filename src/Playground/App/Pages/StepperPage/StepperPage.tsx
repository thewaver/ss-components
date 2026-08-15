import { createMemo, createSignal } from "solid-js";

import { Stepper } from "../../../../Lib/Fundamentals/Stepper/Stepper";
import type { Step } from "../../../../Lib/Fundamentals/Stepper/Stepper.types";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageCheckField } from "../../StyledComponents/Field/Field";
import { PageStepConnector, PageStepContent } from "../../StyledComponents/StepContent/StepContent";
import type { PageStepState } from "../../StyledComponents/StepContent/StepContent.types";
import { PageTooltipContent } from "../../StyledComponents/TooltipContent/TooltipContent";

type StepValue = "details" | "address" | "payment" | "review";

const LABELS: Record<StepValue, string> = {
    details: "Details",
    address: "Address",
    payment: "Payment",
    review: "Review",
};

const ORDER: StepValue[] = ["details", "address", "payment", "review"];

const STATE_WORDS: Record<PageStepState, string> = {
    done: "completed",
    current: "current step",
    failed: "needs attention",
    skipped: "skipped",
    ahead: "not started",
};

const FAILURE_REASON = "The card was declined, so this step has to be repeated before the order can be reviewed.";
const LOCKED_REASON = "Review opens once payment succeeds, so there is nothing to look at here yet.";

const STEPPER_GAP = 5;

export const StepperPage = () => {
    const [getIsFreeNavigation, setIsFreeNavigation] = createSignal(false);

    const [getLinearCurrent, setLinearCurrent] = createSignal<StepValue>("address");
    const [getFailedCurrent, setFailedCurrent] = createSignal<StepValue>("payment");
    const [getStackedCurrent, setStackedCurrent] = createSignal<StepValue>("address");

    const computeState = (value: StepValue, current: StepValue): PageStepState => {
        if (value === current) return "current";

        return ORDER.indexOf(value) < ORDER.indexOf(current) ? "done" : "ahead";
    };

    const buildSteps = (
        current: StepValue,
        overrides: Partial<Record<StepValue, PageStepState>> = {},
    ): Step<StepValue, PageStepState>[] =>
        ORDER.map((value) => {
            const state = overrides[value] ?? computeState(value, current);

            return {
                value,
                state,
                isNavigable: getIsFreeNavigation() || state === "done" || state === "failed",
            };
        });

    const describe = (step: Step<StepValue, PageStepState>, index: number) =>
        `Step ${index + 1} of ${ORDER.length}, ${LABELS[step.value]}, ${STATE_WORDS[step.state]}`;

    const getVariants = createMemo(() => {
        return [
            {
                name: "Linear",
                readout: () =>
                    `current: ${getLinearCurrent()} — only the steps behind you can be pressed, unless free navigation is on`,
                component: () => (
                    <Stepper
                        getSteps={() => buildSteps(getLinearCurrent())}
                        getCurrentValue={getLinearCurrent}
                        getGap={() => STEPPER_GAP}
                        getAriaLabel={() => "Checkout"}
                        computeStepAriaLabel={describe}
                        onCurrentChange={setLinearCurrent}
                        renderStep={(getStep, getFlags) => (
                            <PageStepContent
                                getFlags={getFlags}
                                getState={() => getStep().state}
                                getOrdinal={() => ORDER.indexOf(getStep().value) + 1}
                                getDir={() => "row"}
                            >
                                {LABELS[getStep().value]}
                            </PageStepContent>
                        )}
                        renderConnector={() => <PageStepConnector getDir={() => "row"} />}
                    />
                ),
            },
            {
                name: "A step that failed",
                readout: () =>
                    `current: ${getFailedCurrent()} — the failed step is reachable by keyboard so its tooltip can be read, and its name carries the state as words`,
                component: () => (
                    <Stepper
                        getSteps={() => buildSteps(getFailedCurrent(), { address: "failed", details: "skipped" })}
                        getCurrentValue={getFailedCurrent}
                        getGap={() => STEPPER_GAP}
                        getAriaLabel={() => "Checkout with a failure"}
                        computeStepAriaLabel={describe}
                        computeTooltipDefs={(step) => {
                            const reason =
                                step.state === "failed"
                                    ? FAILURE_REASON
                                    : step.state === "ahead"
                                      ? LOCKED_REASON
                                      : undefined;

                            if (!reason) return undefined;

                            return {
                                getPlacement: () => ({ x: "center", y: "top-out" }),
                                getOffset: () => ({ x: 0, y: 5 }),
                                renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                                    <PageTooltipContent
                                        getVisibilityTarget={getVisibilityTarget}
                                        getTransitionDurationMs={getTransitionDurationMs}
                                    >
                                        {reason}
                                    </PageTooltipContent>
                                ),
                            };
                        }}
                        onCurrentChange={setFailedCurrent}
                        renderStep={(getStep, getFlags) => (
                            <PageStepContent
                                getFlags={getFlags}
                                getState={() => getStep().state}
                                getOrdinal={() => ORDER.indexOf(getStep().value) + 1}
                                getDir={() => "row"}
                            >
                                {LABELS[getStep().value]}
                            </PageStepContent>
                        )}
                        renderConnector={() => <PageStepConnector getDir={() => "row"} />}
                    />
                ),
            },
            {
                name: "Stacked",
                readout: () => `current: ${getStackedCurrent()} — the same steps down the page`,
                component: () => (
                    <Stepper
                        getSteps={() => buildSteps(getStackedCurrent())}
                        getCurrentValue={getStackedCurrent}
                        getDir={() => "column"}
                        getGap={() => STEPPER_GAP}
                        getAriaLabel={() => "Stacked checkout"}
                        computeStepAriaLabel={describe}
                        onCurrentChange={setStackedCurrent}
                        renderStep={(getStep, getFlags) => (
                            <PageStepContent
                                getFlags={getFlags}
                                getState={() => getStep().state}
                                getOrdinal={() => ORDER.indexOf(getStep().value) + 1}
                                getDir={() => "column"}
                            >
                                {LABELS[getStep().value]}
                            </PageStepContent>
                        )}
                        renderConnector={() => <PageStepConnector getDir={() => "column"} />}
                    />
                ),
            },
            {
                name: "No connector",
                readout: () => "the connector slot is optional, so a bare strip renders nothing between the steps",
                component: () => (
                    <Stepper
                        getSteps={() => buildSteps(getLinearCurrent())}
                        getCurrentValue={getLinearCurrent}
                        getGap={() => STEPPER_GAP}
                        getAriaLabel={() => "Checkout without connectors"}
                        computeStepAriaLabel={describe}
                        onCurrentChange={setLinearCurrent}
                        renderStep={(getStep, getFlags) => (
                            <PageStepContent
                                getFlags={getFlags}
                                getState={() => getStep().state}
                                getOrdinal={() => ORDER.indexOf(getStep().value) + 1}
                                getDir={() => "row"}
                            >
                                {LABELS[getStep().value]}
                            </PageStepContent>
                        )}
                    />
                ),
            },
        ];
    });

    return (
        <>
            <PagePropsPanel getScope={() => "global"}>
                <PageProp getLabel={() => "Free navigation"}>
                    <PageCheckField
                        getValue={getIsFreeNavigation}
                        getAriaLabel={() => "Free navigation"}
                        onChange={setIsFreeNavigation}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageVariants getItems={getVariants} />
        </>
    );
};
