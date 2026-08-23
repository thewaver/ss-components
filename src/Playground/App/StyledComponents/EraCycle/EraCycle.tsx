import { Show } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { access } from "../../../../Lib/Utils/propUtils";
import type { EraCycleProps } from "./EraCycle.types";

import * as styles from "./EraCycle.css";

const SINGLE_ERA = 1;

export const PageEraCycle = (props: EraCycleProps) => {
    const getCurrent = () => access(props.options).find((option) => option.id === access(props.era));

    const getLabel = () => getCurrent()?.name ?? access(props.era);

    const advance = () => {
        const options = access(props.options);
        const index = options.findIndex((option) => option.id === access(props.era));

        props.onChange(options[(index + 1) % options.length].id);
    };

    return (
        <Show when={access(props.options).length > SINGLE_ERA}>
            <Button
                isDisabled={props.isDisabled}
                ariaLabel={() => `Era: ${getLabel()}`}
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
                        {getCurrent()?.shortName ?? access(props.era)}
                    </div>
                )}
            />
        </Show>
    );
};
