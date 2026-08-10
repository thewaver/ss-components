import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import type { MeridiemToggleProps } from "./MeridiemToggle.types";

import * as styles from "./MeridiemToggle.css";

export const PageMeridiemToggle = (props: MeridiemToggleProps) => (
    <Button
        getIsDisabled={props.getIsDisabled}
        getAriaLabel={() => `Before or after noon: ${props.getMeridiem() === "am" ? "AM" : "PM"}`}
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
                {props.getMeridiem() === "am" ? "AM" : "PM"}
            </div>
        )}
    />
);
