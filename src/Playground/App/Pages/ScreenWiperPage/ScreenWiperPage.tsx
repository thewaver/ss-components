import { createSignal } from "solid-js";

import { AnimDirection } from "../../../../Lib/Abstracts/Anim/Anim.types";
import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { ScreenWiper } from "../../../../Lib/Fundamentals/ScreenWiper/ScreenWiper";

import * as pageStyles from "../Pages.css";
import * as styles from "./ScreenWiperPage.css";

const INITIAL_WIPE_DIRECTION: AnimDirection = "out";

export const ScreenWiperPage = () => {
    const [getWipeDirection, setWipeDirection] = createSignal<AnimDirection>(INITIAL_WIPE_DIRECTION);
    const [getIsWiping, setIsWiping] = createSignal(false);

    return (
        <div class={styles.root}>
            <ScreenWiper
                getInitialWipeDirection={() => INITIAL_WIPE_DIRECTION}
                getWipeDirection={getWipeDirection}
                onTransitionEnd={() => {
                    if (getWipeDirection() === "in") {
                        setWipeDirection("out");
                    } else {
                        setIsWiping(false);
                    }
                }}
            />

            <Button
                getTooltipDefs={() => ({
                    getPlacement: () => ({ x: "center", y: "top-out" }),
                    getOffset: () => ({ x: 0, y: 5 }),
                    renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                        <div
                            class={pageStyles.tooltipContent}
                            classList={{ [pageStyles.isVisible]: getVisibilityTarget() === 1 }}
                            style={{ transition: `opacity ${getTransitionDurationMs()}ms` }}
                        >
                            Click me to wipe the screen. You should see a back and forth animation.
                        </div>
                    ),
                })}
                onClick={async () => {
                    if (!getIsWiping()) {
                        setWipeDirection("in");
                        setIsWiping(true);
                    }
                }}
            >
                <div class={pageStyles.buttonContent}>Click to Wipe</div>
            </Button>
        </div>
    );
};
