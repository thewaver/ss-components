import { DateTimeValueUtils } from "../../../Abstracts/DateTimeValue/DateTimeValue.utils";
import { access } from "../../../Utils/propUtils";
import { DatePicker } from "../DatePicker/DatePicker";
import { TimePicker } from "../TimePicker/TimePicker";
import type { DateTimePickerProps } from "./DateTimePicker.types";

import * as styles from "./DateTimePicker.css";

const DEFAULT_DATE_TIME_PICKER_DATE_LABEL = "Date";
const DEFAULT_DATE_TIME_PICKER_TIME_LABEL = "Time";

export const DateTimePicker = (props: DateTimePickerProps) => {
    const { dateSignal, timeSignal } = DateTimeValueUtils.createSplit(props.valueSignal);

    return (
        <div class={styles.dateTimePickerRoot}>
            <DatePicker
                {...props}
                valueSignal={dateSignal}
                visibilitySignal={props.dateVisibilitySignal}
                ariaLabel={() => access(props.dateLabel) ?? DEFAULT_DATE_TIME_PICKER_DATE_LABEL}
            />

            {props.renderSeparator?.()}

            <TimePicker
                {...props}
                valueSignal={timeSignal}
                visibilitySignal={props.timeVisibilitySignal}
                ariaLabel={() => access(props.timeLabel) ?? DEFAULT_DATE_TIME_PICKER_TIME_LABEL}
                renderLeading={undefined}
                renderTrailing={props.renderTimeTrailing}
                renderPopup={props.renderTimePopup}
            />
        </div>
    );
};
