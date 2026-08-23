import { createMemo } from "solid-js";
import { Dynamic } from "solid-js/web";

import { access } from "../../../Utils/propUtils";
import { LABEL_CONTEXT, LabelContextProvider, useLabelContext } from "./Label.context";
import type { LabelDir, LabelProps } from "./Label.types";

import * as styles from "./Label.css";

const DEFAULT_LABEL_DIR: LabelDir = "row";
const DEFAULT_LABEL_GAP = 10;

export const Label = (props: LabelProps) => {
    const context = useLabelContext();

    const getDir = createMemo(() => access(props.dir) ?? DEFAULT_LABEL_DIR);

    return (
        <Dynamic
            component={context.getIsLabelled() ? "div" : "label"}
            class={styles.labelRoot}
            style={{
                "flex-direction": getDir(),
                "gap": `${access(props.gap) ?? DEFAULT_LABEL_GAP}px`,
            }}
        >
            <LabelContextProvider value={LABEL_CONTEXT}>{props.children}</LabelContextProvider>
        </Dynamic>
    );
};
