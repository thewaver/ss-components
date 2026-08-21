import { For } from "solid-js";

import { Preview } from "../../../../../Lib/Fundamentals/Preview/Preview";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import type { PreviewExampleProps } from "../PreviewPage.types";

import * as styles from "../PreviewPage.css";

type Props = PreviewExampleProps;

export const TextExample = (props: Props) => (
    <div class={styles.panel}>
        <Preview
            expandedSignal={props.expandedSignal}
            getCollapsedHeight={props.getCollapsedHeight}
            getIsScrolledIntoViewOnCollapse={props.getIsScrolledIntoViewOnCollapse}
            renderContent={() => (
                <div class={styles.paragraphs}>
                    <For each={props.getParagraphs()}>{(paragraph) => <div>{paragraph}</div>}</For>
                </div>
            )}
            renderOverlay={(getVisibilityTarget, getTransitionDurationMs) => (
                <div
                    class={styles.fade}
                    style={{
                        opacity: getVisibilityTarget(),
                        transition: `opacity ${getTransitionDurationMs()}ms`,
                    }}
                />
            )}
            renderTrigger={(getFlags) => (
                <PageButtonContent getFlags={getFlags}>
                    {getFlags().isExpanded ? "Show less" : "Read more"}
                </PageButtonContent>
            )}
        />
    </div>
);
