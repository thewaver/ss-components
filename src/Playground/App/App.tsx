import { createSignal } from "solid-js";

import { AnimDirection } from "../../Lib//Abstracts/Anim/Anim.types";
import { ScreenWiper } from "../../Lib//Fundamentals/ScreenWiper/ScreenWiper";
import { Button } from "../../Lib/Fundamentals/Button/Button";
import { Corners } from "../../Lib/Fundamentals/Corners/Corners";
import { Tooltip } from "../../Lib/Fundamentals/Tooltip/Tooltip";
import { Typewriter } from "../../Lib/Fundamentals/Typewriter/Typewriter";
import { Viewport } from "../../Lib/Fundamentals/Viewport/Viewport";

import * as styles from "./App.css";

const INITIAL_WIPE_DIRECTION: AnimDirection = "out";

export function AppContent() {
    // WIPE
    const [getWipeDirection, setWipeDirection] = createSignal(INITIAL_WIPE_DIRECTION);
    const [getIsWiping, setIsWiping] = createSignal(false);
    // TOGGLE
    const [getToggleOn, setToggleOn] = createSignal(false);
    // TYPEWRITER
    const [getTextPrefix, setTextPrefix] = createSignal("");

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
                getTooltipDefs={() => ({
                    getPlacement: () => ({ x: "center", y: "top-out" }),
                    renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                        <div
                            class={styles.tooltipContent}
                            classList={{ [styles.isVisible]: getVisibilityTarget() === 1 }}
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
                <div class={styles.buttonContent}>Screen Wipe</div>
            </Button>

            <Button
                getIsSelected={getToggleOn}
                renderCorners={() => <Corners getColor={() => (getToggleOn() ? "lime" : "transparent")} />}
                onClick={async () => {
                    setToggleOn((prev) => !prev);
                }}
            >
                <div class={styles.buttonContent}>Toggle me</div>
            </Button>

            <Button
                onClick={async () => {
                    setTextPrefix((prev) => (prev ? "" : "And some more text to make it longer!"));
                }}
            >
                <div class={styles.buttonContent}>Restart text animation</div>
            </Button>

            <div class={styles.textContent}>
                <Typewriter>{`This is a bit of text that fades in one line at a time. ${getTextPrefix()}`}</Typewriter>
            </div>
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
