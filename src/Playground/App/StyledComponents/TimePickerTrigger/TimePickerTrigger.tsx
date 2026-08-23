import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { access } from "../../../../Lib/Utils/propUtils";
import type { TimePickerTriggerProps } from "./TimePickerTrigger.types";

import * as styles from "./TimePickerTrigger.css";

export const PageTimePickerTrigger = (props: TimePickerTriggerProps) => {
    return (
        <Button
            id={() => `${access(props.key)}Trigger`}
            isDisabled={props.isDisabled}
            ariaLabel={"Open the clock"}
            onClick={props.onToggle}
            renderContent={(getFlags) => (
                <div
                    class={styles.timePickerTrigger}
                    classList={{
                        [styles.isHovered]: getFlags().isHovered,
                        [styles.isOpen]: access(props.isOpen),
                        [styles.isDisabled]: getFlags().isDisabled,
                    }}
                    aria-hidden
                >
                    ◷
                </div>
            )}
        />
    );
};
