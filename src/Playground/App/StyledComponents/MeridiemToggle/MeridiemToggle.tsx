import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { access } from "../../../../Lib/Utils/propUtils";
import type { MeridiemToggleProps } from "./MeridiemToggle.types";

import * as styles from "./MeridiemToggle.css";

export const PageMeridiemToggle = (props: MeridiemToggleProps) => {
    return (
        <Button
            isDisabled={props.isDisabled}
            ariaLabel={() => `Before or after noon: ${access(props.meridiem) === "am" ? "AM" : "PM"}`}
            onClick={props.onToggle}
            renderContent={(getFlags) => (
                <div
                    class={styles.meridiemToggle}
                    classList={{
                        [styles.isHovered]: getFlags().isHovered,
                        [styles.isDisabled]: getFlags().isDisabled,
                    }}
                    aria-hidden
                >
                    {access(props.meridiem) === "am" ? "AM" : "PM"}
                </div>
            )}
        />
    );
};
