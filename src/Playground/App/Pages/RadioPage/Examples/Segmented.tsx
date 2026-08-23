import { For } from "solid-js";

import { Radio } from "../../../../../Lib/Fundamentals/Input/Radio/Radio";
import { RadioGroup } from "../../../../../Lib/Fundamentals/Input/RadioGroup/RadioGroup";
import {
    PageRadioSegmentContent,
    PageRadioSegmentFloater,
    PageRadioSegmentGroup,
} from "../../../StyledComponents/RadioSegmentContent/RadioSegmentContent";
import { SIZE_OPTIONS } from "../RadioPage.const";
import type { RadioExampleProps } from "../RadioPage.types";

type Props = RadioExampleProps;

export const SegmentedExample = (props: Props) => (
    <PageRadioSegmentGroup>
        <RadioGroup
            valueSignal={props.valueSignal}
            ariaLabel={"Segmented size"}
            dir={"row"}
            gap={0}
            renderFloater={(getVisibilityTarget, getTransitionDurationMs) => (
                <PageRadioSegmentFloater
                    visibilityTarget={getVisibilityTarget}
                    transitionDurationMs={getTransitionDurationMs}
                />
            )}
        >
            <For each={SIZE_OPTIONS}>
                {(option) => (
                    <Radio
                        value={() => option.value}
                        ariaLabel={() => option.label}
                        renderContent={(getFlags) => (
                            <PageRadioSegmentContent flags={getFlags}>{option.label}</PageRadioSegmentContent>
                        )}
                    />
                )}
            </For>
        </RadioGroup>
    </PageRadioSegmentGroup>
);
