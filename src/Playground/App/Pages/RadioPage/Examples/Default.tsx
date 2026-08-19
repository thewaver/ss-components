import { For } from "solid-js";

import { Radio } from "../../../../../Lib/Fundamentals/Input/Radio/Radio";
import { RadioGroup } from "../../../../../Lib/Fundamentals/Input/RadioGroup/RadioGroup";
import { PageRadioContent } from "../../../StyledComponents/RadioContent/RadioContent";
import { RADIO_GROUP_GAP, SIZE_OPTIONS } from "../RadioPage.const";
import type { RadioOptionalExampleProps } from "../RadioPage.types";

type Props = RadioOptionalExampleProps;

export const DefaultExample = (props: Props) => (
    <RadioGroup valueSignal={props.valueSignal} getAriaLabel={() => "Default size"} getGap={() => RADIO_GROUP_GAP}>
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
);
