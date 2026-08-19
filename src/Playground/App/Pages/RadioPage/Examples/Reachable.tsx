import { For } from "solid-js";

import { Radio } from "../../../../../Lib/Fundamentals/Input/Radio/Radio";
import { RadioGroup } from "../../../../../Lib/Fundamentals/Input/RadioGroup/RadioGroup";
import { PageRadioContent } from "../../../StyledComponents/RadioContent/RadioContent";
import { PageTooltipContent } from "../../../StyledComponents/TooltipContent/TooltipContent";
import { RADIO_GROUP_GAP, SIZE_OPTIONS } from "../RadioPage.const";
import type { RadioExampleProps } from "../RadioPage.types";

const REACHABLE_VALUE = "medium";

type Props = RadioExampleProps;

export const ReachableExample = (props: Props) => (
    <RadioGroup
        valueSignal={props.valueSignal}
        getAriaLabel={() => "Partly disabled size"}
        getGap={() => RADIO_GROUP_GAP}
    >
        <For each={SIZE_OPTIONS}>
            {(option) => (
                <Radio
                    getValue={() => option.value}
                    getAriaLabel={() => option.label}
                    getIsDisabled={() => option.value === REACHABLE_VALUE}
                    getIsReachableWhenDisabled={() => option.value === REACHABLE_VALUE}
                    renderContent={(getFlags) => (
                        <PageRadioContent getFlags={getFlags}>{option.label}</PageRadioContent>
                    )}
                    getTooltipDefs={
                        option.value === REACHABLE_VALUE
                            ? () => ({
                                  getPlacement: () => ({ x: "center", y: "top-out" }),
                                  getOffset: () => ({ x: 0, y: 5 }),
                                  renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                                      <PageTooltipContent
                                          getVisibilityTarget={getVisibilityTarget}
                                          getTransitionDurationMs={getTransitionDurationMs}
                                      >
                                          Arrow keys still land here so this tooltip can be read, but they must not
                                          select it and clicking must leave the value alone.
                                      </PageTooltipContent>
                                  ),
                              })
                            : undefined
                    }
                />
            )}
        </For>
    </RadioGroup>
);
