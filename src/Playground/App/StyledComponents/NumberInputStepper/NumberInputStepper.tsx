import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { access } from "../../../../Lib/Utils/propUtils";
import type { NumberInputStepperProps } from "./NumberInputStepper.types";

import * as styles from "./NumberInputStepper.css";

export const PageNumberInputStepper = (props: NumberInputStepperProps) => {
    return (
        <div class={styles.numberInputStepper}>
            <Button
                isDisabled={() =>
                    access(props.flags).isDisabled ||
                    access(props.flags).isReadOnly ||
                    access(props.stepper).getIsAtMax()
                }
                onPointerDown={access(props.stepper).startSteppingUp}
                onPointerUp={access(props.stepper).stopStepping}
                onMouseLeave={access(props.stepper).stopStepping}
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
                isDisabled={() =>
                    access(props.flags).isDisabled ||
                    access(props.flags).isReadOnly ||
                    access(props.stepper).getIsAtMin()
                }
                onPointerDown={access(props.stepper).startSteppingDown}
                onPointerUp={access(props.stepper).stopStepping}
                onMouseLeave={access(props.stepper).stopStepping}
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
};
