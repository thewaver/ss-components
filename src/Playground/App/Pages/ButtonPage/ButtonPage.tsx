import { createSignal } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Corners } from "../../../../Lib/Fundamentals/Corners/Corners";
import { PageDemo } from "../../PageComponents/Demo/Demo";
import { PageDemos } from "../../PageComponents/Demos/Demos";

import * as pageStyles from "../Pages.css";

export const ButtonPage = () => {
    const [getClicks, setClicks] = createSignal(0);
    const [getToggleOn, setToggleOn] = createSignal(false);
    const [getDisabledClicks, setDisabledClicks] = createSignal(0);
    const [getReachableClicks, setReachableClicks] = createSignal(0);
    const [getHasError, setHasError] = createSignal(true);

    return (
        <PageDemos>
            <PageDemo getName={() => "Default"} getReadout={() => `clicks: ${getClicks()}`}>
                <Button
                    onClick={async () => {
                        setClicks((prev) => prev + 1);
                    }}
                >
                    <div class={pageStyles.buttonContent}>Click Me</div>
                </Button>
            </PageDemo>

            <PageDemo getName={() => "Decorated"} getReadout={() => `pressed: ${getToggleOn()}`}>
                <Button
                    getIsPressed={getToggleOn}
                    renderDecoration={(getFlags) => (
                        <Corners getColor={() => (getFlags().isPressed ? "yellow" : "transparent")} />
                    )}
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
            </PageDemo>

            <PageDemo getName={() => "Disabled"} getReadout={() => `clicks: ${getDisabledClicks()}`}>
                <Button
                    getIsDisabled={() => true}
                    onClick={async () => {
                        setDisabledClicks((prev) => prev + 1);
                    }}
                >
                    <div class={pageStyles.buttonContent}>Click Me</div>
                </Button>
            </PageDemo>

            <PageDemo getName={() => "Disabled + reachable"} getReadout={() => `clicks: ${getReachableClicks()}`}>
                <Button
                    getIsDisabled={() => true}
                    getIsReachableWhenDisabled={() => true}
                    getTooltipDefs={() => ({
                        getPlacement: () => ({ x: "center", y: "top-out" }),
                        getOffset: () => ({ x: 0, y: 5 }),
                        renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                            <div
                                class={pageStyles.tooltipContent}
                                classList={{ [pageStyles.isVisible]: getVisibilityTarget() === 1 }}
                                style={{ transition: `opacity ${getTransitionDurationMs()}ms` }}
                            >
                                Focusable so this tooltip can be read, but clicking and pressing Enter must leave the
                                count at zero.
                            </div>
                        ),
                    })}
                    onClick={async () => {
                        setReachableClicks((prev) => prev + 1);
                    }}
                >
                    <div class={pageStyles.buttonContent}>Click Me</div>
                </Button>
            </PageDemo>

            <PageDemo getName={() => "Error"} getReadout={() => `hasError: ${getHasError()}`}>
                <Button
                    getHasError={getHasError}
                    onClick={async () => {
                        setHasError((prev) => !prev);
                    }}
                >
                    <div class={pageStyles.buttonContent}>Clear Error</div>
                </Button>
            </PageDemo>
        </PageDemos>
    );
};
