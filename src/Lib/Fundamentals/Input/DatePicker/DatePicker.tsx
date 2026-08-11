import type { Signal } from "solid-js";
import { createSignal, createUniqueId, untrack } from "solid-js";

import type { AnchorPlacement } from "../../../Abstracts/Anchor/Anchor.types";
import type { DateValue } from "../../../Abstracts/DateValue/DateValue.types";
import { DateValueUtils } from "../../../Abstracts/DateValue/DateValue.utils";
import { Popover } from "../../Popover/Popover";
import { Calendar } from "../Calendar/Calendar";
import { DateInput } from "../DateInput/DateInput";
import type { DatePickerProps } from "./DatePicker.types";

const DEFAULT_DATE_PICKER_PLACEMENT: AnchorPlacement = { x: "left-in", y: "bottom-out" };
const DEFAULT_DATE_PICKER_CALENDAR_LABEL = "Choose a date";

const toMonth = (value: DateValue): DateValue => ({ year: value.year, month: value.month, day: 1 });

export const DatePicker = (props: DatePickerProps) => {
    const popupId = createUniqueId();

    const [getRootRef, setRootRef] = createSignal<HTMLElement>();
    const [getIsOpen, setIsOpen] = createSignal(false);

    const monthSignal: Signal<DateValue> = createSignal(
        toMonth(untrack(() => props.valueSignal[0]()) ?? DateValueUtils.fromDate(new Date())),
    );

    const dismiss = () => {
        setIsOpen(false);
        getRootRef()?.querySelector("input")?.focus();
    };

    const open = () => {
        const value = untrack(() => props.valueSignal[0]());

        if (value) monthSignal[1](toMonth(value));

        setIsOpen(true);
    };

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
