import { createSignal, createUniqueId } from "solid-js";

import type { AnchorPlacement } from "../../../Abstracts/Anchor/Anchor.types";
import { SignalMirror } from "../../../Abstracts/SignalMirror/SignalMirror";
import { access } from "../../../Utils/propUtils";
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

    const getClockLabel = () => access(props.clockLabel) ?? DEFAULT_TIME_PICKER_CLOCK_LABEL;

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
            min={props.minTime}
            max={props.maxTime}
            steps={props.clockSteps}
            gap={props.clockGap}
            hasSeconds={props.hasSeconds}
            isTwelveHour={props.isTwelveHour}
            isDisabled={props.isDisabled}
            locale={props.locale}
            ariaLabel={getClockLabel}
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
                id={() => popupId}
                role={"dialog"}
                ariaAttributes={() => ({ "aria-label": getClockLabel() })}
                isOpen={getIsOpen}
                anchorRef={getRootRef}
                placement={() => access(props.placement) ?? DEFAULT_TIME_PICKER_PLACEMENT}
                offset={props.offset}
                transitionDurationMs={props.popupTransitionDurationMs}
                hasAutoFocus={true}
                onDismiss={(reason) => (reason === "escape" ? dismiss() : setIsOpen(false))}
                renderContent={(getVisibilityTarget, getTransitionDurationMs) =>
                    props.renderPopup(renderClock, getVisibilityTarget, getTransitionDurationMs)
                }
            />
        </div>
    );
};
