import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import type { DatePickerTriggerProps } from "./DatePickerTrigger.types";

import * as styles from "./DatePickerTrigger.css";

export const PageDatePickerTrigger = (props: DatePickerTriggerProps) => (
    <Button
        getIsDisabled={props.getIsDisabled}
        getAriaLabel={() => "Open the calendar"}
        onClick={props.onToggle}
        renderContent={(getFlags) => (
            <div
                class={styles.datePickerTrigger}
                classList={{
                    [styles.isHovered]: getFlags().isHovered,
                    [styles.isOpen]: props.getIsOpen(),
                    [styles.isDisabled]: getFlags().isDisabled,
                }}
                aria-hidden
            >
                ▦
            </div>
        )}
    />
);
