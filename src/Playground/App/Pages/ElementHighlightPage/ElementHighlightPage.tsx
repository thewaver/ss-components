import { For, createSignal } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Corners } from "../../../../Lib/Fundamentals/Corners/Corners";
import { ElementHighlight } from "../../../../Lib/Fundamentals/ElementHighlight/ElementHighlight";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import { PageTooltipContent } from "../../StyledComponents/TooltipContent/TooltipContent";

import * as styles from "./ElementHighlightPage.css";

export const ElementHighlightPage = () => {
    let containerRefs: HTMLElement[] = [];

    const [getActiveIndex, setActiveIndex] = createSignal(0);
    const highlightVisibility = createSignal(false);
    const [, setHighlightOn] = highlightVisibility;

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
                                    <PageTooltipContent
                                        getVisibilityTarget={getVisibilityTarget}
                                        getTransitionDurationMs={getTransitionDurationMs}
                                    >
                                        Click me to darken and blur the rest of the screen, thus highlighting my
                                        content.
                                    </PageTooltipContent>
                                ),
                            })}
                            onClick={async () => {
                                setActiveIndex(getIndex());
                                setHighlightOn((prev) => !prev);
                            }}
                            renderContent={(getFlags) => (
                                <PageButtonContent getFlags={getFlags}>Highlight Me</PageButtonContent>
                            )}
                        />
                    </div>
                )}
            </For>

            <ElementHighlight
                getElementRef={() => containerRefs[getActiveIndex()]}
                getPadding={() => 20}
                visibilitySignal={highlightVisibility}
                renderHighlight={(getVisibilityTarget) => (
                    <Corners getColor={() => (getVisibilityTarget() === 1 ? "yellow" : "transparent")} />
                )}
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
