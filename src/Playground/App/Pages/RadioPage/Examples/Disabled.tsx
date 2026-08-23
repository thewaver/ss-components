import { For } from "solid-js";

import { Radio } from "../../../../../Lib/Fundamentals/Input/Radio/Radio";
import { RadioGroup } from "../../../../../Lib/Fundamentals/Input/RadioGroup/RadioGroup";
import { PageRadioContent } from "../../../StyledComponents/RadioContent/RadioContent";
import { RADIO_GROUP_GAP, SIZE_OPTIONS } from "../RadioPage.const";
import type { RadioExampleProps } from "../RadioPage.types";

type Props = RadioExampleProps;

export const DisabledExample = (props: Props) => (
    <RadioGroup valueSignal={props.valueSignal} ariaLabel={"Disabled size"} gap={() => RADIO_GROUP_GAP}>
        <For each={SIZE_OPTIONS}>
            {(option) => (
                <Radio
                    value={() => option.value}
                    ariaLabel={() => option.label}
                    isDisabled={true}
                    renderContent={(getFlags) => <PageRadioContent flags={getFlags}>{option.label}</PageRadioContent>}
                />
            )}
        </For>
    </RadioGroup>
);
