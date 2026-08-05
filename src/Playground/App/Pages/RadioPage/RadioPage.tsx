import { For, createMemo, createSignal } from "solid-js";

import { Corners } from "../../../../Lib/Fundamentals/Corners/Corners";
import { Radio } from "../../../../Lib/Fundamentals/Input/Radio/Radio";
import { RadioGroup } from "../../../../Lib/Fundamentals/Input/RadioGroup/RadioGroup";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageRadioContent } from "../../StyledComponents/RadioContent/RadioContent";
import { PageTooltipContent } from "../../StyledComponents/TooltipContent/TooltipContent";

type SizeValue = "small" | "medium" | "large";

const SIZE_OPTIONS: { value: SizeValue; label: string }[] = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
];

const RADIO_GROUP_GAP = 10;

export const RadioPage = () => {
    const defaultSignal = createSignal<SizeValue | undefined>(undefined);
    const decoratedSignal = createSignal<SizeValue>("medium");
    const disabledSignal = createSignal<SizeValue>("small");
    const reachableSignal = createSignal<SizeValue>("small");
    const erroredSignal = createSignal<SizeValue | undefined>(undefined);

    const getVariants = createMemo(() => {
        return [
            {
                name: "Default",
                readout: () => `value: ${defaultSignal[0]()}`,
                component: () => (
                    <RadioGroup
                        valueSignal={defaultSignal}
                        getAriaLabel={() => "Default size"}
                        getGap={() => RADIO_GROUP_GAP}
                    >
                        <For each={SIZE_OPTIONS}>
                            {(option) => (
                                <Radio
                                    getValue={() => option.value}
                                    getAriaLabel={() => option.label}
                                    renderContent={(getFlags) => (
                                        <PageRadioContent getFlags={getFlags}>{option.label}</PageRadioContent>
                                    )}
                                />
                            )}
                        </For>
                    </RadioGroup>
                ),
            },
            {
                name: "Decorated",
                readout: () => `value: ${decoratedSignal[0]()}`,
                component: () => (
                    <RadioGroup
                        valueSignal={decoratedSignal}
                        getAriaLabel={() => "Decorated size"}
                        getGap={() => RADIO_GROUP_GAP}
                    >
                        <For each={SIZE_OPTIONS}>
                            {(option) => (
                                <Radio
                                    getValue={() => option.value}
                                    getAriaLabel={() => option.label}
                                    renderContent={(getFlags) => (
                                        <PageRadioContent getFlags={getFlags}>{option.label}</PageRadioContent>
                                    )}
                                    renderDecoration={(getFlags) => (
                                        <Corners
                                            getColor={() =>
                                                getFlags().checkedState === true ? "yellow" : "transparent"
                                            }
                                            getCornerLength={() => ({ width: 8, height: 8 })}
                                            getStrokeThickness={() => 2}
                                        />
                                    )}
                                />
                            )}
                        </For>
                    </RadioGroup>
                ),
            },
            {
                name: "Disabled",
                readout: () => `value: ${disabledSignal[0]()}`,
                component: () => (
                    <RadioGroup
                        valueSignal={disabledSignal}
                        getAriaLabel={() => "Disabled size"}
                        getGap={() => RADIO_GROUP_GAP}
                    >
                        <For each={SIZE_OPTIONS}>
                            {(option) => (
                                <Radio
                                    getValue={() => option.value}
                                    getAriaLabel={() => option.label}
                                    getIsDisabled={() => true}
                                    renderContent={(getFlags) => (
                                        <PageRadioContent getFlags={getFlags}>{option.label}</PageRadioContent>
                                    )}
                                />
                            )}
                        </For>
                    </RadioGroup>
                ),
            },
            {
                name: "Disabled + reachable",
                readout: () => `value: ${reachableSignal[0]()}`,
                component: () => (
                    <RadioGroup
                        valueSignal={reachableSignal}
                        getAriaLabel={() => "Partly disabled size"}
                        getGap={() => RADIO_GROUP_GAP}
                    >
                        <For each={SIZE_OPTIONS}>
                            {(option) => (
                                <Radio
                                    getValue={() => option.value}
                                    getAriaLabel={() => option.label}
                                    getIsDisabled={() => option.value === "medium"}
                                    getIsReachableWhenDisabled={() => option.value === "medium"}
                                    renderContent={(getFlags) => (
                                        <PageRadioContent getFlags={getFlags}>{option.label}</PageRadioContent>
                                    )}
                                    getTooltipDefs={
                                        option.value === "medium"
                                            ? () => ({
                                                  getPlacement: () => ({ x: "center", y: "top-out" }),
                                                  getOffset: () => ({ x: 0, y: 5 }),
                                                  renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                                                      <PageTooltipContent
                                                          getVisibilityTarget={getVisibilityTarget}
                                                          getTransitionDurationMs={getTransitionDurationMs}
                                                      >
                                                          Arrow keys still land here so this tooltip can be read, but
                                                          they must not select it and clicking must leave the value
                                                          alone.
                                                      </PageTooltipContent>
                                                  ),
                                              })
                                            : undefined
                                    }
                                />
                            )}
                        </For>
                    </RadioGroup>
                ),
            },
            {
                name: "Error",
                readout: () => `value: ${erroredSignal[0]()}`,
                component: () => (
                    <RadioGroup
                        valueSignal={erroredSignal}
                        getAriaLabel={() => "Required size"}
                        getGap={() => RADIO_GROUP_GAP}
                        getHasError={() => erroredSignal[0]() === undefined}
                    >
                        <For each={SIZE_OPTIONS}>
                            {(option) => (
                                <Radio
                                    getValue={() => option.value}
                                    getAriaLabel={() => option.label}
                                    getHasError={() => erroredSignal[0]() === undefined}
                                    renderContent={(getFlags) => (
                                        <PageRadioContent getFlags={getFlags}>{option.label}</PageRadioContent>
                                    )}
                                />
                            )}
                        </For>
                    </RadioGroup>
                ),
            },
        ];
    });

    return <PageVariants getItems={getVariants} />;
};
