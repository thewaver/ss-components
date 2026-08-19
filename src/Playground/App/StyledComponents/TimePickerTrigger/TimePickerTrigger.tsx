import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import type { TimePickerTriggerProps } from "./TimePickerTrigger.types";

import * as styles from "./TimePickerTrigger.css";

export const PageTimePickerTrigger = (props: TimePickerTriggerProps) => (
    <Button
        getId={() => `${props.getKey()}Trigger`}
        getIsDisabled={props.getIsDisabled}
        getAriaLabel={() => "Open the clock"}
        onClick={props.onToggle}
        renderContent={(getFlags) => (
            <div
                class={styles.timePickerTrigger}
                classList={{
                    [styles.isHovered]: getFlags().isHovered,
                    [styles.isOpen]: props.getIsOpen(),
                    [styles.isDisabled]: getFlags().isDisabled,
                }}
                aria-hidden
            >
                ◷
            </div>
        )}
    />
);
