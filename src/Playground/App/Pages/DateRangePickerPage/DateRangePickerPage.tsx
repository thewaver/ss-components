import { createMemo, createSignal } from "solid-js";

import type { DateValueCalendarId, DateValueRange } from "../../../../Lib/Abstracts/DateValue/DateValue.types";
import { DateValueUtils } from "../../../../Lib/Abstracts/DateValue/DateValue.utils";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageSelectField } from "../../StyledComponents/Field/Field";
import { MAX_DATE, MIN_DATE } from "../CalendarPage/CalendarPage.const";
import { PickedExample } from "./Examples/Picked";

const CALENDAR_FIELD_WIDTH = 180;
const EXAMPLES_ROOT = "/src/Playground/App/Pages/DateRangePickerPage/Examples";

const describe = (value: DateValueRange | undefined) =>
    value ? `${DateValueUtils.toIso(value.start)} to ${DateValueUtils.toIso(value.end)}` : "none";

export const DateRangePickerPage = () => {
    const [getCalendarId, setCalendarId] = createSignal<DateValueCalendarId>("gregory");

    const defaultValue = createSignal<DateValueRange | undefined>();
    const boundedValue = createSignal<DateValueRange | undefined>();

    const getExamples = createMemo(() => [
        {
            key: "picked",
            name: "Two fields, one value",
            readout: () => `value: ${describe(defaultValue[0]())}`,
            component: () => <PickedExample valueSignal={defaultValue} calendar={getCalendarId} key={"picked"} />,
            path: `${EXAMPLES_ROOT}/Picked.tsx`,
        },
        {
            key: "bounded",
            name: "Bounded",
            readout: () =>
                `min ${DateValueUtils.toIso(MIN_DATE)}, max ${DateValueUtils.toIso(MAX_DATE)} — value: ${describe(boundedValue[0]())}`,
            component: () => (
                <PickedExample
                    valueSignal={boundedValue}
                    calendar={getCalendarId}
                    key={"bounded"}
                    minDate={() => MIN_DATE}
                    maxDate={() => MAX_DATE}
                />
            ),
            path: `${EXAMPLES_ROOT}/Picked.tsx`,
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
            </PagePropsPanel>

            <PageExamples items={getExamples} minColumnWidth={520} />
        </>
    );
};
