import { For, createSignal } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Corners } from "../../../../Lib/Fundamentals/Corners/Corners";
import { ElementHighlight } from "../../../../Lib/Fundamentals/ElementHighlight/ElementHighlight";

import * as pageStyles from "../Pages.css";
import * as styles from "./ElementHighlightPage.css";

export const ElementHighlightPage = () => {
    let containerRefs: HTMLDivElement[] = [];

    const [getActiveIndex, setActiveIndex] = createSignal(0);
    const [getHighlightOn, setHighlightOn] = createSignal(false);

    return (
        <div class={styles.root}>
            <For each={Array.from({ length: 2 }, (_, i) => i)}>
                {(_, getIndex) => (
                    <div
                        ref={(el) => {
                            containerRefs[getIndex()] = el;
                        }}
                        class={styles.anchorWrapper}
                        style={{ "animation-name": getIndex() === 0 ? styles.slideH : styles.slideV }}
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
                                        Click me to darken and blur the rest of the screen, thus highlighting my
                                        content.
                                    </div>
                                ),
                            })}
                            onClick={async () => {
                                setActiveIndex(getIndex());
                                setHighlightOn((prev) => !prev);
                            }}
                        >
                            <div class={pageStyles.buttonContent}>Highlight Me</div>
                        </Button>
                    </div>
                )}
            </For>

            <ElementHighlight
                elementRef={containerRefs[getActiveIndex()]}
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
