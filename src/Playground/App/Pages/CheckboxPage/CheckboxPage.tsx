import { createSignal } from "solid-js";

import { Checkbox } from "../../../../Lib/Fundamentals/Checkbox/Checkbox";
import { Corners } from "../../../../Lib/Fundamentals/Corners/Corners";
import { PageDemo } from "../../PageComponents/Demo/Demo";
import { PageDemos } from "../../PageComponents/Demos/Demos";

import * as pageStyles from "../Pages.css";

export const CheckboxPage = () => {
    const defaultSignal = createSignal(false);
    const decoratedSignal = createSignal(true);
    const disabledSignal = createSignal(true);
    const reachableSignal = createSignal(true);
    const erroredSignal = createSignal(false);

    return (
        <PageDemos>
            <PageDemo getName={() => "Default"} getReadout={() => `checked: ${defaultSignal[0]()}`}>
                <Checkbox checkedSignal={defaultSignal} getAriaLabel={() => "Default checkbox"} />
            </PageDemo>

            <PageDemo getName={() => "Decorated"} getReadout={() => `checked: ${decoratedSignal[0]()}`}>
                <Checkbox
                    checkedSignal={decoratedSignal}
                    getAriaLabel={() => "Decorated checkbox"}
                    getIsPressed={decoratedSignal[0]}
                    renderDecoration={(getFlags) => (
                        <Corners getColor={() => (getFlags().isPressed ? "yellow" : "transparent")} />
                    )}
                />
            </PageDemo>

            <PageDemo getName={() => "Disabled"} getReadout={() => `checked: ${disabledSignal[0]()}`}>
                <Checkbox
                    checkedSignal={disabledSignal}
                    getAriaLabel={() => "Disabled checkbox"}
                    getIsDisabled={() => true}
                />
            </PageDemo>

            <PageDemo getName={() => "Disabled + reachable"} getReadout={() => `checked: ${reachableSignal[0]()}`}>
                <Checkbox
                    checkedSignal={reachableSignal}
                    getAriaLabel={() => "Disabled but reachable checkbox"}
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
                                Focusable so this tooltip can be read, but clicking and pressing Space must leave it
                                checked.
                            </div>
                        ),
                    })}
                />
            </PageDemo>

            <PageDemo getName={() => "Error"} getReadout={() => `checked: ${erroredSignal[0]()}`}>
                <Checkbox
                    checkedSignal={erroredSignal}
                    getAriaLabel={() => "Errored checkbox"}
                    getHasError={() => !erroredSignal[0]()}
                />
            </PageDemo>
        </PageDemos>
    );
};
