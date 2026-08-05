import type { PageDemosProps } from "./Demos.types";

import * as styles from "./Demos.css";

export const PageDemos = (props: PageDemosProps) => <div class={styles.demosRoot}>{props.children}</div>;
