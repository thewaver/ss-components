import type { Accessor, JSX } from "solid-js";
import { createMemo, createSignal } from "solid-js";

import type { AnchorPlacement } from "../../../../Lib/Abstracts/Anchor/Anchor.types";
import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Menu } from "../../../../Lib/Fundamentals/Menu/Menu";
import type { MenuItem, MenuItemFlags } from "../../../../Lib/Fundamentals/Menu/Menu.types";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import { PageMenuItemContent } from "../../StyledComponents/MenuItemContent/MenuItemContent";
import { PageMenuTriggerContent } from "../../StyledComponents/MenuTriggerContent/MenuTriggerContent";
import { PagePopoverSurface } from "../../StyledComponents/PopoverSurface/PopoverSurface";
import { PageTooltipContent } from "../../StyledComponents/TooltipContent/TooltipContent";

import { POPOVER_SURFACE_INSET } from "../../StyledComponents/PopoverSurface/PopoverSurface.css";

type Action = {
    name: string;
    shortcut?: string;
};

const NOTHING_RUN = "nothing run yet";

const ACTIONS: MenuItem<Action>[] = [
    { value: { name: "Cut", shortcut: "Ctrl+X" } },
    { value: { name: "Copy", shortcut: "Ctrl+C" } },
    { value: { name: "Paste", shortcut: "Ctrl+V" } },
    { value: { name: "Duplicate" } },
    { value: { name: "Delete", shortcut: "Del" } },
];

const ACTIONS_WITH_DISABLED: MenuItem<Action>[] = [
    { value: { name: "Cut", shortcut: "Ctrl+X" } },
    { value: { name: "Copy", shortcut: "Ctrl+C" } },
    { value: { name: "Paste", shortcut: "Ctrl+V" }, isDisabled: true },
    { value: { name: "Duplicate" }, isDisabled: true },
    { value: { name: "Delete", shortcut: "Del" } },
];

const ACTIONS_WITH_REACHABLE: MenuItem<Action>[] = [
    { value: { name: "Cut", shortcut: "Ctrl+X" } },
    { value: { name: "Copy", shortcut: "Ctrl+C" } },
    {
        value: { name: "Paste", shortcut: "Ctrl+V" },
        isDisabled: true,
        isReachableWhenDisabled: true,
        tooltipDefs: {
            getPlacement: () => ({ x: "right-out", y: "center" }),
            getOffset: () => ({ x: 10, y: 0 }),
            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                <PageTooltipContent
                    getVisibilityTarget={getVisibilityTarget}
                    getTransitionDurationMs={getTransitionDurationMs}
                >
                    The clipboard is empty.
                </PageTooltipContent>
            ),
        },
    },
    { value: { name: "Duplicate" } },
    { value: { name: "Delete", shortcut: "Del" } },
];

const LAYERS: MenuItem<Action>[] = Array.from({ length: 20 }, (_, index) => ({
    value: { name: `Layer ${index + 1}` },
}));

