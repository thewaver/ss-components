import { createMemo, createSignal } from "solid-js";

import { PageExamples } from "../../PageComponents/Examples/Examples";
import { DefaultExample } from "./Examples/Default";
import { DisabledExample } from "./Examples/Disabled";
import { DrivenExample } from "./Examples/Driven";
import { PlacedAboveExample } from "./Examples/PlacedAbove";
import { ReachableExample } from "./Examples/Reachable";
import { SubmenusExample } from "./Examples/Submenus";
import { ACTIONS_WITH_DISABLED, ACTIONS_WITH_REACHABLE, LAYERS, NOTHING_RUN } from "./MenuPage.const";

const EXAMPLES_ROOT = "/src/Playground/App/Pages/MenuPage/Examples";

export const MenuPage = () => {
    const [getLastAction, setLastAction] = createSignal(NOTHING_RUN);
    const [getLastDisabledAction, setLastDisabledAction] = createSignal(NOTHING_RUN);
    const [getLastReachableAction, setLastReachableAction] = createSignal(NOTHING_RUN);
    const [getLastNestedAction, setLastNestedAction] = createSignal(NOTHING_RUN);
    const [getLastFlippedAction, setLastFlippedAction] = createSignal(NOTHING_RUN);
    const [getLastLayerAction, setLastLayerAction] = createSignal(NOTHING_RUN);
    const [getLastDrivenAction, setLastDrivenAction] = createSignal(NOTHING_RUN);

    const drivenVisibility = createSignal(false);

    const getExamples = createMemo(() => [
        {
            key: "driven",
            name: "Driven from outside",
            readout: () =>
                `${getLastDrivenAction()} — the menu is ${drivenVisibility[0]() ? "open" : "closed"}, and it is anchored to the toggle rather than to its own trigger`,
            component: () => (
                <DrivenExample
                    visibilitySignal={drivenVisibility}
                    onActivate={(action) => setLastDrivenAction(action.name)}
                />
            ),
            path: `${EXAMPLES_ROOT}/Driven.tsx`,
        },
        {
            key: "default",
            name: "Default",
            readout: () => `${getLastAction()} — activating an item closes the menu`,
            component: () => <DefaultExample onActivate={(action) => setLastAction(action.name)} />,
            path: `${EXAMPLES_ROOT}/Default.tsx`,
        },
        {
            key: "disabledItems",
            name: "Disabled items",
            readout: () => `${getLastDisabledAction()} — arrows skip Paste and Duplicate`,
            component: () => (
                <DefaultExample
                    getItems={() => ACTIONS_WITH_DISABLED}
                    onActivate={(action) => setLastDisabledAction(action.name)}
                />
            ),
            path: `${EXAMPLES_ROOT}/Default.tsx`,
        },
        {
            key: "disabledItemsReachable",
            name: "Disabled items + reachable",
            readout: () => `${getLastReachableAction()} — arrows stop on Paste, hover explains why`,
            component: () => (
                <DefaultExample
                    getItems={() => ACTIONS_WITH_REACHABLE}
                    onActivate={(action) => setLastReachableAction(action.name)}
                />
            ),
            path: `${EXAMPLES_ROOT}/Default.tsx`,
        },
        {
            key: "submenus",
            name: "Submenus",
            readout: () => `${getLastNestedAction()} — ArrowRight steps in, ArrowLeft steps back out`,
            component: () => <SubmenusExample onActivate={(action) => setLastNestedAction(action.name)} />,
            path: `${EXAMPLES_ROOT}/Submenus.tsx`,
        },
        {
            key: "placedAbove",
            name: "Placed above",
            readout: () => `${getLastFlippedAction()} — the surface flips its own transform`,
            component: () => <PlacedAboveExample onActivate={(action) => setLastFlippedAction(action.name)} />,
            path: `${EXAMPLES_ROOT}/PlacedAbove.tsx`,
        },
        {
            key: "scrollingList",
            name: "Scrolling list",
            readout: () => `${getLastLayerAction()} — Home and End reach both ends`,
            component: () => (
                <DefaultExample
                    getItems={() => LAYERS}
                    getCaption={() => "Layers"}
                    onActivate={(action) => setLastLayerAction(action.name)}
                />
            ),
            path: `${EXAMPLES_ROOT}/Default.tsx`,
        },
        {
            key: "disabled",
            name: "Disabled",
            readout: () => "the trigger neither opens nor takes focus",
            component: () => <DisabledExample />,
            path: `${EXAMPLES_ROOT}/Disabled.tsx`,
        },
        {
            key: "reachable",
            name: "Disabled + reachable",
            readout: () => "focusable so the tooltip can be read, but the menu must not open",
            component: () => <ReachableExample />,
            path: `${EXAMPLES_ROOT}/Reachable.tsx`,
        },
    ]);

    return <PageExamples getItems={getExamples} />;
};
