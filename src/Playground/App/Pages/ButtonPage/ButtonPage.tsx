import { createSignal } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Corners } from "../../../../Lib/Fundamentals/Corners/Corners";

import * as pageStyles from "../Pages.css";
import * as styles from "./ButtonPage.css";

export const ButtonPage = () => {
    const [getToggleOn, setToggleOn] = createSignal(false);

    return (
        <div class={styles.root}>
            <Button
                getIsSelected={getToggleOn}
                renderHighlight={() => <Corners getColor={() => (getToggleOn() ? "yellow" : "transparent")} />}
                getTooltipDefs={() => ({
                    getPlacement: () => ({ x: "center", y: "top-out" }),
                    getOffset: () => ({ x: 0, y: 5 }),
                    renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                        <div
                            class={pageStyles.tooltipContent}
                            classList={{ [pageStyles.isVisible]: getVisibilityTarget() === 1 }}
                            style={{ transition: `opacity ${getTransitionDurationMs()}ms` }}
                        >
                            Click me to toggle me.
                        </div>
                    ),
                })}
                onClick={async () => {
                    setToggleOn((prev) => !prev);
                }}
            >
                <div class={pageStyles.buttonContent}>Toggle Me</div>
            </Button>
        </div>
    );
};
