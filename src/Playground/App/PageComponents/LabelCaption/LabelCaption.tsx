import type { ParentProps } from "solid-js";

import * as styles from "./LabelCaption.css";

export const PageLabelCaption = (props: ParentProps) => <div class={styles.labelCaption}>{props.children}</div>;
