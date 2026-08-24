import type { Signal } from "solid-js";
import { createMemo, createSignal } from "solid-js";

import type {
    DateValue,
    DateValueCalendarId,
    DateValueRange,
    DateValueWeekStart,
} from "../../../../Lib/Abstracts/DateValue/DateValue.types";
import { DateValueUtils } from "../../../../Lib/Abstracts/DateValue/DateValue.utils";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageSelectField } from "../../StyledComponents/Field/Field";
import { MAX_DATE, MIN_DATE, TODAY, WEEK_START_LABELS } from "../CalendarPage/CalendarPage.const";
import { BoundedExample } from "./Examples/Bounded";
import { DefaultExample } from "./Examples/Default";

const WEEK_STARTS = [0, 1] as const;
const CALENDAR_FIELD_WIDTH = 180;
const EXAMPLES_ROOT = "/src/Playground/App/Pages/RangeCalendarPage/Examples";

const describe = (value: DateValueRange | undefined) =>
    value ? `${DateValueUtils.toIso(value.start)} to ${DateValueUtils.toIso(value.end)}` : "none";

export const RangeCalendarPage = () => {
    const [getCalendarId, setCalendarId] = createSignal<DateValueCalendarId>("gregory");
    const [getWeekStartsOn, setWeekStartsOn] = createSignal<DateValueWeekStart>(1);

    const defaultValue = createSignal<DateValueRange | undefined>();
    const boundedValue = createSignal<DateValueRange | undefined>();

    const makeMonthSignal = (): Signal<DateValue> => {
        const signal = createSignal<DateValue>(DateValueUtils.getStartOfMonth(TODAY));

        return [() => DateValueUtils.withCalendar(signal[0](), getCalendarId()), signal[1]];
    };

    const defaultMonth = makeMonthSignal();
    const boundedMonth = makeMonthSignal();

    const getExamples = createMemo(() => [
        {
            key: "default",
            name: "Default",
            readout: () => `value: ${describe(defaultValue[0]())}`,
            component: () => (
                <DefaultExample valueSignal={defaultValue} monthSignal={defaultMonth} weekStartsOn={getWeekStartsOn} />
            ),
            path: `${EXAMPLES_ROOT}/Default.tsx`,
        },
        {
            key: "bounded",
            name: "Bounded",
            readout: () =>
                `min ${DateValueUtils.toIso(MIN_DATE)}, max ${DateValueUtils.toIso(MAX_DATE)} — value: ${describe(boundedValue[0]())}`,
            component: () => (
                <BoundedExample valueSignal={boundedValue} monthSignal={boundedMonth} weekStartsOn={getWeekStartsOn} />
            ),
            path: `${EXAMPLES_ROOT}/Bounded.tsx`,
        },
    ]);

    return (
        <>
            <PagePropsPanel scope={"global"}>
                <PageProp key={"calendarId"} label={"Calendar"}>
                    <PageSelectField
                        value={getCalendarId}
                        values={DateValueUtils.getCalendarIds}
                        width={() => CALENDAR_FIELD_WIDTH}
                        ariaLabel={"Calendar system"}
                        onChange={(id) => setCalendarId(() => id)}
                    />
                </PageProp>

                <PageProp key={"weekStartsOn"} label={"Week starts on"}>
                    <PageSelectField
                        value={getWeekStartsOn}
                        values={() => [...WEEK_STARTS]}
                        ariaLabel={"Week starts on"}
                        computeLabel={(day) => WEEK_START_LABELS[day]}
                        onChange={(day) => setWeekStartsOn(() => day)}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageExamples items={getExamples} />
        </>
    );
};
