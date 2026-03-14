import { createSignal } from "solid-js";

import { AnimDirection } from "../../Lib//Abstracts/Anim/Anim.types";
import { ScreenWiper } from "../../Lib//Fundamentals/ScreenWiper/ScreenWiper";
import { Button } from "../../Lib/Fundamentals/Button/Button";
import { Corners } from "../../Lib/Fundamentals/Corners/Corners";
import { ElementHighlight } from "../../Lib/Fundamentals/ElementHighlight/ElementHighlight";
import { Typewriter } from "../../Lib/Fundamentals/Typewriter/Typewriter";
import { Viewport } from "../../Lib/Fundamentals/Viewport/Viewport";

import * as styles from "./App.css";

const INITIAL_WIPE_DIRECTION: AnimDirection = "out";

export function AppContent() {
    let containerRef: HTMLDivElement | undefined;

    // WIPE
    const [getWipeDirection, setWipeDirection] = createSignal(INITIAL_WIPE_DIRECTION);
    const [getIsWiping, setIsWiping] = createSignal(false);
    // TOGGLE
    const [getToggleOn, setToggleOn] = createSignal(false);
    // TYPEWRITER
    const [getTextPrefix, setTextPrefix] = createSignal("");
    // HIGHLIGHTER
    const [getHighlightOn, setHighlightOn] = createSignal(false);

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
                renderHighlight={() => <Corners getColor={() => (getToggleOn() ? "lime" : "transparent")} />}
                onClick={async () => {
                    setToggleOn((prev) => !prev);
                }}
            >
                <div class={styles.buttonContent}>Toggle me</div>
            </Button>

            <Button
                getTooltipDefs={() => ({
                    getPlacement: () => ({ x: "center", y: "top-out" }),
                    renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                        <div
                            class={styles.tooltipContent}
                            classList={{ [styles.isVisible]: getVisibilityTarget() === 1 }}
                            style={{ transition: `opacity ${getTransitionDurationMs()}ms` }}
                        >
                            Click me change the text content, thus restarting the animation.
                        </div>
                    ),
                })}
                onClick={async () => {
                    setTextPrefix((prev) => (prev ? "" : "And some more text to make it longer!"));
                }}
            >
                <div class={styles.buttonContent}>Restart text animation</div>
            </Button>

            <div class={styles.textContent}>
                <Typewriter>{`This is a bit of text that fades in one line at a time. ${getTextPrefix()}`}</Typewriter>
            </div>

            <div
                ref={(el) => {
                    containerRef = el;
                }}
                class={styles.wrapper}
            >
                <Button
                    getTooltipDefs={() => ({
                        getPlacement: () => ({ x: "center", y: "top-out" }),
                        renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                            <div
                                class={styles.tooltipContent}
                                classList={{ [styles.isVisible]: getVisibilityTarget() === 1 }}
                                style={{ transition: `opacity ${getTransitionDurationMs()}ms` }}
                            >
                                Click me darken and blur the rest of the screen, thus highlighting my content.
                            </div>
                        ),
                    })}
                    onClick={async () => {
                        setHighlightOn((prev) => !prev);
                    }}
                >
                    <div class={styles.buttonContent}>Highlight me</div>
                </Button>
            </div>

            <ElementHighlight
                elementRef={containerRef}
                getPadding={() => 20}
                getIsVisible={getHighlightOn}
                renderHighlight={() => <Corners getColor={() => (getHighlightOn() ? "yellow" : "transparent")} />}
                renderOverlay={(getVisibilityTarget, getTransitionDurationMs) => (
                    <div
                        class={getVisibilityTarget() === 1 ? styles.overlayOn : styles.overlayOff}
                        style={{
                            transition: `background-color ${getTransitionDurationMs()}ms, backdrop-filter ${getTransitionDurationMs()}ms`,
                        }}
                    />
                )}
            />
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
