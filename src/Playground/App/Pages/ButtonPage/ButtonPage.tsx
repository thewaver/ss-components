import { createMemo, createSignal } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Corners } from "../../../../Lib/Fundamentals/Corners/Corners";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import { PageTooltipContent } from "../../StyledComponents/TooltipContent/TooltipContent";

export const ButtonPage = () => {
    const [getClicks, setClicks] = createSignal(0);
    const [getToggleOn, setToggleOn] = createSignal(false);
    const [getDisabledClicks, setDisabledClicks] = createSignal(0);
    const [getReachableClicks, setReachableClicks] = createSignal(0);
    const [getHasError, setHasError] = createSignal(true);

    const getVariants = createMemo(() => {
        return [
            {
                key: "default",
                name: "Default",
                readout: () => `clicks: ${getClicks()}`,
                component: () => (
                    <Button
                        renderContent={(getFlags) => (
                            <PageButtonContent getFlags={getFlags}>Click Me</PageButtonContent>
                        )}
                        onClick={async () => {
                            setClicks((prev) => prev + 1);
                        }}
                    />
                ),
            },
            {
                key: "decorated",
                name: "Decorated",
                readout: () => `pressed: ${getToggleOn()}`,
                component: () => (
                    <Button
                        getIsPressed={getToggleOn}
                        renderContent={(getFlags) => (
                            <PageButtonContent getFlags={getFlags}>Toggle Me</PageButtonContent>
                        )}
                        renderDecoration={(getFlags) => (
                            <Corners getColor={() => (getFlags().isPressed ? "yellow" : "transparent")} />
                        )}
                        getTooltipDefs={() => ({
                            getPlacement: () => ({ x: "center", y: "top-out" }),
                            getOffset: () => ({ x: 0, y: 5 }),
                            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                                <PageTooltipContent
                                    getVisibilityTarget={getVisibilityTarget}
                                    getTransitionDurationMs={getTransitionDurationMs}
                                >
                                    Click me to toggle me.
                                </PageTooltipContent>
                            ),
                        })}
                        onClick={async () => {
                            setToggleOn((prev) => !prev);
                        }}
                    />
                ),
            },
            {
                key: "disabled",
                name: "Disabled",
                readout: () => `clicks: ${getDisabledClicks()}`,
                component: () => (
                    <Button
                        getIsDisabled={() => true}
                        renderContent={(getFlags) => (
                            <PageButtonContent getFlags={getFlags}>Click Me</PageButtonContent>
                        )}
                        onClick={async () => {
                            setDisabledClicks((prev) => prev + 1);
                        }}
                    />
                ),
            },
            {
                key: "reachable",
                name: "Disabled + reachable",
                readout: () => `clicks: ${getReachableClicks()}`,
                component: () => (
                    <Button
                        getIsDisabled={() => true}
                        getIsReachableWhenDisabled={() => true}
                        renderContent={(getFlags) => (
                            <PageButtonContent getFlags={getFlags}>Click Me</PageButtonContent>
                        )}
                        getTooltipDefs={() => ({
                            getPlacement: () => ({ x: "center", y: "top-out" }),
                            getOffset: () => ({ x: 0, y: 5 }),
                            renderContent: (getVisibilityTarget, getTransitionDurationMs, _getPlacement, getFlags) => (
                                <PageTooltipContent
                                    getVisibilityTarget={getVisibilityTarget}
                                    getTransitionDurationMs={getTransitionDurationMs}
                                >
                                    {`Focusable so this tooltip can be read, but clicking and pressing Enter must leave the count at zero. The shell reports isDisabled: ${getFlags().isDisabled}.`}
                                </PageTooltipContent>
                            ),
                        })}
                        onClick={async () => {
                            setReachableClicks((prev) => prev + 1);
                        }}
                    />
                ),
            },
            {
                key: "errored",
                name: "Error",
                readout: () => `hasError: ${getHasError()}`,
                component: () => (
                    <Button
                        getHasError={getHasError}
                        renderContent={(getFlags) => (
                            <PageButtonContent getFlags={getFlags}>Toggle Error</PageButtonContent>
                        )}
                        onClick={async () => {
                            setHasError((prev) => !prev);
                        }}
                    />
                ),
            },
        ];
    });

    return <PageVariants getItems={getVariants} />;
};
