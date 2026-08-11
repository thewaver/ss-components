import { createMemo, createSignal } from "solid-js";

import type { DateValue, DateValueCalendarId } from "../../../../Lib/Abstracts/DateValue/DateValue.types";
import { DateValueUtils } from "../../../../Lib/Abstracts/DateValue/DateValue.utils";
import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { TimeValue } from "../../../../Lib/Abstracts/TimeValue/TimeValue.types";
import { TimeValueUtils } from "../../../../Lib/Abstracts/TimeValue/TimeValue.utils";
import { DateInput } from "../../../../Lib/Fundamentals/Input/DateInput/DateInput";
import type { DateInputEra } from "../../../../Lib/Fundamentals/Input/DateInput/DateInput.types";
import { DatePicker } from "../../../../Lib/Fundamentals/Input/DatePicker/DatePicker";
import type { TextFieldFlags } from "../../../../Lib/Fundamentals/Input/TextField/TextField.types";
import { TimeInput } from "../../../../Lib/Fundamentals/Input/TimeInput/TimeInput";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageCalendarCaption } from "../../StyledComponents/CalendarCaption/CalendarCaption";
import {
    PageCalendarDay,
    PageCalendarFrame,
    PageCalendarWeekday,
} from "../../StyledComponents/CalendarContent/CalendarContent";
import { PageDatePickerTrigger } from "../../StyledComponents/DatePickerTrigger/DatePickerTrigger";
import { PageEraCycle } from "../../StyledComponents/EraCycle/EraCycle";
import { PageSelectField } from "../../StyledComponents/Field/Field";
import { PageMeridiemToggle } from "../../StyledComponents/MeridiemToggle/MeridiemToggle";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../StyledComponents/TextFieldContent/TextFieldContent";
import { PageTextFieldPlaceholder } from "../../StyledComponents/TextFieldPlaceholder/TextFieldPlaceholder";

import { FIELD_GAP, FIELD_STEPPER_PADDING } from "../../StyledComponents/TextFieldContent/TextFieldContent.css";

const FIELD_WIDTH = 220;
const CALENDAR_FIELD_WIDTH = 180;
const LOCALE = "en-GB";
const TODAY = DateValueUtils.fromIso("2026-08-10")!;
const MIN_DATE = DateValueUtils.fromIso("2026-08-05")!;
const MAX_DATE = DateValueUtils.fromIso("2026-08-20")!;
const CAESAR = DateValueUtils.fromIso("-000043-03-15")!;

const OPENING_TIME: TimeValue = { hour: 9, minute: 0 };
const CLOSING_TIME: TimeValue = { hour: 17, minute: 30 };

const describe = (value: DateValue | undefined) => (value ? DateValueUtils.toIso(value) : "none");

const describeTime = (value: TimeValue | undefined) => (value ? TimeValueUtils.toIso(value) : "none");

export const DatePickerPage = () => {
    const [getCalendarId, setCalendarId] = createSignal<DateValueCalendarId>("gregory");

    const typedSignal = createSignal<DateValue | undefined>(TODAY);
    const localeSignal = createSignal<DateValue | undefined>(TODAY);
    const pickedSignal = createSignal<DateValue | undefined>();
    const boundedSignal = createSignal<DateValue | undefined>();
    const eraSignal = createSignal<DateValue | undefined>(CAESAR);
    const timeSignal = createSignal<TimeValue | undefined>({ hour: 9, minute: 30 });
    const preciseSignal = createSignal<TimeValue | undefined>({ hour: 9, minute: 30, second: 0 });
    const twelveHourSignal = createSignal<TimeValue | undefined>({ hour: 14, minute: 30 });
    const shiftSignal = createSignal<TimeValue | undefined>();

    const renderDateField = () => ({
        ...renderField(),
        getCalendar: getCalendarId,
        getLocale: () => LOCALE,
        renderLeading: (getFlags: () => InteractionFlags<TextFieldFlags>, era: DateInputEra) => (
            <PageEraCycle
                getEra={era.getValue}
                getOptions={era.getOptions}
                getIsDisabled={() => getFlags().isDisabled ?? false}
                onChange={era.set}
            />
        ),
    });

    const renderField = () => ({
        getPadding: () => FIELD_STEPPER_PADDING,
        getGap: () => FIELD_GAP,
        computeTextStyle: computePageTextFieldTextStyle,
        renderContent: (getFlags: Parameters<typeof PageTextFieldContent>[0]["getFlags"]) => (
            <PageTextFieldContent getFlags={getFlags} getWidth={() => FIELD_WIDTH} />
        ),
        renderPlaceholder: (getFlags: Parameters<typeof PageTextFieldPlaceholder>[0]["getFlags"], hint?: string) => (
            <PageTextFieldPlaceholder getFlags={getFlags}>{hint}</PageTextFieldPlaceholder>
        ),
    });

    const renderPicker = (
        valueSignal: ReturnType<typeof createSignal<DateValue | undefined>>,
        bounds?: { minDate: DateValue; maxDate: DateValue },
    ) => (
        <DatePicker
            {...renderDateField()}
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
                    <PageCalendarCaption monthSignal={monthSignal} getLocale={() => LOCALE} />

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
                    <DateInput {...renderDateField()} valueSignal={typedSignal} getAriaLabel={() => "Start date"} />
                ),
            },
            {
                name: "Day first",
                readout: () =>
                    `value: ${describe(localeSignal[0]())} — dd/mm/yyyy, and the separators are the mask's rather than yours to type`,
                component: () => (
                    <DateInput
                        {...renderDateField()}
                        valueSignal={localeSignal}
                        getFormat={() => "day-month-year"}
                        getAriaLabel={() => "Day-first date"}
                    />
                ),
            },
            {
                name: "Before the common era",
                readout: () =>
                    `value: ${describe(eraSignal[0]())} — the era is a control in the leading slot, offering whatever the calendar reports`,
                component: () => (
                    <DateInput {...renderDateField()} valueSignal={eraSignal} getAriaLabel={() => "Historical date"} />
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
                name: "Twelve hour",
                readout: () =>
                    `value: ${describeTime(twelveHourSignal[0]())} — the value stays 24-hour, the field reads it as 12`,
                component: () => (
                    <TimeInput
                        {...renderField()}
                        valueSignal={twelveHourSignal}
                        getIsTwelveHour={() => true}
                        getAriaLabel={() => "Meeting time"}
                        renderTrailing={(getFlags, meridiem) => (
                            <PageMeridiemToggle
                                getMeridiem={meridiem.getValue}
                                getIsDisabled={() => getFlags().isDisabled ?? false}
                                onToggle={meridiem.toggle}
                            />
                        )}
                    />
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

    return (
        <>
            <PagePropsPanel getScope={() => "global"}>
                <PageProp getLabel={() => "Calendar"}>
                    <PageSelectField
                        getValue={getCalendarId}
                        getValues={DateValueUtils.getCalendarIds}
                        getWidth={() => CALENDAR_FIELD_WIDTH}
                        getAriaLabel={() => "Calendar system"}
                        onChange={(id) => setCalendarId(() => id)}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageVariants getItems={getVariants} />
        </>
    );
};
