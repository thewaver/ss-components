import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import type { ScrollerButtonProps } from "./ScrollerButton.types";

import * as styles from "./ScrollerButton.css";

export const PageScrollerButton = (props: ScrollerButtonProps) => {
    const getIsPrevious = () => props.getStep() === "previous";

    return (
        <Button
            getIsDisabled={() => (getIsPrevious() ? props.stepper.getIsAtStart() : props.stepper.getIsAtEnd())}
            getAriaLabel={() => (getIsPrevious() ? "Scroll back" : "Scroll forward")}
            onClick={() => (getIsPrevious() ? props.stepper.stepToPrevious() : props.stepper.stepToNext())}
            renderContent={(getFlags) => (
                <div
                    class={styles.scrollerButton}
                    classList={{
                        [styles.isHovered]: getFlags().isHovered,
                        [styles.isActive]: getFlags().isActive,
                        [styles.isDisabled]: getFlags().isDisabled,
                    }}
                    aria-hidden
                >
                    {getIsPrevious() ? "‹" : "›"}
                </div>
            )}
        />
    );
};
