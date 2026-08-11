import type { Signal } from "solid-js";
import { createEffect, createSignal, createUniqueId, untrack } from "solid-js";

import type { AnchorPlacement } from "../../../Abstracts/Anchor/Anchor.types";
import type { DateValue } from "../../../Abstracts/DateValue/DateValue.types";
import { DateValueUtils } from "../../../Abstracts/DateValue/DateValue.utils";
import { SignalMirror } from "../../../Abstracts/SignalMirror/SignalMirror";
import { Popover } from "../../Popover/Popover";
import { Calendar } from "../Calendar/Calendar";
import { DateInput } from "../DateInput/DateInput";
import type { DatePickerProps } from "./DatePicker.types";

const DEFAULT_DATE_PICKER_PLACEMENT: AnchorPlacement = { x: "left-in", y: "bottom-out" };
const DEFAULT_DATE_PICKER_CALENDAR_LABEL = "Choose a date";

const toMonth = (value: DateValue): DateValue => DateValueUtils.getStartOfMonth(value);

export const DatePicker = (props: DatePickerProps) => {
    const popupId = createUniqueId();

    const [getRootRef, setRootRef] = createSignal<HTMLElement>();
    const [getIsOpen, setIsOpen] = SignalMirror.createOptional(() => props.visibilitySignal, false);

    const monthSignal: Signal<DateValue> = createSignal(
        toMonth(untrack(() => props.valueSignal[0]()) ?? DateValueUtils.fromDate(new Date())),
    );

    const dismiss = () => {
        setIsOpen(false);
        getRootRef()?.querySelector("input")?.focus();
    };

    const open = () => {
        setIsOpen(true);
    };

    /**
     * The calendar moves to the value's own month from an effect rather than from `open`, so that a consumer
     * opening the popup through `visibilitySignal` lands on the same month the trigger would have shown. Anything
     * that has to happen because the popup is open belongs to the state, not to one of the ways in.
     */
    createEffect(() => {
        if (!getIsOpen()) return;

        const value = untrack(() => props.valueSignal[0]());

        if (value) monthSignal[1](() => toMonth(value));
    });

    const renderCalendar = () => (
        <Calendar
            valueSignal={props.valueSignal}
            monthSignal={monthSignal}
            getMin={props.getMinDate}
            getMax={props.getMaxDate}
            getIsDisabled={props.getIsDisabled}
            getLocale={props.getLocale}
            getWeekStartsOn={props.getWeekStartsOn}
            getAriaLabel={() => props.getCalendarLabel?.() ?? DEFAULT_DATE_PICKER_CALENDAR_LABEL}
            renderDay={props.renderDay}
            renderWeekday={props.renderWeekday}
        />
    );

    return (
        <div ref={setRootRef}>
            <DateInput
                {...props}
                renderTrailing={() => props.renderTrigger(getIsOpen, () => (getIsOpen() ? dismiss() : open()))}
            />

            <Popover
                getId={() => popupId}
                getRole={() => "dialog"}
                getAriaAttributes={() => ({
                    "aria-label": props.getCalendarLabel?.() ?? DEFAULT_DATE_PICKER_CALENDAR_LABEL,
                })}
                getIsOpen={getIsOpen}
                getAnchorRef={getRootRef}
                getPlacement={() => props.getPlacement?.() ?? DEFAULT_DATE_PICKER_PLACEMENT}
                getOffset={props.getOffset}
                getTransitionDurationMs={props.getPopupTransitionDurationMs}
                getHasAutoFocus={() => true}
                onDismiss={(reason) => (reason === "escape" ? dismiss() : setIsOpen(false))}
                renderContent={(getVisibilityTarget, getTransitionDurationMs) =>
                    props.renderPopup(renderCalendar, monthSignal, getVisibilityTarget, getTransitionDurationMs)
                }
            />
        </div>
    );
};
