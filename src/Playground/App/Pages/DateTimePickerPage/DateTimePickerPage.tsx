import { createMemo, createSignal } from "solid-js";

import { TimeUtils } from "@thewaver/ss-utils";

import type { DateTimeValue } from "../../../../Lib/Abstracts/DateTimeValue/DateTimeValue.types";
import { DateTimeValueUtils } from "../../../../Lib/Abstracts/DateTimeValue/DateTimeValue.utils";
import { DateValueUtils } from "../../../../Lib/Abstracts/DateValue/DateValue.utils";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { TODAY } from "../DatePickerPage/DatePickerPage.const";
import { PairedExample } from "./Examples/Paired";
import { PickedExample } from "./Examples/Picked";

const EXAMPLES_ROOT = "/src/Playground/App/Pages/DateTimePickerPage/Examples";
const NOON = { hour: 12, minute: 0 };

const describe = (value: DateTimeValue | undefined) =>
    value
        ? `${DateValueUtils.toIso(value.date)} at ${String(value.time.hour).padStart(2, "0")}:${String(value.time.minute).padStart(2, "0")}`
        : "none";

export const DateTimePickerPage = () => {
    const emptyValue = createSignal<DateTimeValue | undefined>();
    const seededValue = createSignal<DateTimeValue | undefined>(DateTimeValueUtils.of(TODAY, NOON));
    const pickedValue = createSignal<DateTimeValue | undefined>();
    const twelveHourValue = createSignal<DateTimeValue | undefined>();

    const getExamples = createMemo(() => [
        {
            key: "paired",
            name: "Two fields, one value",
            readout: () => `value: ${describe(emptyValue[0]())}`,
            component: () => <PairedExample valueSignal={emptyValue} />,
            path: `${EXAMPLES_ROOT}/Paired.tsx`,
        },
        {
            key: "picked",
            name: "One control, both popups",
            readout: () => `value: ${describe(pickedValue[0]())}`,
            component: () => <PickedExample valueSignal={pickedValue} key={"picked"} />,
            path: `${EXAMPLES_ROOT}/Picked.tsx`,
        },
        {
            key: "twelveHour",
            name: "Twelve hour, with seconds",
            readout: () => `value: ${describe(twelveHourValue[0]())}`,
            component: () => (
                <PickedExample valueSignal={twelveHourValue} key={"twelveHour"} isTwelveHour={true} hasSeconds={true} />
            ),
            path: `${EXAMPLES_ROOT}/Picked.tsx`,
        },
        {
            key: "seeded",
            name: "Starting from a value",
            readout: () =>
                `value: ${describe(seededValue[0]())} — seconds of day: ${
                    seededValue[0]() ? TimeUtils.getSecondOfDay(seededValue[0]()!.time) : 0
                }`,
            component: () => <PairedExample valueSignal={seededValue} />,
            path: `${EXAMPLES_ROOT}/Paired.tsx`,
        },
    ]);

    return <PageExamples items={getExamples} minColumnWidth={520} />;
};
