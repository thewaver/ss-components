import { Index, createMemo } from "solid-js";

import { access } from "../../Utils/propUtils";
import type { FormationInset, FormationProps } from "./Formation.types";

import * as styles from "./Formation.css";

const EMPTY_INSET: FormationInset = { top: 0, left: 0, width: 0, height: 0 };

const toContainerWidth = (ratio: number) => `${ratio * 100}cqw`;

export const Formation = <T,>(props: FormationProps<T>) => {
    const getItemCount = createMemo(() => access(props.items).length);

    const getLayout = createMemo(() => props.computeLayout(getItemCount()));

    const getInset = (index: number) => getLayout().insets[index] ?? EMPTY_INSET;

    return (
        <div class={styles.formationRoot}>
            <div
                class={styles.formationSpacer}
                style={{ height: toContainerWidth(getLayout().heightRatio) }}
                aria-hidden="true"
            />

            <Index each={access(props.items)}>
                {(getItem, index) => (
                    <div
                        class={styles.formationItem}
                        style={{
                            "left": toContainerWidth(getInset(index).left),
                            "top": toContainerWidth(getInset(index).top),
                            "width": toContainerWidth(getInset(index).width),
                            "height": toContainerWidth(getInset(index).height),
                            "z-index": access(props.isStackedInReverse) ? getItemCount() - index : index + 1,
                        }}
                    >
                        {props.renderItem(getItem, () => ({
                            index,
                            itemCount: getItemCount(),
                            inset: getInset(index),
                        }))}
                    </div>
                )}
            </Index>
        </div>
    );
};
