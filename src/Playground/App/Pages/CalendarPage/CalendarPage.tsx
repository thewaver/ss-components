import type { Signal } from "solid-js";
import { createMemo, createSignal } from "solid-js";

import type {
    DateValue,
    DateValueCalendarId,
    DateValueWeekStart,
} from "../../../../Lib/Abstracts/DateValue/DateValue.types";
import { DateValueUtils } from "../../../../Lib/Abstracts/DateValue/DateValue.utils";
import { Calendar } from "../../../../Lib/Fundamentals/Input/Calendar/Calendar";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageCalendarCaption } from "../../StyledComponents/CalendarCaption/CalendarCaption";
import {
    PageCalendarDay,
    PageCalendarFrame,
    PageCalendarWeekday,
} from "../../StyledComponents/CalendarContent/CalendarContent";
import { PageSelectField } from "../../StyledComponents/Field/Field";

const LOCALE = "en-GB";
const WEEKEND_DAYS = [0, 6];
const WEEK_STARTS = [0, 1] as const;
const CALENDAR_FIELD_WIDTH = 180;

const TODAY = DateValueUtils.fromIso("2026-08-10")!;
const MIN_DATE = DateValueUtils.fromIso("2026-08-05")!;
const MAX_DATE = DateValueUtils.fromIso("2026-08-20")!;

const WEEK_START_LABELS: Record<DateValueWeekStart, string> = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
};

const describe = (value: DateValue | undefined) => (value ? DateValueUtils.toIso(value) : "none");

export const CalendarPage = () => {
    const [getCalendarId, setCalendarId] = createSignal<DateValueCalendarId>("gregory");
    const [getWeekStartsOn, setWeekStartsOn] = createSignal<DateValueWeekStart>(1);

    const defaultValue = createSignal<DateValue | undefined>(TODAY);
    const rangedValue = createSignal<DateValue | undefined>();
    const weekdaysValue = createSignal<DateValue | undefined>();

    const makeMonthSignal = (): Signal<DateValue> => {
        const signal = createSignal<DateValue>(DateValueUtils.getStartOfMonth(TODAY));

        return [() => DateValueUtils.withCalendar(signal[0](), getCalendarId()), signal[1]];
    };

    const defaultMonth = makeMonthSignal();
    const rangedMonth = makeMonthSignal();
    const weekdaysMonth = makeMonthSignal();

    const renderFrame = (
        month: ReturnType<typeof createSignal<DateValue>>,
        calendar: () => ReturnType<typeof Calendar>,
    ) => (
        <PageCalendarFrame>
            <PageCalendarCaption monthSignal={month} getLocale={() => LOCALE} />

            {calendar()}
        </PageCalendarFrame>
    );

    const getVariants = createMemo(() => {
        return [
            {
                name: "Default",
                readout: () => `value: ${describe(defaultValue[0]())} — month: ${describe(defaultMonth[0]())}`,
                component: () =>
                    renderFrame(defaultMonth, () => (
                        <Calendar
                            valueSignal={defaultValue}
                            monthSignal={defaultMonth}
                            getToday={() => TODAY}
                            getLocale={() => LOCALE}
                            getWeekStartsOn={getWeekStartsOn}
                            getAriaLabel={() => "Choose a date"}
                            renderDay={(_, getFlags) => <PageCalendarDay getFlags={getFlags} />}
                            renderWeekday={(name) => <PageCalendarWeekday>{name}</PageCalendarWeekday>}
                        />
                    )),
            },
            {
                name: "Bounded",
                readout: () =>
                    `min ${describe(MIN_DATE)}, max ${describe(MAX_DATE)} — value: ${describe(rangedValue[0]())}`,
                component: () =>
                    renderFrame(rangedMonth, () => (
                        <Calendar
                            valueSignal={rangedValue}
                            monthSignal={rangedMonth}
                            getToday={() => TODAY}
                            getLocale={() => LOCALE}
                            getWeekStartsOn={getWeekStartsOn}
                            getMin={() => MIN_DATE}
                            getMax={() => MAX_DATE}
                            getAriaLabel={() => "Choose a date within August"}
                            renderDay={(_, getFlags) => <PageCalendarDay getFlags={getFlags} />}
                            renderWeekday={(name) => <PageCalendarWeekday>{name}</PageCalendarWeekday>}
                        />
                    )),
            },
            {
                name: "Weekdays only",
                readout: () =>
                    `week starts on ${WEEK_START_LABELS[getWeekStartsOn()]} — value: ${describe(weekdaysValue[0]())}`,
                component: () =>
                    renderFrame(weekdaysMonth, () => (
                        <Calendar
                            valueSignal={weekdaysValue}
                            monthSignal={weekdaysMonth}
                            getToday={() => TODAY}
                            getLocale={() => LOCALE}
                            getWeekStartsOn={getWeekStartsOn}
                            getAriaLabel={() => "Choose a working day"}
                            computeIsDayDisabled={(day) => WEEKEND_DAYS.includes(DateValueUtils.toDate(day).getDay())}
                            renderDay={(_, getFlags) => <PageCalendarDay getFlags={getFlags} />}
                            renderWeekday={(name) => <PageCalendarWeekday>{name}</PageCalendarWeekday>}
                        />
                    )),
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

                <PageProp getLabel={() => "Week starts on"}>
                    <PageSelectField
                        getValue={getWeekStartsOn}
                        getValues={() => [...WEEK_STARTS]}
                        getAriaLabel={() => "Week starts on"}
                        computeLabel={(day) => WEEK_START_LABELS[day]}
                        onChange={(day) => setWeekStartsOn(() => day)}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageVariants getItems={getVariants} />
        </>
    );
};
