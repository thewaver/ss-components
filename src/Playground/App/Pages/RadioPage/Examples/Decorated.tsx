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
    <RadioGroup valueSignal={props.valueSignal} getAriaLabel={() => "Decorated size"} getGap={() => RADIO_GROUP_GAP}>
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
                            getColor={() => (getFlags().checkedState === true ? "yellow" : "transparent")}
                            getCornerLength={() => CORNER_LENGTH}
                            getStrokeThickness={() => STROKE_THICKNESS}
                        />
                    )}
                />
            )}
        </For>
    </RadioGroup>
);
