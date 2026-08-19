import { For } from "solid-js";

import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { SpotlightHint } from "../../../../../Lib/Fundamentals/SpotlightHint/SpotlightHint";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import { PADDING, renderHighlight, renderOverlay } from "../SpotlightPage.const";
import type { SpotlightHintExampleProps } from "../SpotlightPage.types";

import * as styles from "../SpotlightPage.css";

const ANCHOR_COUNT = 2;

type Props = SpotlightHintExampleProps;

export const HintExample = (props: Props) => {
    const anchorRefs: HTMLElement[] = [];

    return (
        <div class={styles.root}>
            <For each={Array.from({ length: ANCHOR_COUNT }, (_unused, index) => index)}>
                {(_unused, getIndex) => (
                    <div
                        ref={(element) => {
                            anchorRefs[getIndex()] = element;
                        }}
                        class={styles.anchorWrapper}
                        style={{ "animation-name": getIndex() === 0 ? styles.slideH : styles.slideV }}
                    >
                        <Button
                            onClick={async () => {
                                props.onIndexChange(getIndex());
                                props.visibilitySignal[1]((prev) => !prev);
                            }}
                            renderContent={(getFlags) => (
                                <PageButtonContent getFlags={getFlags}>Highlight Me</PageButtonContent>
                            )}
                        />
                    </div>
                )}
            </For>

            <SpotlightHint
                getElementRef={() => anchorRefs[props.getIndex()]}
                getPadding={() => PADDING}
                visibilitySignal={props.visibilitySignal}
                renderHighlight={renderHighlight}
                renderOverlay={renderOverlay}
            />
        </div>
    );
};
