import { createSignal } from "solid-js";

import { ContextMenu } from "../../../../../Lib/Fundamentals/Menu/Menu";
import { ACTIONS, renderMenuItem, renderMenuPopup } from "../MenuPage.const";
import type { MenuExampleProps } from "../MenuPage.types";

import * as styles from "../MenuPage.css";

type Props = MenuExampleProps;

export const ContextAreaExample = (props: Props) => {
    const [getRegionRef, setRegionRef] = createSignal<HTMLElement>();

    return (
        <>
            <div ref={setRegionRef} class={styles.contextRegion}>
                Right-click anywhere in this box
            </div>

            <ContextMenu
                regionRef={getRegionRef}
                items={() => ACTIONS}
                ariaLabel={"Edit actions"}
                renderItem={renderMenuItem}
                renderPopup={renderMenuPopup}
                onActivate={props.onActivate}
            />
        </>
    );
};
