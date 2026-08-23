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
    <RadioGroup valueSignal={props.valueSignal} ariaLabel={"Partly disabled size"} gap={() => RADIO_GROUP_GAP}>
        <For each={SIZE_OPTIONS}>
            {(option) => (
                <Radio
                    value={() => option.value}
                    ariaLabel={() => option.label}
                    isDisabled={() => option.value === REACHABLE_VALUE}
                    isReachableWhenDisabled={() => option.value === REACHABLE_VALUE}
                    renderContent={(getFlags) => <PageRadioContent flags={getFlags}>{option.label}</PageRadioContent>}
                    tooltipDefs={
                        option.value === REACHABLE_VALUE
                            ? () => ({
                                  placement: () => ({ x: "center", y: "top-out" }),
                                  offset: () => ({ x: 0, y: 5 }),
                                  renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                                      <PageTooltipContent
                                          visibilityTarget={getVisibilityTarget}
                                          transitionDurationMs={getTransitionDurationMs}
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
