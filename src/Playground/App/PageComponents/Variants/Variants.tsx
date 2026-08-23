import { For } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import type { VariantsProps } from "./Variants.types";

import * as styles from "./Variants.css";

export const PageVariants = (props: VariantsProps) => {
    return (
        <div class={styles.variantsRoot}>
            <For each={access(props.items)}>
                {(variant) => (
                    <div class={styles.variantContainer} data-variant data-testid={variant.key}>
                        <div class={styles.variantTitle}>{variant.name}</div>

                        <div class={styles.variantDemo}>{variant.component()}</div>

                        {variant.readout && (
                            <div class={styles.variantReadout} data-readout>
                                {variant.readout()}
                            </div>
                        )}
                    </div>
                )}
            </For>
        </div>
    );
};
