import { For } from "solid-js";

import { Corners } from "../../../../../Lib/Fundamentals/Corners/Corners";
import { Radio } from "../../../../../Lib/Fundamentals/Input/Radio/Radio";
import { RadioGroup } from "../../../../../Lib/Fundamentals/Input/RadioGroup/RadioGroup";
import { PageRadioContent } from "../../../StyledComponents/RadioContent/RadioContent";
import { RADIO_GROUP_GAP, SIZE_OPTIONS } from "../RadioPage.const";
import type { RadioExampleProps } from "../RadioPage.types";

const CORNER_LENGTH = { width: 8, height: 8 };
const STROKE_THICKNESS = 2;

type Props = RadioExampleProps;

export const DecoratedExample = (props: Props) => (
    <RadioGroup valueSignal={props.valueSignal} ariaLabel={"Decorated size"} gap={() => RADIO_GROUP_GAP}>
        <For each={SIZE_OPTIONS}>
            {(option) => (
                <Radio
                    value={() => option.value}
                    ariaLabel={() => option.label}
                    renderContent={(getFlags) => <PageRadioContent flags={getFlags}>{option.label}</PageRadioContent>}
                    renderDecoration={(getFlags) => (
                        <Corners
                            color={() => (getFlags().checkedState === true ? "yellow" : "transparent")}
                            cornerLength={() => CORNER_LENGTH}
                            strokeThickness={() => STROKE_THICKNESS}
                        />
                    )}
                />
            )}
        </For>
    </RadioGroup>
);
