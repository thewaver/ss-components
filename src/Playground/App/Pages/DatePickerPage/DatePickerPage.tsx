import { createMemo, createSignal } from "solid-js";

import type { DateValue } from "../../../../Lib/Abstracts/DateValue/DateValue.types";
import { DateValueUtils } from "../../../../Lib/Abstracts/DateValue/DateValue.utils";
import type { TimeValue } from "../../../../Lib/Abstracts/TimeValue/TimeValue.types";
import { TimeValueUtils } from "../../../../Lib/Abstracts/TimeValue/TimeValue.utils";
import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { DateInput } from "../../../../Lib/Fundamentals/Input/DateInput/DateInput";
import { DatePicker } from "../../../../Lib/Fundamentals/Input/DatePicker/DatePicker";
import { TimeInput } from "../../../../Lib/Fundamentals/Input/TimeInput/TimeInput";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import {
    PageCalendarDay,
    PageCalendarFrame,
    PageCalendarHeader,
    PageCalendarWeekday,
} from "../../StyledComponents/CalendarContent/CalendarContent";
import { PageDatePickerTrigger } from "../../StyledComponents/DatePickerTrigger/DatePickerTrigger";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../StyledComponents/TextFieldContent/TextFieldContent";
import { PageTextFieldPlaceholder } from "../../StyledComponents/TextFieldPlaceholder/TextFieldPlaceholder";

import { FIELD_GAP, FIELD_STEPPER_PADDING } from "../../StyledComponents/TextFieldContent/TextFieldContent.css";

const FIELD_WIDTH = 220;
const MONTH_TITLE_OPTIONS: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" };
const LOCALE = "en-GB";
const MONTH_STEP = 1;
const TODAY: DateValue = { year: 2026, month: 8, day: 10 };
const MIN_DATE: DateValue = { year: 2026, month: 8, day: 5 };
const MAX_DATE: DateValue = { year: 2026, month: 8, day: 20 };

const OPENING_TIME: TimeValue = { hour: 9, minute: 0 };
const CLOSING_TIME: TimeValue = { hour: 17, minute: 30 };

const describe = (value: DateValue | undefined) => (value ? DateValueUtils.toIso(value) : "none");

const describeTime = (value: TimeValue | undefined) => (value ? TimeValueUtils.toIso(value) : "none");

export const DatePickerPage = () => {
    const typedSignal = createSignal<DateValue | undefined>(TODAY);
    const pickedSignal = createSignal<DateValue | undefined>();
    const boundedSignal = createSignal<DateValue | undefined>();
    const timeSignal = createSignal<TimeValue | undefined>({ hour: 9, minute: 30 });
    const preciseSignal = createSignal<TimeValue | undefined>({ hour: 9, minute: 30, second: 0 });
    const shiftSignal = createSignal<TimeValue | undefined>();

    const renderField = () => ({
        getPadding: () => FIELD_STEPPER_PADDING,
        getGap: () => FIELD_GAP,
        computeTextStyle: computePageTextFieldTextStyle,
        renderContent: (getFlags: Parameters<typeof PageTextFieldContent>[0]["getFlags"]) => (
            <PageTextFieldContent getFlags={getFlags} getWidth={() => FIELD_WIDTH} />
        ),
        renderPlaceholder: (getFlags: Parameters<typeof PageTextFieldPlaceholder>[0]["getFlags"]) => (
            <PageTextFieldPlaceholder getFlags={getFlags}>yyyy-mm-dd</PageTextFieldPlaceholder>
        ),
    });

    const renderPicker = (
        valueSignal: ReturnType<typeof createSignal<DateValue | undefined>>,
        bounds?: { minDate: DateValue; maxDate: DateValue },
    ) => (
        <DatePicker
            {...renderField()}
            valueSignal={valueSignal}
            getMinDate={bounds && (() => bounds.minDate)}
            getMaxDate={bounds && (() => bounds.maxDate)}
            getAriaLabel={() => "Date"}
            getCalendarLabel={() => "Choose a date"}
            getLocale={() => LOCALE}
            renderTrigger={(getIsOpen, onToggle) => <PageDatePickerTrigger getIsOpen={getIsOpen} onToggle={onToggle} />}
            renderDay={(_, getFlags) => <PageCalendarDay getFlags={getFlags} />}
            renderWeekday={(name) => <PageCalendarWeekday>{name}</PageCalendarWeekday>}
            renderPopup={(renderCalendar, monthSignal) => (
                <PageCalendarFrame>
                    <PageCalendarHeader>
                        <Button
                            getAriaLabel={() => "Previous month"}
                            renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>◀</PageButtonContent>}
                            onClick={() => {
                                monthSignal[1]((prev) => DateValueUtils.addMonths(prev, -MONTH_STEP));
                            }}
                        />

                        <div>{DateValueUtils.format(monthSignal[0](), MONTH_TITLE_OPTIONS, LOCALE)}</div>

                        <Button
                            getAriaLabel={() => "Next month"}
                            renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>▶</PageButtonContent>}
                            onClick={() => {
                                monthSignal[1]((prev) => DateValueUtils.addMonths(prev, MONTH_STEP));
                            }}
                        />
                    </PageCalendarHeader>

                    {renderCalendar()}
                </PageCalendarFrame>
            )}
        />
    );

    const getVariants = createMemo(() => {
        return [
            {
                name: "Typed only",
                readout: () => `value: ${describe(typedSignal[0]())} — a half-typed date reports nothing`,
                component: () => (
                    <DateInput {...renderField()} valueSignal={typedSignal} getAriaLabel={() => "Start date"} />
                ),
            },
            {
                name: "With a calendar",
                readout: () => `value: ${describe(pickedSignal[0]())} — typing and picking write the same signal`,
                component: () => renderPicker(pickedSignal),
            },
            {
                name: "Bounded",
                readout: () =>
                    `value: ${describe(boundedSignal[0]())} — ${DateValueUtils.toIso(MIN_DATE)} to ${DateValueUtils.toIso(MAX_DATE)}, typed or picked`,
                component: () => renderPicker(boundedSignal, { minDate: MIN_DATE, maxDate: MAX_DATE }),
            },
            {
                name: "A time, typed or stepped",
                readout: () =>
                    `value: ${describeTime(timeSignal[0]())} — the arrows step whichever segment the caret is in`,
                component: () => (
                    <TimeInput {...renderField()} valueSignal={timeSignal} getAriaLabel={() => "Start time"} />
                ),
            },
            {
                name: "To the second",
                readout: () => `value: ${describeTime(preciseSignal[0]())} — three segments instead of two`,
                component: () => (
                    <TimeInput
                        {...renderField()}
                        valueSignal={preciseSignal}
                        getHasSeconds={() => true}
                        getAriaLabel={() => "Exact time"}
                    />
                ),
            },
            {
                name: "Within opening hours",
                readout: () =>
                    `value: ${describeTime(shiftSignal[0]())} — ${TimeValueUtils.toIso(OPENING_TIME)} to ${TimeValueUtils.toIso(CLOSING_TIME)}`,
                component: () => (
                    <TimeInput
                        {...renderField()}
                        valueSignal={shiftSignal}
                        getMinTime={() => OPENING_TIME}
                        getMaxTime={() => CLOSING_TIME}
                        getAriaLabel={() => "Shift start"}
                    />
                ),
            },
        ];
    });

    return <PageVariants getItems={getVariants} />;
};