const NESTED_ACTIONS: MenuItem<Action>[] = [
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

const renderMenuPopup = (
    renderItems: () => JSX.Element,
    getVisibilityTarget: () => 0 | 1,
    getTransitionDurationMs: () => number,
    getPlacement: () => AnchorPlacement,
) => (
    <PagePopoverSurface
        getVisibilityTarget={getVisibilityTarget}
        getTransitionDurationMs={getTransitionDurationMs}
        getPlacement={getPlacement}
    >
        {renderItems()}
    </PagePopoverSurface>
);

const renderMenuItem = (getItem: Accessor<MenuItem<Action>>, getFlags: () => InteractionFlags<MenuItemFlags>) => (
    <PageMenuItemContent getFlags={getFlags} getShortcut={() => getItem().value.shortcut ?? ""}>
        {getItem().value.name}
    </PageMenuItemContent>
);

export const MenuPage = () => {
    const [getLastAction, setLastAction] = createSignal(NOTHING_RUN);
    const [getLastDisabledAction, setLastDisabledAction] = createSignal(NOTHING_RUN);
    const [getLastReachableAction, setLastReachableAction] = createSignal(NOTHING_RUN);
    const [getLastNestedAction, setLastNestedAction] = createSignal(NOTHING_RUN);
    const [getLastFlippedAction, setLastFlippedAction] = createSignal(NOTHING_RUN);
    const [getLastLayerAction, setLastLayerAction] = createSignal(NOTHING_RUN);
    const [getLastDrivenAction, setLastDrivenAction] = createSignal(NOTHING_RUN);

    const drivenVisibility = createSignal(false);

    const [getDrivenAnchor, setDrivenAnchor] = createSignal<HTMLElement>();

    const getVariants = createMemo(() => {
        return [
            {
                name: "Driven from outside",
                readout: () =>
                    `${getLastDrivenAction()} — the menu is ${drivenVisibility[0]() ? "open" : "closed"}, and it is anchored to the toggle rather than to its own trigger`,
                component: () => (
                    <>
                        <Menu
                            visibilitySignal={drivenVisibility}
                            getAnchorRef={getDrivenAnchor}
                            getItems={() => ACTIONS}
                            getAriaLabel={() => "Edit actions"}
                            renderContent={(getFlags) => (
                                <PageMenuTriggerContent getFlags={getFlags}>Edit</PageMenuTriggerContent>
                            )}
                            renderItem={renderMenuItem}
                            renderPopup={renderMenuPopup}
                            onActivate={(action) => setLastDrivenAction(action.name)}
                        />

                        <Button
                            ref={setDrivenAnchor}
                            getAriaLabel={() => "Toggle the menu from outside"}
                            renderContent={(getFlags) => (
                                <PageButtonContent getFlags={getFlags}>
                                    {drivenVisibility[0]() ? "Close it" : "Open it"}
                                </PageButtonContent>
                            )}
                            onClick={() => {
                                drivenVisibility[1]((prev) => !prev);
                            }}
                        />
                    </>
                ),
            },
            {
                name: "Default",
                readout: () => `${getLastAction()} — activating an item closes the menu`,
                component: () => (
                    <Menu
                        getItems={() => ACTIONS}
                        getAriaLabel={() => "Edit actions"}
                        renderContent={(getFlags) => (
                            <PageMenuTriggerContent getFlags={getFlags}>Edit</PageMenuTriggerContent>
                        )}
                        renderItem={renderMenuItem}
                        renderPopup={renderMenuPopup}
                        onActivate={(action) => setLastAction(action.name)}
                    />
                ),
            },
            {
                name: "Disabled items",
                readout: () => `${getLastDisabledAction()} — arrows skip Paste and Duplicate`,
                component: () => (
                    <Menu
                        getItems={() => ACTIONS_WITH_DISABLED}
                        getAriaLabel={() => "Edit actions"}
                        renderContent={(getFlags) => (
                            <PageMenuTriggerContent getFlags={getFlags}>Edit</PageMenuTriggerContent>
                        )}
                        renderItem={renderMenuItem}
                        renderPopup={renderMenuPopup}
                        onActivate={(action) => setLastDisabledAction(action.name)}
                    />
                ),
            },
            {
                name: "Disabled items + reachable",
                readout: () => `${getLastReachableAction()} — arrows stop on Paste, hover explains why`,
                component: () => (
                    <Menu
                        getItems={() => ACTIONS_WITH_REACHABLE}
                        getAriaLabel={() => "Edit actions"}
                        renderContent={(getFlags) => (
                            <PageMenuTriggerContent getFlags={getFlags}>Edit</PageMenuTriggerContent>
                        )}
                        renderItem={renderMenuItem}
                        renderPopup={renderMenuPopup}
                        onActivate={(action) => setLastReachableAction(action.name)}
                    />
                ),
            },
            {
                name: "Submenus",
                readout: () => `${getLastNestedAction()} — ArrowRight steps in, ArrowLeft steps back out`,
                component: () => (
                    <Menu
                        getItems={() => NESTED_ACTIONS}
                        getAriaLabel={() => "File actions"}
                        getSubmenuOffset={() => ({ x: POPOVER_SURFACE_INSET, y: -POPOVER_SURFACE_INSET })}
                        renderContent={(getFlags) => (
                            <PageMenuTriggerContent getFlags={getFlags}>File</PageMenuTriggerContent>
                        )}
                        renderItem={renderMenuItem}
                        renderPopup={renderMenuPopup}
                        onActivate={(action) => setLastNestedAction(action.name)}
                    />
                ),
            },
            {
                name: "Placed above",
                readout: () => `${getLastFlippedAction()} — the surface flips its own transform`,
                component: () => (
                    <Menu
                        getItems={() => ACTIONS}
                        getAriaLabel={() => "Edit actions"}
                        getPlacement={() => ({ x: "left-in", y: "top-out" })}
                        renderContent={(getFlags) => (
                            <PageMenuTriggerContent getFlags={getFlags}>Edit</PageMenuTriggerContent>
                        )}
                        renderItem={renderMenuItem}
                        renderPopup={renderMenuPopup}
                        onActivate={(action) => setLastFlippedAction(action.name)}
                    />
                ),
            },
            {
                name: "Scrolling list",
                readout: () => `${getLastLayerAction()} — Home and End reach both ends`,
                component: () => (
                    <Menu
                        getItems={() => LAYERS}
                        getAriaLabel={() => "Layers"}
                        renderContent={(getFlags) => (
                            <PageMenuTriggerContent getFlags={getFlags}>Layers</PageMenuTriggerContent>
                        )}
                        renderItem={renderMenuItem}
                        renderPopup={renderMenuPopup}
                        onActivate={(action) => setLastLayerAction(action.name)}
                    />
                ),
            },
            {
                name: "Disabled",
                readout: () => "the trigger neither opens nor takes focus",
                component: () => (
                    <Menu
                        getItems={() => ACTIONS}
                        getIsDisabled={() => true}
                        getAriaLabel={() => "Edit actions"}
                        renderContent={(getFlags) => (
                            <PageMenuTriggerContent getFlags={getFlags}>Edit</PageMenuTriggerContent>
                        )}
                        renderItem={renderMenuItem}
                        renderPopup={renderMenuPopup}
                        onActivate={() => undefined}
                    />
                ),
            },
            {
                name: "Disabled + reachable",
                readout: () => "focusable so the tooltip can be read, but the menu must not open",
                component: () => (
                    <Menu
                        getItems={() => ACTIONS}
                        getIsDisabled={() => true}
                        getIsReachableWhenDisabled={() => true}
                        getAriaLabel={() => "Edit actions"}
                        getTooltipDefs={() => ({
                            getPlacement: () => ({ x: "center", y: "top-out" }),
                            getOffset: () => ({ x: 0, y: 5 }),
                            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                                <PageTooltipContent
                                    getVisibilityTarget={getVisibilityTarget}
                                    getTransitionDurationMs={getTransitionDurationMs}
                                >
                                    Nothing is selected, so there is nothing to edit.
                                </PageTooltipContent>
                            ),
                        })}
                        renderContent={(getFlags) => (
                            <PageMenuTriggerContent getFlags={getFlags}>Edit</PageMenuTriggerContent>
                        )}
                        renderItem={renderMenuItem}
                        renderPopup={renderMenuPopup}
                        onActivate={() => undefined}
                    />
                ),
            },
        ];
    });

    return <PageVariants getItems={getVariants} />;
};
