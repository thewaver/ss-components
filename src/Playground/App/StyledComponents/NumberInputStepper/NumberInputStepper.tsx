import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import type { NumberInputStepperProps } from "./NumberInputStepper.types";

import * as styles from "./NumberInputStepper.css";

export const PageNumberInputStepper = (props: NumberInputStepperProps) => (
    <div class={styles.numberInputStepper}>
        <Button
            getIsDisabled={() =>
                props.getFlags().isDisabled || props.getFlags().isReadOnly || props.stepper.getIsAtMax()
            }
            onPointerDown={props.stepper.startSteppingUp}
            onPointerUp={props.stepper.stopStepping}
            onMouseLeave={props.stepper.stopStepping}
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
            onPointerDown={props.stepper.startSteppingDown}
            onPointerUp={props.stepper.stopStepping}
            onMouseLeave={props.stepper.stopStepping}
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
