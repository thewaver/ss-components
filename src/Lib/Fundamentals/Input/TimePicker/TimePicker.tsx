import { createSignal, createUniqueId } from "solid-js";

import type { AnchorPlacement } from "../../../Abstracts/Anchor/Anchor.types";
import { SignalMirror } from "../../../Abstracts/SignalMirror/SignalMirror";
import { Popover } from "../../Popover/Popover";
import { Clock } from "../Clock/Clock";
import { TimeInput } from "../TimeInput/TimeInput";
import type { TimePickerProps, TimePickerTrigger } from "./TimePicker.types";

const DEFAULT_TIME_PICKER_PLACEMENT: AnchorPlacement = { x: "left-in", y: "bottom-out" };
const DEFAULT_TIME_PICKER_CLOCK_LABEL = "Choose a time";

export const TimePicker = (props: TimePickerProps) => {
    const popupId = createUniqueId();

    const [getRootRef, setRootRef] = createSignal<HTMLElement>();
    const [getIsOpen, setIsOpen] = SignalMirror.createOptional(() => props.visibilitySignal, false);

    const getClockLabel = () => props.getClockLabel?.() ?? DEFAULT_TIME_PICKER_CLOCK_LABEL;

    const dismiss = () => {
        if (!getIsOpen()) return;

        setIsOpen(false);
        getRootRef()?.querySelector("input")?.focus();
    };

    const open = () => {
        setIsOpen(true);
    };

    const trigger: TimePickerTrigger = {
        getIsOpen,
        toggle: () => (getIsOpen() ? dismiss() : open()),
    };

    const renderClock = () => (
        <Clock
            valueSignal={props.valueSignal}
            getMin={props.getMinTime}
            getMax={props.getMaxTime}
            getSteps={props.getClockSteps}
            getGap={props.getClockGap}
            getHasSeconds={props.getHasSeconds}
            getIsTwelveHour={props.getIsTwelveHour}
            getIsDisabled={props.getIsDisabled}
            getLocale={props.getLocale}
            getAriaLabel={getClockLabel}
            computeIsTimeDisabled={props.computeIsTimeDisabled}
            renderOption={props.renderOption}
            renderUnit={props.renderUnit}
            renderColumn={props.renderColumn}
        />
    );

    return (
        <div ref={setRootRef}>
            <TimeInput
                {...props}
                renderTrailing={(getFlags, meridiem) => props.renderTrailing(getFlags, meridiem, trigger)}
            />

            <Popover
                getId={() => popupId}
                getRole={() => "dialog"}
                getAriaAttributes={() => ({ "aria-label": getClockLabel() })}
                getIsOpen={getIsOpen}
                getAnchorRef={getRootRef}
                getPlacement={() => props.getPlacement?.() ?? DEFAULT_TIME_PICKER_PLACEMENT}
                getOffset={props.getOffset}
                getTransitionDurationMs={props.getPopupTransitionDurationMs}
                getHasAutoFocus={() => true}
                onDismiss={(reason) => (reason === "escape" ? dismiss() : setIsOpen(false))}
                renderContent={(getVisibilityTarget, getTransitionDurationMs) =>
                    props.renderPopup(renderClock, getVisibilityTarget, getTransitionDurationMs)
                }
            />
        </div>
    );
};
