import { For } from "solid-js";

import type { VariantsProps } from "./Variants.types";

import * as styles from "./Variants.css";

export const PageVariants = (props: VariantsProps) => (
    <div class={styles.variantsRoot}>
        <For each={props.getItems()}>
            {(variant) => (
                <div class={styles.variantContainer} data-variant={variant.name}>
                    <div class={styles.variantTitle}>{variant.name}</div>

                    {variant.component()}

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
