import { access } from "../../../../Lib/Utils/propUtils";
import type { PageCodeBoxProps } from "./CodeBox.types";

import * as styles from "./CodeBox.css";

export const PageCodeBox = (props: PageCodeBoxProps) => {
    return (
        <div class={styles.codeBoxRoot}>
            <div class={styles.codeBoxContent} innerHTML={access(props.source)} />
        </div>
    );
};
