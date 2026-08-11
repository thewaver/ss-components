import { Show } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import type { EraCycleProps } from "./EraCycle.types";

import * as styles from "./EraCycle.css";

const SINGLE_ERA = 1;

export const PageEraCycle = (props: EraCycleProps) => {
    const getCurrent = () => props.getOptions().find((option) => option.id === props.getEra());

    const getLabel = () => getCurrent()?.name ?? props.getEra();

    const advance = () => {
        const options = props.getOptions();
        const index = options.findIndex((option) => option.id === props.getEra());

        props.onChange(options[(index + 1) % options.length].id);
    };

    return (
        <Show when={props.getOptions().length > SINGLE_ERA}>
            <Button
                getIsDisabled={props.getIsDisabled}
                getAriaLabel={() => `Era: ${getLabel()}`}
                onClick={advance}
                renderContent={(getFlags) => (
                    <div
                        class={styles.eraCycle}
                        classList={{
                            [styles.isHovered]: getFlags().isHovered,
                            [styles.isDisabled]: getFlags().isDisabled,
                        }}
                        aria-hidden
                    >
                        {getCurrent()?.shortName ?? props.getEra()}
                    </div>
                )}
            />
        </Show>
    );
};
