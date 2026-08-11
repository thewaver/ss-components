import { createMemo, createSignal } from "solid-js";

import type { DateValue, DateValueWeekStart } from "../../../../Lib/Abstracts/DateValue/DateValue.types";
import { DateValueUtils } from "../../../../Lib/Abstracts/DateValue/DateValue.utils";
import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Calendar } from "../../../../Lib/Fundamentals/Input/Calendar/Calendar";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import { PageCalendarCaption } from "../../StyledComponents/CalendarCaption/CalendarCaption";
import {
    PageCalendarDay,
    PageCalendarFrame,
    PageCalendarWeekday,
} from "../../StyledComponents/CalendarContent/CalendarContent";

const TODAY: DateValue = { year: 2026, month: 8, day: 10 };
const LOCALE = "en-GB";
const WEEKEND_DAYS = [0, 6];

const toMonth = (value: DateValue): DateValue => ({ year: value.year, month: value.month, day: 1 });

export const CalendarPage = () => {
    const defaultValue = createSignal<DateValue | undefined>(TODAY);
    const defaultMonth = createSignal<DateValue>(toMonth(TODAY));

    const rangedValue = createSignal<DateValue | undefined>();
    const rangedMonth = createSignal<DateValue>(toMonth(TODAY));

    const weekdaysValue = createSignal<DateValue | undefined>();
    const weekdaysMonth = createSignal<DateValue>(toMonth(TODAY));

    const [getWeekStartsOn, setWeekStartsOn] = createSignal<DateValueWeekStart>(1);

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
                readout: () =>
                    `value: ${defaultValue[0]() ? DateValueUtils.toIso(defaultValue[0]()!) : "none"} — month: ${DateValueUtils.toIso(defaultMonth[0]())}`,
                component: () =>
                    renderFrame(defaultMonth, () => (
                        <Calendar
                            valueSignal={defaultValue}
                            monthSignal={defaultMonth}
                            getToday={() => TODAY}
                            getLocale={() => LOCALE}
                            getAriaLabel={() => "Choose a date"}
                            renderDay={(_, getFlags) => <PageCalendarDay getFlags={getFlags} />}
                            renderWeekday={(name) => <PageCalendarWeekday>{name}</PageCalendarWeekday>}
                        />
                    )),
            },
            {
                name: "Bounded",
                readout: () =>
                    `min 2026-08-05, max 2026-08-20 — value: ${rangedValue[0]() ? DateValueUtils.toIso(rangedValue[0]()!) : "none"}`,
                component: () =>
                    renderFrame(rangedMonth, () => (
                        <Calendar
                            valueSignal={rangedValue}
                            monthSignal={rangedMonth}
                            getToday={() => TODAY}
                            getLocale={() => LOCALE}
                            getMin={() => ({ year: 2026, month: 8, day: 5 })}
                            getMax={() => ({ year: 2026, month: 8, day: 20 })}
                            getAriaLabel={() => "Choose a date within August"}
                            renderDay={(_, getFlags) => <PageCalendarDay getFlags={getFlags} />}
                            renderWeekday={(name) => <PageCalendarWeekday>{name}</PageCalendarWeekday>}
                        />
                    )),
            },
            {
                name: "Weekdays only",
                readout: () =>
                    `week starts on ${getWeekStartsOn() === 1 ? "Monday" : "Sunday"} — value: ${weekdaysValue[0]() ? DateValueUtils.toIso(weekdaysValue[0]()!) : "none"}`,
                component: () =>
                    renderFrame(weekdaysMonth, () => (
                        <>
                            <Calendar
                                valueSignal={weekdaysValue}
                                monthSignal={weekdaysMonth}
                                getToday={() => TODAY}
                                getLocale={() => LOCALE}
                                getWeekStartsOn={getWeekStartsOn}
                                getAriaLabel={() => "Choose a working day"}
                                computeIsDayDisabled={(day) =>
                                    WEEKEND_DAYS.includes(DateValueUtils.toDate(day).getDay())
                                }
                                renderDay={(_, getFlags) => <PageCalendarDay getFlags={getFlags} />}
                                renderWeekday={(name) => <PageCalendarWeekday>{name}</PageCalendarWeekday>}
                            />

                            <Button
                                renderContent={(getFlags) => (
                                    <PageButtonContent getFlags={getFlags}>Flip week start</PageButtonContent>
                                )}
                                onClick={() => {
                                    setWeekStartsOn((prev) => (prev === 1 ? 0 : 1));
                                }}
                            />
                        </>
                    )),
            },
        ];
    });

    return <PageVariants getItems={getVariants} />;
};
