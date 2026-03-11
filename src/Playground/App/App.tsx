import { createSignal } from "solid-js";

import { AnimDirection } from "../../Lib//Abstracts/Anim/Anim.types";
import { ScreenWiper } from "../../Lib//Fundamentals/ScreenWiper/ScreenWiper";
import { Button } from "../../Lib/Fundamentals/Button/Button";
import { Corners } from "../../Lib/Fundamentals/Corners/Corners";
import { Tooltip } from "../../Lib/Fundamentals/Tooltip/Tooltip";
import { Viewport } from "../../Lib/Fundamentals/Viewport/Viewport";

import * as styles from "./App.css";

const INITIAL_WIPE_DIRECTION: AnimDirection = "out";

export function AppContent() {
    // WIPE
    const [getWipeDirection, setWipeDirection] = createSignal(INITIAL_WIPE_DIRECTION);
    const [getIsWiping, setIsWiping] = createSignal(false);
    // TOGGLE
    const [getToggleOn, setToggleOn] = createSignal(false);

    return (
        <div class={styles.appContent}>
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
                renderTooltip={(anchorRef) => (
                    <Tooltip
                        anchorRef={anchorRef}
                        getPlacement={() => ({ x: "center", y: "top-out" })}
                        renderContent={(getVisibilityTarget) => (
                            <div
                                class={styles.tooltipContent}
                                classList={{ [styles.isVisible]: getVisibilityTarget() === 1 }}
                            >
                                Click me to wipe the screen. You should see a back and forth animation.
                            </div>
                        )}
                    />
                )}
                onClick={async () => {
                    if (!getIsWiping()) {
                        setWipeDirection("in");
                        setIsWiping(true);
                    }
                }}
            >
                <div class={styles.buttonContent}>Screen Wipe</div>
            </Button>

            <Button
                getIsSelected={getToggleOn}
                renderCorners={(getFlags) => (
                    <Corners getColor={() => (getFlags().isSelected ? "lime" : "transparent")} />
                )}
                onClick={async () => {
                    setToggleOn((prev) => !prev);
                }}
            >
                <div class={styles.buttonContent}>Toggle me</div>
            </Button>
        </div>
    );
}

export function App() {
    return (
        <div id="app">
            <Viewport getSize={() => ({ width: 1920, height: 1080 })}>
                <AppContent />
            </Viewport>
        </div>
    );
}
