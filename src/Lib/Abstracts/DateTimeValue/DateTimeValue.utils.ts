import type { Signal } from "solid-js";
import { createEffect, createSignal, untrack } from "solid-js";

import { TimeUtils, type TimeValue } from "@thewaver/ss-utils";

import type { DateValue } from "../DateValue/DateValue.types";
import { DateValueUtils } from "../DateValue/DateValue.utils";
import type { DateTimeValue } from "./DateTimeValue.types";

const MS_PER_SECOND = 1000;

export namespace DateTimeValueUtils {
    export const of = (date: DateValue, time: TimeValue): DateTimeValue => ({ date, time });

    export const withDate = (value: DateTimeValue, date: DateValue): DateTimeValue => ({ ...value, date });

    export const withTime = (value: DateTimeValue, time: TimeValue): DateTimeValue => ({ ...value, time });

    export const isSame = (a: DateTimeValue | undefined, b: DateTimeValue | undefined) =>
        a === b ||
        (a !== undefined &&
            b !== undefined &&
            DateValueUtils.isSame(a.date, b.date) &&
            TimeUtils.isSame(a.time, b.time));

    export const compare = (a: DateTimeValue, b: DateTimeValue) => {
        const byDate = DateValueUtils.compare(a.date, b.date);

        return byDate !== 0 ? byDate : TimeUtils.compare(a.time, b.time);
    };

    export const fromDate = (date: Date, hasSeconds = false): DateTimeValue => ({
        date: DateValueUtils.fromDate(date),
        time: hasSeconds
            ? { hour: date.getHours(), minute: date.getMinutes(), second: date.getSeconds() }
            : { hour: date.getHours(), minute: date.getMinutes() },
    });

    export const createSplit = (
        signal: Signal<DateTimeValue | undefined>,
    ): { dateSignal: Signal<DateValue | undefined>; timeSignal: Signal<TimeValue | undefined> } => {
        const [getDate, setDate] = createSignal<DateValue | undefined>(untrack(() => signal[0]()?.date));
        const [getTime, setTime] = createSignal<TimeValue | undefined>(untrack(() => signal[0]()?.time));

        createEffect(() => {
            const value = signal[0]();

            if (!value) return;

            setDate(() => value.date);
            setTime(() => value.time);
        });

        const emit = () => {
            const date = untrack(getDate);
            const time = untrack(getTime);
            const next = date !== undefined && time !== undefined ? of(date, time) : undefined;

            if (isSame(next, untrack(signal[0]))) return;

            signal[1](() => next);
        };

        const dateSignal = [
            getDate,
            (next: unknown) => {
                setDate(typeof next === "function" ? (next as never) : () => next as DateValue | undefined);
                emit();

                return untrack(getDate);
            },
        ] as Signal<DateValue | undefined>;

        const timeSignal = [
            getTime,
            (next: unknown) => {
                setTime(typeof next === "function" ? (next as never) : () => next as TimeValue | undefined);
                emit();

                return untrack(getTime);
            },
        ] as Signal<TimeValue | undefined>;

        return { dateSignal, timeSignal };
    };

    export const toDate = (value: DateTimeValue) =>
        new Date(DateValueUtils.toDate(value.date).getTime() + TimeUtils.getSecondOfDay(value.time) * MS_PER_SECOND);
}
