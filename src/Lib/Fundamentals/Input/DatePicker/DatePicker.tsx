import type { Signal } from "solid-js";
import { createEffect, createSignal, createUniqueId, untrack } from "solid-js";

import type { AnchorPlacement } from "../../../Abstracts/Anchor/Anchor.types";
import type { DateValue } from "../../../Abstracts/DateValue/DateValue.types";
import { DateValueUtils } from "../../../Abstracts/DateValue/DateValue.utils";
import { SignalMirror } from "../../../Abstracts/SignalMirror/SignalMirror";
import { access } from "../../../Utils/propUtils";
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
        if (!getIsOpen()) return;

        setIsOpen(false);
        getRootRef()?.querySelector("input")?.focus();
    };

    const open = () => {
        setIsOpen(true);
    };

    createEffect(() => {
        if (!getIsOpen()) return;

        const value = untrack(() => props.valueSignal[0]());

        if (value) monthSignal[1](() => toMonth(value));
    });

    const renderCalendar = () => (
        <Calendar
            valueSignal={props.valueSignal}
            monthSignal={monthSignal}
            min={props.minDate}
            max={props.maxDate}
            isDisabled={props.isDisabled}
            locale={props.locale}
            weekStartsOn={props.weekStartsOn}
            ariaLabel={() => access(props.calendarLabel) ?? DEFAULT_DATE_PICKER_CALENDAR_LABEL}
            computeIsDayDisabled={props.computeIsDayDisabled}
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
                id={() => popupId}
                role={"dialog"}
                ariaAttributes={() => ({
                    "aria-label": access(props.calendarLabel) ?? DEFAULT_DATE_PICKER_CALENDAR_LABEL,
                })}
                isOpen={getIsOpen}
                anchorRef={getRootRef}
                placement={() => access(props.placement) ?? DEFAULT_DATE_PICKER_PLACEMENT}
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
