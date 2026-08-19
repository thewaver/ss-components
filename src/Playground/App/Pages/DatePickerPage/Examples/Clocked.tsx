import { Show } from "solid-js";

import type { TimeValue } from "@thewaver/ss-utils";

import type { ClockSteps } from "../../../../../Lib/Fundamentals/Input/Clock/Clock.types";
import { TimePicker } from "../../../../../Lib/Fundamentals/Input/TimePicker/TimePicker";
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
    getKey: () => string;
    getAriaLabel: () => string;
    getIsTwelveHour?: () => boolean;
    getHasSeconds?: () => boolean;
    getClockSteps?: () => ClockSteps;
    getMinTime?: () => TimeValue;
    getMaxTime?: () => TimeValue;
};

export const ClockedExample = (props: Props) => (
    <TimePicker
        valueSignal={props.valueSignal}
        getIsTwelveHour={props.getIsTwelveHour}
        getHasSeconds={props.getHasSeconds}
        getClockSteps={props.getClockSteps}
        getMinTime={props.getMinTime}
        getMaxTime={props.getMaxTime}
        getAriaLabel={props.getAriaLabel}
        getClockLabel={() => "Choose a time"}
        getLocale={() => LOCALE}
        getPadding={() => FIELD_STEPPER_PADDING}
        getGap={() => FIELD_GAP}
        computeTextStyle={computePageTextFieldTextStyle}
        renderContent={(getFlags) => <PageTextFieldContent getFlags={getFlags} getWidth={() => FIELD_WIDTH} />}
        renderPlaceholder={(getFlags, hint) => (
            <PageTextFieldPlaceholder getFlags={getFlags}>{hint}</PageTextFieldPlaceholder>
        )}
        renderTrailing={(getFlags, meridiem, trigger) => (
            <>
                <Show when={props.getIsTwelveHour?.()}>
                    <PageMeridiemToggle
                        getMeridiem={meridiem.getValue}
                        getIsDisabled={() => getFlags().isDisabled ?? false}
                        onToggle={meridiem.toggle}
                    />
                </Show>

                <PageTimePickerTrigger
                    getKey={props.getKey}
                    getIsOpen={trigger.getIsOpen}
                    getIsDisabled={() => getFlags().isDisabled ?? false}
                    onToggle={trigger.toggle}
                />
            </>
        )}
        renderOption={(_unused, getFlags) => <PageClockOption getFlags={getFlags} />}
        renderUnit={(name) => <PageClockUnit>{name}</PageClockUnit>}
        renderColumn={(renderOptions) => <PageClockColumn>{renderOptions()}</PageClockColumn>}
        renderPopup={(renderClock) => <PageClockFrame>{renderClock()}</PageClockFrame>}
    />
);
