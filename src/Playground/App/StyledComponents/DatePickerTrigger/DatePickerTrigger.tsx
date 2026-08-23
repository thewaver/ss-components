import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { access } from "../../../../Lib/Utils/propUtils";
import type { DatePickerTriggerProps } from "./DatePickerTrigger.types";

import * as styles from "./DatePickerTrigger.css";

export const PageDatePickerTrigger = (props: DatePickerTriggerProps) => {
    return (
        <Button
            id={() => `${access(props.key)}Trigger`}
            isDisabled={props.isDisabled}
            ariaLabel={"Open the calendar"}
            onClick={props.onToggle}
            renderContent={(getFlags) => (
                <div
                    class={styles.datePickerTrigger}
                    classList={{
                        [styles.isHovered]: getFlags().isHovered,
                        [styles.isOpen]: access(props.isOpen),
                        [styles.isDisabled]: getFlags().isDisabled,
                    }}
                    aria-hidden
                >
                    ▦
                </div>
            )}
        />
    );
};
