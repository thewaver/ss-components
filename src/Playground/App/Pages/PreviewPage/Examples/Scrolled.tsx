import { For } from "solid-js";

import type { PreviewExampleProps } from "../PreviewPage.types";
import { TextExample } from "./Text";

import * as styles from "../PreviewPage.css";

const AFTERWARDS = [
    "The rest of the page carries on below, which is the whole of the problem.",
    "Open the preview, read to the end of it, and close it again: everything under it jumps up by the height that just disappeared, and the control you pressed goes with it.",
    "With the scroll asked for, the box comes back to where you were standing.",
];

type Props = PreviewExampleProps;

export const ScrolledExample = (props: Props) => {
    return (
        <div class={styles.scrollBox} data-scroll-box>
            <TextExample
                expandedSignal={props.expandedSignal}
                collapsedHeight={props.collapsedHeight}
                isScrolledIntoViewOnCollapse={true}
                paragraphs={props.paragraphs}
            />

            <div class={styles.afterwards}>
                <For each={AFTERWARDS}>{(paragraph) => <div>{paragraph}</div>}</For>
            </div>
        </div>
    );
};
