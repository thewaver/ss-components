import { Show } from "solid-js";

import { DateTimePicker } from "../../../../../Lib/Fundamentals/Input/DateTimePicker/DateTimePicker";
import { access } from "../../../../../Lib/Utils/propUtils";
import type { MaybeAccessor } from "../../../../../Lib/Utils/typeUtils";
import { PageCalendarCaption } from "../../../StyledComponents/CalendarCaption/CalendarCaption";
import {
    PageCalendarDay,
    PageCalendarFrame,
    PageCalendarWeekday,
} from "../../../StyledComponents/CalendarContent/CalendarContent";
import {
    PageClockColumn,
    PageClockFrame,
    PageClockOption,
    PageClockUnit,
} from "../../../StyledComponents/ClockContent/ClockContent";
import { PageDatePickerTrigger } from "../../../StyledComponents/DatePickerTrigger/DatePickerTrigger";
import { PageMeridiemToggle } from "../../../StyledComponents/MeridiemToggle/MeridiemToggle";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../../StyledComponents/TextFieldContent/TextFieldContent";
import { PageTextFieldPlaceholder } from "../../../StyledComponents/TextFieldPlaceholder/TextFieldPlaceholder";
import { PageTimePickerTrigger } from "../../../StyledComponents/TimePickerTrigger/TimePickerTrigger";
import { FIELD_WIDTH, LOCALE } from "../../DatePickerPage/DatePickerPage.const";
import { PageDateTimeSeparator } from "../DateTimePickerPage.content";
import type { DateTimeExampleProps } from "../DateTimePickerPage.types";

import { FIELD_GAP, FIELD_STEPPER_PADDING } from "../../../StyledComponents/TextFieldContent/TextFieldContent.css";

type Props = DateTimeExampleProps & {
    key: MaybeAccessor<string>;
    isTwelveHour?: MaybeAccessor<boolean>;
    hasSeconds?: MaybeAccessor<boolean>;
};

export const PickedExample = (props: Props) => {
    return (
        <DateTimePicker
            valueSignal={props.valueSignal}
            isTwelveHour={props.isTwelveHour}
            hasSeconds={props.hasSeconds}
            dateLabel={"Date"}
            timeLabel={"Time"}
            calendarLabel={"Choose a date"}
            clockLabel={"Choose a time"}
            locale={() => LOCALE}
            padding={() => FIELD_STEPPER_PADDING}
            gap={() => FIELD_GAP}
            computeTextStyle={computePageTextFieldTextStyle}
            renderContent={(getFlags) => <PageTextFieldContent flags={getFlags} width={() => FIELD_WIDTH} />}
            renderPlaceholder={(getFlags, hint) => (
                <PageTextFieldPlaceholder flags={getFlags}>{hint}</PageTextFieldPlaceholder>
            )}
            renderSeparator={() => <PageDateTimeSeparator />}
            renderTrigger={(getIsOpen, onToggle) => (
                <PageDatePickerTrigger key={props.key} isOpen={getIsOpen} onToggle={onToggle} />
            )}
            renderDay={(_unused, getFlags) => <PageCalendarDay flags={getFlags} />}
            renderWeekday={(name) => <PageCalendarWeekday>{name}</PageCalendarWeekday>}
            renderPopup={(renderCalendar, monthSignal) => (
                <PageCalendarFrame>
                    <PageCalendarCaption monthSignal={monthSignal} key={props.key} locale={() => LOCALE} />

                    {renderCalendar()}
                </PageCalendarFrame>
            )}
            renderTimeTrailing={(getFlags, meridiem, trigger) => (
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
            renderTimePopup={(renderClock) => <PageClockFrame>{renderClock()}</PageClockFrame>}
        />
    );
};
