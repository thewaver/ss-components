import { For } from "solid-js";

import { Radio } from "../../../../../Lib/Fundamentals/Input/Radio/Radio";
import { RadioGroup } from "../../../../../Lib/Fundamentals/Input/RadioGroup/RadioGroup";
import { PageRadioContent } from "../../../StyledComponents/RadioContent/RadioContent";
import { RADIO_GROUP_GAP, SIZE_OPTIONS } from "../RadioPage.const";
import type { RadioExampleProps } from "../RadioPage.types";

type Props = RadioExampleProps;

export const DisabledExample = (props: Props) => (
    <RadioGroup valueSignal={props.valueSignal} getAriaLabel={() => "Disabled size"} getGap={() => RADIO_GROUP_GAP}>
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
);
