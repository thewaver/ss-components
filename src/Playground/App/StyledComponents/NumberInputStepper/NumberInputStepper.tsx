import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import type { NumberInputStepperProps } from "./NumberInputStepper.types";

import * as styles from "./NumberInputStepper.css";

export const PageNumberInputStepper = (props: NumberInputStepperProps) => (
    <div class={styles.numberInputStepper}>
        <Button
            getIsDisabled={() =>
                props.getFlags().isDisabled || props.getFlags().isReadOnly || props.stepper.getIsAtMax()
            }
            onClick={props.stepper.stepUp}
            renderContent={(getFlags) => (
                <div
                    class={styles.numberInputStepperButton}
                    classList={{
                        [styles.isHovered]: getFlags().isHovered,
                        [styles.isDisabled]: getFlags().isDisabled,
                    }}
                >
                    <span aria-hidden="true">▲</span>
                    <span class={styles.numberInputStepperName}>Increase</span>
                </div>
            )}
        />

        <Button
            getIsDisabled={() =>
                props.getFlags().isDisabled || props.getFlags().isReadOnly || props.stepper.getIsAtMin()
            }
            onClick={props.stepper.stepDown}
            renderContent={(getFlags) => (
                <div
                    class={styles.numberInputStepperButton}
                    classList={{
                        [styles.isHovered]: getFlags().isHovered,
                        [styles.isDisabled]: getFlags().isDisabled,
                    }}
                >
                    <span aria-hidden="true">▼</span>
                    <span class={styles.numberInputStepperName}>Decrease</span>
                </div>
            )}
        />
    </div>
);
