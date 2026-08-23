import { createSignal } from "solid-js";

import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { SpotlightPrompt } from "../../../../../Lib/Fundamentals/SpotlightPrompt/SpotlightPrompt";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import { PADDING, renderHighlight, renderOverlay } from "../SpotlightPage.const";
import type { SpotlightPromptExampleProps } from "../SpotlightPage.types";

import * as styles from "../SpotlightPage.css";

type Props = SpotlightPromptExampleProps;

export const PromptExample = (props: Props) => {
    const [getAnchorRef, setAnchorRef] = createSignal<HTMLElement>();

    return (
        <div class={styles.root}>
            <Button
                ref={setAnchorRef}
                renderContent={(getFlags) => <PageButtonContent flags={getFlags}>Buy the potato</PageButtonContent>}
                onClick={async () => {
                    if (!props.visibilitySignal[0]()) return;

                    props.onBuy();
                    props.visibilitySignal[1](false);
                }}
            />

            <Button
                renderContent={(getFlags) => <PageButtonContent flags={getFlags}>Insist</PageButtonContent>}
                onClick={async () => {
                    props.visibilitySignal[1](true);
                }}
            />

            <SpotlightPrompt
                elementRef={getAnchorRef}
                padding={() => PADDING}
                visibilitySignal={props.visibilitySignal}
                renderHighlight={renderHighlight}
                renderOverlay={renderOverlay}
            />
        </div>
    );
};
