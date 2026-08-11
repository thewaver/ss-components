import { For, createMemo, createSignal } from "solid-js";

import { Checkbox } from "../../../../Lib/Fundamentals/Input/Checkbox/Checkbox";
import { Label } from "../../../../Lib/Fundamentals/Input/Label/Label";
import { Radio } from "../../../../Lib/Fundamentals/Input/Radio/Radio";
import { RadioGroup } from "../../../../Lib/Fundamentals/Input/RadioGroup/RadioGroup";
import { Toggle } from "../../../../Lib/Fundamentals/Input/Toggle/Toggle";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageCheckboxContent } from "../../StyledComponents/CheckboxContent/CheckboxContent";
import { PageLabelCaption } from "../../StyledComponents/LabelCaption/LabelCaption";
import { PageRadioContent } from "../../StyledComponents/RadioContent/RadioContent";
import { PageToggleContent } from "../../StyledComponents/ToggleContent/ToggleContent";

type PlanValue = "free" | "pro";

const PLAN_OPTIONS: { value: PlanValue; label: string }[] = [
    { value: "free", label: "Free" },
    { value: "pro", label: "Pro" },
];

export const LabelPage = () => {
    const checkboxSignal = createSignal(false);
    const toggleSignal = createSignal(true);
    const columnSignal = createSignal(false);
    const disabledSignal = createSignal(true);
    const suppressedSignal = createSignal(false);
    const planSignal = createSignal<PlanValue>("free");

    const getVariants = createMemo(() => {
        return [
            {
                name: "Checkbox",
                readout: () => `checked: ${checkboxSignal[0]()}`,
                component: () => (
                    <Label>
                        <Checkbox
                            checkedSignal={checkboxSignal}
                            renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
                        />

                        <PageLabelCaption>Remember me</PageLabelCaption>
                    </Label>
                ),
            },
            {
                name: "Toggle, caption first",
                readout: () => `on: ${toggleSignal[0]()}`,
                component: () => (
                    <Label>
                        <PageLabelCaption>Send notifications</PageLabelCaption>

                        <Toggle
                            checkedSignal={toggleSignal}
                            renderContent={(getFlags) => <PageToggleContent getFlags={getFlags} />}
                        />
                    </Label>
                ),
            },
            {
                name: "Column",
                readout: () => `checked: ${columnSignal[0]()}`,
                component: () => (
                    <Label getDir={() => "column"} getGap={() => 5}>
                        <PageLabelCaption>Stacked</PageLabelCaption>

                        <Checkbox
                            checkedSignal={columnSignal}
                            renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
                        />
                    </Label>
                ),
            },
            {
                name: "One label per radio",
                readout: () => `value: ${planSignal[0]()}`,
                component: () => (
                    <RadioGroup valueSignal={planSignal} getAriaLabel={() => "Plan"} getGap={() => 20}>
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
                ),
            },
            {
                name: "Suppressed aria-label",
                readout: () => `checked: ${suppressedSignal[0]()} — the caption wins, and the console says so`,
                component: () => (
                    <Label>
                        <Checkbox
                            checkedSignal={suppressedSignal}
                            getAriaLabel={() => "Announced as something else"}
                            renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
                        />

                        <PageLabelCaption>Subscribe to the newsletter</PageLabelCaption>
                    </Label>
                ),
            },
            {
                name: "Disabled",
                readout: () => `checked: ${disabledSignal[0]()}`,
                component: () => (
                    <Label>
                        <Checkbox
                            checkedSignal={disabledSignal}
                            getIsDisabled={() => true}
                            renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
                        />

                        <PageLabelCaption>Caption clicks must do nothing</PageLabelCaption>
                    </Label>
                ),
            },
        ];
    });

    return <PageVariants getItems={getVariants} />;
};
