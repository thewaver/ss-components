import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { access } from "../../../../Lib/Utils/propUtils";
import type { ScrollerButtonProps } from "./ScrollerButton.types";

import * as styles from "./ScrollerButton.css";

export const PageScrollerButton = (props: ScrollerButtonProps) => {
    const getIsPrevious = () => access(props.step) === "previous";

    return (
        <Button
            isDisabled={() =>
                getIsPrevious() ? access(props.stepper).getIsAtStart() : access(props.stepper).getIsAtEnd()
            }
            ariaLabel={() => (getIsPrevious() ? "Scroll back" : "Scroll forward")}
            onClick={() =>
                getIsPrevious() ? access(props.stepper).stepToPrevious() : access(props.stepper).stepToNext()
            }
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
