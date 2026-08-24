import type { Signal } from "solid-js";
import { createEffect, createSignal, createUniqueId, untrack } from "solid-js";

import type { AnchorPlacement } from "../../../Abstracts/Anchor/Anchor.types";
import type { DateValue } from "../../../Abstracts/DateValue/DateValue.types";
import { DateValueUtils } from "../../../Abstracts/DateValue/DateValue.utils";
import { SignalMirror } from "../../../Abstracts/SignalMirror/SignalMirror";
import { access } from "../../../Utils/propUtils";
import { Popover } from "../../Popover/Popover";
import { DateInput } from "../DateInput/DateInput";
import { RangeCalendar } from "../RangeCalendar/RangeCalendar";
import type { DateRangePickerProps } from "./DateRangePicker.types";

import * as styles from "./DateRangePicker.css";

const DEFAULT_DATE_RANGE_PICKER_PLACEMENT: AnchorPlacement = { x: "left-in", y: "bottom-out" };
const DEFAULT_DATE_RANGE_PICKER_CALENDAR_LABEL = "Choose a date range";
const DEFAULT_DATE_RANGE_PICKER_START_LABEL = "Start date";
const DEFAULT_DATE_RANGE_PICKER_END_LABEL = "End date";

const toMonth = (value: DateValue): DateValue => DateValueUtils.getStartOfMonth(value);

export const DateRangePicker = (props: DateRangePickerProps) => {
    const popupId = createUniqueId();

    const [getRootRef, setRootRef] = createSignal<HTMLElement>();
    const [getIsOpen, setIsOpen] = SignalMirror.createOptional(() => props.visibilitySignal, false);

    const startSignal = createSignal<DateValue | undefined>(untrack(() => props.valueSignal[0]()?.start));
    const endSignal = createSignal<DateValue | undefined>(untrack(() => props.valueSignal[0]()?.end));

    const monthSignal: Signal<DateValue> = createSignal(
        toMonth(untrack(() => props.valueSignal[0]()?.start) ?? DateValueUtils.fromDate(new Date())),
    );

    createEffect(() => {
        const range = props.valueSignal[0]();

        if (DateValueUtils.isSame(range?.start, untrack(startSignal[0]))) return;

        startSignal[1](() => range?.start);
    });

    createEffect(() => {
        const range = props.valueSignal[0]();

        if (DateValueUtils.isSame(range?.end, untrack(endSignal[0]))) return;

        endSignal[1](() => range?.end);
    });

    createEffect(() => {
        const start = startSignal[0]();
        const end = endSignal[0]();
        const next = start && end ? DateValueUtils.orderRange(start, end) : undefined;

        if (DateValueUtils.isSameRange(next, untrack(props.valueSignal[0]))) return;

        props.valueSignal[1](() => next);
    });

    const dismiss = () => {
        if (!getIsOpen()) return;

        setIsOpen(false);
        getRootRef()?.querySelector("input")?.focus();
    };

    createEffect(() => {
        if (!getIsOpen()) return;

        const start = untrack(() => props.valueSignal[0]()?.start);

        if (start) monthSignal[1](() => toMonth(start));
    });

    const renderCalendar = () => (
        <RangeCalendar
            valueSignal={props.valueSignal}
            monthSignal={monthSignal}
            min={props.minDate}
            max={props.maxDate}
            isDisabled={props.isDisabled}
            locale={props.locale}
            weekStartsOn={props.weekStartsOn}
            ariaLabel={() => access(props.calendarLabel) ?? DEFAULT_DATE_RANGE_PICKER_CALENDAR_LABEL}
            computeIsDayDisabled={props.computeIsDayDisabled}
            renderDay={props.renderDay}
            renderWeekday={props.renderWeekday}
        />
    );

    return (
        <div ref={setRootRef} class={styles.dateRangePickerRoot}>
            <DateInput
                {...props}
                valueSignal={startSignal}
                ariaLabel={() => access(props.startLabel) ?? DEFAULT_DATE_RANGE_PICKER_START_LABEL}
            />

            {props.renderSeparator?.()}

            <DateInput
                {...props}
                valueSignal={endSignal}
                ariaLabel={() => access(props.endLabel) ?? DEFAULT_DATE_RANGE_PICKER_END_LABEL}
                renderTrailing={() => props.renderTrigger(getIsOpen, () => (getIsOpen() ? dismiss() : setIsOpen(true)))}
            />

            <Popover
                id={() => popupId}
                role={"dialog"}
                ariaAttributes={() => ({
                    "aria-label": access(props.calendarLabel) ?? DEFAULT_DATE_RANGE_PICKER_CALENDAR_LABEL,
                })}
                isOpen={getIsOpen}
                anchorRef={getRootRef}
                placement={() => access(props.placement) ?? DEFAULT_DATE_RANGE_PICKER_PLACEMENT}
                offset={props.offset}
                transitionDurationMs={props.popupTransitionDurationMs}
                hasAutoFocus={true}
                onDismiss={(reason) => (reason === "escape" ? dismiss() : setIsOpen(false))}
                renderContent={(getVisibilityTarget, getTransitionDurationMs) =>
                    props.renderPopup(renderCalendar, monthSignal, getVisibilityTarget, getTransitionDurationMs)
                }
            />
        </div>
    );
};
