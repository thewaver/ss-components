import type { ParentProps } from "solid-js";

import { access } from "../../../../Lib/Utils/propUtils";
import type { PageStaircaseStepProps } from "./StaircaseContent.types";

import * as styles from "./StaircaseContent.css";

export const PageStaircaseStep = (props: ParentProps<PageStaircaseStepProps>) => {
    return (
        <div class={styles.staircaseStep}>
            <div>{props.children}</div>

            <div class={styles.staircaseStepIndent}>{`${Math.round(access(props.state).stepIndent)}px`}</div>
        </div>
    );
};
