import { For } from "solid-js";

import { Label } from "../../../../../Lib/Fundamentals/Input/Label/Label";
import { Radio } from "../../../../../Lib/Fundamentals/Input/Radio/Radio";
import { RadioGroup } from "../../../../../Lib/Fundamentals/Input/RadioGroup/RadioGroup";
import { PageLabelCaption } from "../../../StyledComponents/LabelCaption/LabelCaption";
import { PageRadioContent } from "../../../StyledComponents/RadioContent/RadioContent";
import type { LabelRadioExampleProps, PlanValue } from "../LabelPage.types";

const GAP = 20;

const PLAN_OPTIONS: { value: PlanValue; label: string }[] = [
    { value: "free", label: "Free" },
    { value: "pro", label: "Pro" },
];

type Props = LabelRadioExampleProps;

export const LabelPerRadioExample = (props: Props) => (
    <RadioGroup valueSignal={props.valueSignal} getAriaLabel={() => "Plan"} getGap={() => GAP}>
        <For each={PLAN_OPTIONS}>
            {(option) => (
                <Label>
                    <Radio
                        getValue={() => option.value}
                        renderContent={(getFlags) => <PageRadioContent getFlags={getFlags} />}
                    />

                    <PageLabelCaption>{option.label}</PageLabelCaption>
                </Label>
            )}
        </For>
    </RadioGroup>
);
