import type { Accessor, JSX } from "solid-js";

import type { AnchorPlacement } from "../../../../Lib/Abstracts/Anchor/Anchor.types";
import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { MenuItem, MenuItemFlags } from "../../../../Lib/Fundamentals/Menu/Menu.types";
import { PageMenuItemContent } from "../../StyledComponents/MenuItemContent/MenuItemContent";
import { PagePopoverSurface } from "../../StyledComponents/PopoverSurface/PopoverSurface";
import { PageTooltipContent } from "../../StyledComponents/TooltipContent/TooltipContent";
import type { Action } from "./MenuPage.types";

const LAYER_COUNT = 20;

export const NOTHING_RUN = "nothing run yet";

export const ACTIONS: MenuItem<Action>[] = [
    { value: { name: "Cut", shortcut: "Ctrl+X" } },
    { value: { name: "Copy", shortcut: "Ctrl+C" } },
    { value: { name: "Paste", shortcut: "Ctrl+V" } },
    { value: { name: "Duplicate" } },
    { value: { name: "Delete", shortcut: "Del" } },
];

export const ACTIONS_WITH_DISABLED: MenuItem<Action>[] = [
    { value: { name: "Cut", shortcut: "Ctrl+X" } },
    { value: { name: "Copy", shortcut: "Ctrl+C" } },
    { value: { name: "Paste", shortcut: "Ctrl+V" }, isDisabled: true },
    { value: { name: "Duplicate" }, isDisabled: true },
    { value: { name: "Delete", shortcut: "Del" } },
];

export const ACTIONS_WITH_REACHABLE: MenuItem<Action>[] = [
    { value: { name: "Cut", shortcut: "Ctrl+X" } },
    { value: { name: "Copy", shortcut: "Ctrl+C" } },
    {
        value: { name: "Paste", shortcut: "Ctrl+V" },
        isDisabled: true,
        isReachableWhenDisabled: true,
        tooltipDefs: {
            placement: () => ({ x: "right-out", y: "center" }),
            offset: () => ({ x: 10, y: 0 }),
            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                <PageTooltipContent
                    visibilityTarget={getVisibilityTarget}
                    transitionDurationMs={getTransitionDurationMs}
                >
                    The clipboard is empty.
                </PageTooltipContent>
            ),
        },
    },
    { value: { name: "Duplicate" } },
    { value: { name: "Delete", shortcut: "Del" } },
];

export const LAYERS: MenuItem<Action>[] = Array.from({ length: LAYER_COUNT }, (_unused, index) => ({
    value: { name: `Layer ${index + 1}` },
}));

export const NESTED_ACTIONS: MenuItem<Action>[] = [
    {
        value: { name: "New" },
        items: [
            { value: { name: "Project" } },
            {
                value: { name: "From template" },
                items: [{ value: { name: "Blank" } }, { value: { name: "Dashboard" } }, { value: { name: "Report" } }],
            },
            { value: { name: "Import" } },
        ],
    },
    { value: { name: "Open", shortcut: "Ctrl+O" } },
    {
        value: { name: "Share" },
        items: [
            { value: { name: "Copy link", shortcut: "Ctrl+L" } },
            { value: { name: "Email" }, isDisabled: true },
            {
                value: { name: "Export" },
                items: [{ value: { name: "PDF" } }, { value: { name: "PNG" } }],
            },
        ],
    },
    { value: { name: "Delete", shortcut: "Del" } },
];

export const renderMenuPopup = (
    renderItems: () => JSX.Element,
    getVisibilityTarget: () => 0 | 1,
    getTransitionDurationMs: () => number,
    getPlacement: () => AnchorPlacement,
) => (
    <PagePopoverSurface
        visibilityTarget={getVisibilityTarget}
        transitionDurationMs={getTransitionDurationMs}
        placement={getPlacement}
    >
        {renderItems()}
    </PagePopoverSurface>
);

export const renderMenuItem = (
    getItem: Accessor<MenuItem<Action>>,
    getFlags: () => InteractionFlags<MenuItemFlags>,
) => (
    <PageMenuItemContent flags={getFlags} shortcut={() => getItem().value.shortcut ?? ""}>
        {getItem().value.name}
    </PageMenuItemContent>
);
