import { createSignal } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Corners } from "../../../../Lib/Fundamentals/Corners/Corners";
import { ElementHighlight } from "../../../../Lib/Fundamentals/ElementHighlight/ElementHighlight";

import * as pageStyles from "../Pages.css";
import * as styles from "./ElementHighlightPage.css";

export const ElementHighlightPage = () => {
    let containerRef: HTMLDivElement | undefined;

    const [getHighlightOn, setHighlightOn] = createSignal(false);

    return (
        <div class={styles.root}>
            <div
                ref={(el) => {
                    containerRef = el;
                }}
                class={styles.anchorWrapper}
            >
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
                                Click me to darken and blur the rest of the screen, thus highlighting my content.
                            </div>
                        ),
                    })}
                    onClick={async () => {
                        setHighlightOn((prev) => !prev);
                    }}
                >
                    <div class={pageStyles.buttonContent}>Highlight Me</div>
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
};
