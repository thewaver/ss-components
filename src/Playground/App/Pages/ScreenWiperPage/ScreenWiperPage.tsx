import { createSignal } from "solid-js";

import type { AnimDirection } from "../../../../Lib/Abstracts/Anim/Anim.types";
import { ScreenWiper } from "../../../../Lib/Exotics/ScreenWiper/ScreenWiper";
import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import { PageTooltipContent } from "../../StyledComponents/TooltipContent/TooltipContent";

import * as styles from "./ScreenWiperPage.css";

const INITIAL_WIPE_DIRECTION: AnimDirection = "out";

export const ScreenWiperPage = () => {
    const [getWipeDirection, setWipeDirection] = createSignal<AnimDirection>(INITIAL_WIPE_DIRECTION);
    const [getIsWiping, setIsWiping] = createSignal(false);

    return (
        <div class={styles.root}>
            <ScreenWiper
                initialWipeDirection={() => INITIAL_WIPE_DIRECTION}
                wipeDirection={getWipeDirection}
                onTransitionEnd={() => {
                    if (getWipeDirection() === "in") {
                        setWipeDirection("out");
                    } else {
                        setIsWiping(false);
                    }
                }}
            />

            <Button
                tooltipDefs={() => ({
                    placement: () => ({ x: "center", y: "top-out" }),
                    offset: () => ({ x: 0, y: 5 }),
                    renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                        <PageTooltipContent
                            visibilityTarget={getVisibilityTarget}
                            transitionDurationMs={getTransitionDurationMs}
                        >
                            Click me to wipe the screen. You should see a back and forth animation.
                        </PageTooltipContent>
                    ),
                })}
                onClick={async () => {
                    if (!getIsWiping()) {
                        setWipeDirection("in");
                        setIsWiping(true);
                    }
                }}
                renderContent={(getFlags) => <PageButtonContent flags={getFlags}>Click to Wipe</PageButtonContent>}
            />
        </div>
    );
};
