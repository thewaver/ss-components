import { createSignal } from "solid-js";

import { AnimDirection } from "../../Lib//Abstracts/Anim/Anim.types";
import { ScreenWiper } from "../../Lib//Fundamentals/ScreenWiper/ScreenWiper";
import { Button } from "../../Lib/Fundamentals/Button/Button";
import { ShapeButton } from "../../Lib/Fundamentals/Button/variants/ShapeButton/ShapeButton";
import { useColorExtractor } from "../../Lib/Fundamentals/ColorExtractor/ColorExtractor.context";
import { Corners } from "../../Lib/Fundamentals/Corners/Corners";
import { ElementHighlight } from "../../Lib/Fundamentals/ElementHighlight/ElementHighlight";
import { Typewriter } from "../../Lib/Fundamentals/Typewriter/Typewriter";
import { Viewport } from "../../Lib/Fundamentals/Viewport/Viewport";
import knight from "./knight.png";

import * as styles from "./App.css";

const INITIAL_WIPE_DIRECTION: AnimDirection = "out";

export function AppContent() {
    const dominantColor = useColorExtractor({
        getSrc: () => knight,
        getColorCount: () => 3,
    });

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
    // TEXT WIDTH
    const [getTextWidth, setTextWidth] = createSignal(240);

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
                            Click me to change the text content, thus restarting the animation.
                        </div>
                    ),
                })}
                onClick={async () => {
                    setTextPrefix((prev) => (prev ? "" : "And some more text to make it longer!"));
                }}
            >
                <div class={styles.buttonContent}>Restart text animation</div>
            </Button>

            <div class={styles.textContent} style={{ width: `${getTextWidth()}px` }}>
                <Typewriter>
                    This is a bit of{" "}
                    <b>
                        text that appears
                        <div class={styles.textHighlight} style={{ color: "red" }} title="ONE MEANS ONE!">
                            one
                        </div>
                    </b>
                    <span>single</span>
                    {" text character\tat a time,"}
                    <br />
                    <br />
                    <div style={{ "width": "100%", "height": "0.5em", "border-bottom": "2px solid currentColor" }} />
                    {"and has\nescaped "}
                    <img src={knight} height={24} style={{ "vertical-align": "middle" }} />
                    <a href="www.google.com">characters.</a>
                </Typewriter>
            </div>

            <div class={styles.textContent} style={{ width: `${getTextWidth()}px` }}>
                <Typewriter>{"I am a brown, crispy potatoe!?..."}</Typewriter>
            </div>
            <div class={styles.textContent} style={{ width: `${getTextWidth()}px` }}>
                {"I am a brown, crispy potatoe!?..."}
            </div>
            <div class={styles.flexRow}>
                <Button
                    onClick={async () => {
                        setTextWidth((prev) => prev - 4);
                    }}
                >
                    <div class={styles.buttonContent}>-</div>
                </Button>
                {getTextWidth()}
                <Button
                    onClick={async () => {
                        setTextWidth((prev) => prev + 4);
                    }}
                >
                    <div class={styles.buttonContent}>+</div>
                </Button>
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
                                Click me to darken and blur the rest of the screen, thus highlighting my content.
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

            {/*
            <div
                class={styles.imgContent}
                style={{
                    "background-image": `linear-gradient(45deg, ${dominantColor.getColorData()?.[0]?.css() ?? "transparent"} 50%, ${dominantColor.getColorData()?.[1]?.css() ?? "transparent"} 50%)`,
                }}
            >
                <img src={knight} height="100%" />
            </div>
            */}

            <div class={styles.flexRow}>
                <ShapeButton
                    onClick={async () => console.log("click")}
                    getWidth={() => 320}
                    getHeight={() => 240}
                    getShape={() => "lozenge"}
                    getStrokeDefs={() => ({ color: "#0000FF80", width: 10 })}
                    getFillDefs={() => ({ color: "#806040" })}
                />
                <ShapeButton
                    getWidth={() => 320}
                    getHeight={() => 240}
                    getShape={() => "hexagon"}
                    getStrokeDefs={() => ({ color: "#00FF0080", width: 20 })}
                    getFillDefs={() => ({ color: "#806040" })}
                />
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
