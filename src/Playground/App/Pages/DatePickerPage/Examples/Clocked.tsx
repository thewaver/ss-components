import { Show } from "solid-js";

import type { TimeValue } from "@thewaver/ss-utils";

import type { ClockSteps } from "../../../../../Lib/Fundamentals/Input/Clock/Clock.types";
import { TimePicker } from "../../../../../Lib/Fundamentals/Input/TimePicker/TimePicker";
import { access } from "../../../../../Lib/Utils/propUtils";
import type { MaybeAccessor } from "../../../../../Lib/Utils/typeUtils";
import {
    PageClockColumn,
    PageClockFrame,
    PageClockOption,
    PageClockUnit,
} from "../../../StyledComponents/ClockContent/ClockContent";
import { PageMeridiemToggle } from "../../../StyledComponents/MeridiemToggle/MeridiemToggle";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import { PageTextFieldPlaceholder } from "../../../StyledComponents/TextFieldPlaceholder/TextFieldPlaceholder";
import { PageTimePickerTrigger } from "../../../StyledComponents/TimePickerTrigger/TimePickerTrigger";
import { FIELD_WIDTH, LOCALE } from "../DatePickerPage.const";
import type { TimeExampleProps } from "../DatePickerPage.types";

import { FIELD_GAP, FIELD_STEPPER_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

type Props = TimeExampleProps & {
    key: MaybeAccessor<string>;
    ariaLabel: MaybeAccessor<string>;
    isTwelveHour?: MaybeAccessor<boolean>;
    hasSeconds?: MaybeAccessor<boolean>;
    clockSteps?: MaybeAccessor<ClockSteps>;
    minTime?: MaybeAccessor<TimeValue>;
    maxTime?: MaybeAccessor<TimeValue>;
};

export const ClockedExample = (props: Props) => {
    return (
        <TimePicker
            valueSignal={props.valueSignal}
            isTwelveHour={props.isTwelveHour}
            hasSeconds={props.hasSeconds}
            clockSteps={props.clockSteps}
            minTime={props.minTime}
            maxTime={props.maxTime}
            ariaLabel={props.ariaLabel}
            clockLabel={"Choose a time"}
            locale={() => LOCALE}
            padding={() => FIELD_STEPPER_PADDING}
            gap={() => FIELD_GAP}
            computeTextStyle={computePageTextFieldTextStyle}
            renderContent={(getFlags) => <PageTextFieldContent flags={getFlags} width={() => FIELD_WIDTH} />}
            renderPlaceholder={(getFlags, hint) => (
                <PageTextFieldPlaceholder flags={getFlags}>{hint}</PageTextFieldPlaceholder>
            )}
            renderTrailing={(getFlags, meridiem, trigger) => (
                <>
                    <Show when={access(props.isTwelveHour)}>
                        <PageMeridiemToggle
                            meridiem={meridiem.getValue}
                            isDisabled={() => getFlags().isDisabled ?? false}
                            onToggle={meridiem.toggle}
                        />
                    </Show>

                    <PageTimePickerTrigger
                        key={props.key}
                        isOpen={trigger.getIsOpen}
                        isDisabled={() => getFlags().isDisabled ?? false}
                        onToggle={trigger.toggle}
                    />
                </>
            )}
            renderOption={(_unused, getFlags) => <PageClockOption flags={getFlags} />}
            renderUnit={(name) => <PageClockUnit>{name}</PageClockUnit>}
            renderColumn={(renderOptions) => <PageClockColumn>{renderOptions()}</PageClockColumn>}
            renderPopup={(renderClock) => <PageClockFrame>{renderClock()}</PageClockFrame>}
        />
    );
};
