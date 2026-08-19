import { createMemo, createSignal } from "solid-js";

import { TimeUtils } from "@thewaver/ss-utils";
import type { TimeValue } from "@thewaver/ss-utils";

import type { DateValue, DateValueCalendarId } from "../../../../Lib/Abstracts/DateValue/DateValue.types";
import { DateValueUtils } from "../../../../Lib/Abstracts/DateValue/DateValue.utils";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageSelectField } from "../../StyledComponents/Field/Field";
import { CAESAR, CLOSING_TIME, MAX_DATE, MIN_DATE, OPENING_TIME, TODAY } from "./DatePickerPage.const";
import { PickedExample } from "./Examples/Picked";
import { TimeExample } from "./Examples/Time";
import { TypedExample } from "./Examples/Typed";

const CALENDAR_FIELD_WIDTH = 180;
const EXAMPLES_ROOT = "/src/Playground/App/Pages/DatePickerPage/Examples";

const describe = (value: DateValue | undefined) => (value ? DateValueUtils.toIso(value) : "none");

const describeTime = (value: TimeValue | undefined) => (value ? TimeUtils.toIso(value) : "none");

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

    const getExamples = createMemo(() => [
        {
            key: "typed",
            name: "Typed only",
            readout: () => `value: ${describe(typedSignal[0]())} — a half-typed date reports nothing`,
            component: () => (
                <TypedExample valueSignal={typedSignal} getCalendar={getCalendarId} getAriaLabel={() => "Start date"} />
            ),
            path: `${EXAMPLES_ROOT}/Typed.tsx`,
        },
        {
            key: "locale",
            name: "Day first",
            readout: () =>
                `value: ${describe(localeSignal[0]())} — dd/mm/yyyy, and the separators are the mask's rather than yours to type`,
            component: () => (
                <TypedExample
                    valueSignal={localeSignal}
                    getCalendar={getCalendarId}
                    getFormat={() => "day-month-year"}
                    getAriaLabel={() => "Day-first date"}
                />
            ),
            path: `${EXAMPLES_ROOT}/Typed.tsx`,
        },
        {
            key: "era",
            name: "Before the common era",
            readout: () =>
                `value: ${describe(eraSignal[0]())} — the era is a control in the leading slot, offering whatever the calendar reports`,
            component: () => (
                <TypedExample
                    valueSignal={eraSignal}
                    getCalendar={getCalendarId}
                    getAriaLabel={() => "Historical date"}
                />
            ),
            path: `${EXAMPLES_ROOT}/Typed.tsx`,
        },
        {
            key: "picked",
            name: "With a calendar",
            readout: () => `value: ${describe(pickedSignal[0]())} — typing and picking write the same signal`,
            component: () => (
                <PickedExample valueSignal={pickedSignal} getCalendar={getCalendarId} getKey={() => "picked"} />
            ),
            path: `${EXAMPLES_ROOT}/Picked.tsx`,
        },
        {
            key: "bounded",
            name: "Bounded",
            readout: () =>
                `value: ${describe(boundedSignal[0]())} — ${DateValueUtils.toIso(MIN_DATE)} to ${DateValueUtils.toIso(MAX_DATE)}, typed or picked`,
            component: () => (
                <PickedExample
                    valueSignal={boundedSignal}
                    getCalendar={getCalendarId}
                    getKey={() => "bounded"}
                    getMinDate={() => MIN_DATE}
                    getMaxDate={() => MAX_DATE}
                />
            ),
            path: `${EXAMPLES_ROOT}/Picked.tsx`,
        },
        {
            key: "time",
            name: "A time, typed or stepped",
            readout: () =>
                `value: ${describeTime(timeSignal[0]())} — the arrows step whichever segment the caret is in`,
            component: () => <TimeExample valueSignal={timeSignal} getAriaLabel={() => "Start time"} />,
            path: `${EXAMPLES_ROOT}/Time.tsx`,
        },
        {
            key: "twelve",
            name: "Twelve hour",
            readout: () =>
                `value: ${describeTime(twelveHourSignal[0]())} — the value stays 24-hour, the field reads it as 12`,
            component: () => (
                <TimeExample
                    valueSignal={twelveHourSignal}
                    getIsTwelveHour={() => true}
                    getAriaLabel={() => "Meeting time"}
                />
            ),
            path: `${EXAMPLES_ROOT}/Time.tsx`,
        },
        {
            key: "precise",
            name: "To the second",
            readout: () => `value: ${describeTime(preciseSignal[0]())} — three segments instead of two`,
            component: () => (
                <TimeExample valueSignal={preciseSignal} getHasSeconds={() => true} getAriaLabel={() => "Exact time"} />
            ),
            path: `${EXAMPLES_ROOT}/Time.tsx`,
        },
        {
            key: "shift",
            name: "Within opening hours",
            readout: () =>
                `value: ${describeTime(shiftSignal[0]())} — ${TimeUtils.toIso(OPENING_TIME)} to ${TimeUtils.toIso(CLOSING_TIME)}`,
            component: () => (
                <TimeExample
                    valueSignal={shiftSignal}
                    getMinTime={() => OPENING_TIME}
                    getMaxTime={() => CLOSING_TIME}
                    getAriaLabel={() => "Shift start"}
                />
            ),
            path: `${EXAMPLES_ROOT}/Time.tsx`,
        },
    ]);

    return (
        <>
            <PagePropsPanel getScope={() => "global"}>
                <PageProp getKey={() => "calendarId"} getLabel={() => "Calendar"}>
                    <PageSelectField
                        getValue={getCalendarId}
                        getValues={DateValueUtils.getCalendarIds}
                        getWidth={() => CALENDAR_FIELD_WIDTH}
                        getAriaLabel={() => "Calendar system"}
                        onChange={(id) => setCalendarId(() => id)}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageExamples getItems={getExamples} />
        </>
    );
};
