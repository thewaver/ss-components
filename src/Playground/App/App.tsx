import type { JSX } from "solid-js";
import { createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";

import { A, Route, type RouteSectionProps, Router } from "@solidjs/router";
import { FunctionUtils, Size2d, StringUtils } from "@thewaver/ss-utils";

import { Tabs } from "../../Lib/Fundamentals/Tabs/Tabs";
import type { Tab } from "../../Lib/Fundamentals/Tabs/Tabs.types";
import { Viewport } from "../../Lib/Fundamentals/Viewport/Viewport";
import { PageTextField } from "./PageComponents/Field/Field";
import { AlertDialogPage } from "./Pages/AlertDialogPage/AlertDialogPage";
import { ButtonPage } from "./Pages/ButtonPage/ButtonPage";
import { CellAnimationPage } from "./Pages/CellAnimationPage/CellAnimationPage";
import { CheckboxPage } from "./Pages/CheckboxPage/CheckboxPage";
import { ColorInputPage } from "./Pages/ColorInputPage/ColorInputPage";
import { DrawerPage } from "./Pages/DrawerPage/DrawerPage";
import { ElementHighlightPage } from "./Pages/ElementHighlightPage/ElementHighlightPage";
import { FileInputPage } from "./Pages/FileInputPage/FileInputPage";
import { LabelPage } from "./Pages/LabelPage/LabelPage";
import { MenuPage } from "./Pages/MenuPage/MenuPage";
import { ModalPage } from "./Pages/ModalPage/ModalPage";
import { ProgressPage } from "./Pages/ProgressPage/ProgressPage";
import { RadioPage } from "./Pages/RadioPage/RadioPage";
import { ScanlineAnimationPage } from "./Pages/ScanLineAnimationPage/ScanLineAnimationPage";
import { ScreenWiperPage } from "./Pages/ScreenWiperPage/ScreenWiperPage";
import { SelectPage } from "./Pages/SelectPage/SelectPage";
import { ShapePage } from "./Pages/ShapePage/ShapePage";
import { SurfacePage } from "./Pages/SurfacePage/SurfacePage";
import { TextInputPage } from "./Pages/TextInputPage/TextInputPage";
import { TogglePage } from "./Pages/TogglePage/TogglePage";
import { TypewriterPage } from "./Pages/TypewriterPage/TypewriterPage";

import * as styles from "./App.css";

type CategoryTabConfig = {
    name: string;
};

type ComponentTabConfig = {
    name: string;
    component: () => JSX.Element;
};

type TabConfig = CategoryTabConfig | ComponentTabConfig;

const isComponentConfig = (config: TabConfig): config is ComponentTabConfig => "component" in config;

const componentToRouteName = (name: string) => `/${StringUtils.camelToKebabCase(name)}`;

const SEARCH_FIELD_WIDTH = 200;

const TAB_CONFIGS: TabConfig[] = [
    {
        name: "Fundamentals",
    },
    /*
    {
        name: "AudioSwitcher",
        component: () => null,
    },
    */
    {
        name: "AlertDialog",
        component: () => <AlertDialogPage />,
    },
    {
        name: "Button",
        component: () => <ButtonPage />,
    },
    {
        name: "CellAnimation",
        component: () => <CellAnimationPage />,
    },
    {
        name: "Checkbox",
        component: () => <CheckboxPage />,
    },
    {
        name: "ColorInput",
        component: () => <ColorInputPage />,
    },
    {
        name: "Drawer",
        component: () => <DrawerPage />,
    },
    {
        name: "ElementHighlight",
        component: () => <ElementHighlightPage />,
    },
    {
        name: "FileInput",
        component: () => <FileInputPage />,
    },
    /*
    {
        name: "ImageSwitcher",
        component: () => null,
    },
    */
    {
        name: "Label",
        component: () => <LabelPage />,
    },
    {
        name: "Menu",
        component: () => <MenuPage />,
    },
    {
        name: "Modal",
        component: () => <ModalPage />,
    },
    {
        name: "Progress",
        component: () => <ProgressPage />,
    },
    {
        name: "Radio",
        component: () => <RadioPage />,
    },
    /*
    {
        name: "RichText",
        component: () => null,
    },
    */
    {
        name: "ScanlineAnimation",
        component: () => <ScanlineAnimationPage />,
    },
    {
        name: "ScreenWiper",
        component: () => <ScreenWiperPage />,
    },
    {
        name: "Select",
        component: () => <SelectPage />,
    },
    {
        name: "Shape",
        component: () => <ShapePage />,
    },
    {
        name: "TextInput",
        component: () => <TextInputPage />,
    },
    {
        name: "Toggle",
        component: () => <TogglePage />,
    },
    {
        name: "TypeWriter",
        component: () => <TypewriterPage />,
    },
    {
        name: "Composites",
    },
    {
        name: "Surface",
        component: () => <SurfacePage />,
    },
];

const TAB_CONFIGS_BY_ROUTE = Object.fromEntries(
    TAB_CONFIGS.filter(isComponentConfig).map((c) => [componentToRouteName(c.name), c as TabConfig]),
);

export function AppContent(props: RouteSectionProps) {
    const [getSelectedConfig, setSelectedConfig] = createSignal<TabConfig>();
    const [getSearchTerm, setSearchTerm] = createSignal("");

    const getVisibleConfigs = createMemo(() => {
        const selectedConfig = getSelectedConfig();
        const searchTerm = getSearchTerm();

        if (!searchTerm) return TAB_CONFIGS;
        return TAB_CONFIGS.filter(
            (item) =>
                !isComponentConfig(item) ||
                item === selectedConfig ||
                item.name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()),
        );
    });

    const getTabs = createMemo((): Tab<TabConfig>[] =>
        getVisibleConfigs().map((config) => ({
            value: config,
            href: isComponentConfig(config) ? componentToRouteName(config.name) : undefined,
            isDisabled: !isComponentConfig(config),
        })),
    );

    createEffect(() => {
        const pathName = props.location.pathname;

        setSelectedConfig(() => TAB_CONFIGS_BY_ROUTE[pathName]);
    });

    return (
        <div class={styles.appContent}>
            <div class={styles.leftMenu}>
                <div class={styles.searchContainer}>
                    <PageTextField
                        getValue={getSearchTerm}
                        getWidth={() => SEARCH_FIELD_WIDTH}
                        getPlaceholder={() => "Search"}
                        getAriaLabel={() => "Search components"}
                        onInput={setSearchTerm}
                    />
                </div>

                <Tabs
                    getDir={() => "column"}
                    getTabs={getTabs}
                    getSelectedValue={getSelectedConfig}
                    onSelectionChange={(config) => setSelectedConfig(() => config)}
                    linkComponent={A}
                    renderFloater={() => <div class={styles.tabFloater} />}
                    renderTab={(getTab) => (
                        <div
                            class={isComponentConfig(getTab().value) ? styles.tabItem : styles.tabCategory}
                            classList={{ [styles.isSelected]: getTab().value === getSelectedConfig() }}
                        >
                            {getTab().value.name}
                        </div>
                    )}
                />
            </div>

            <div class={styles.tabPage}>
                {getSelectedConfig() && <div class={styles.tabPageTitle}>{getSelectedConfig()!.name}</div>}
                {props.children}
            </div>
        </div>
    );
}

const SIZE_ANCHOR = 1200;

const getWindowInnerSize = () => ({ width: window.innerWidth, height: window.innerHeight });

export function App() {
    const [getWindowSize, setWindowSize] = createSignal<Size2d>(getWindowInnerSize());

    const getViewportSize = createMemo(() => {
        const windowSize = getWindowSize();
        const ratio = windowSize.width / windowSize.height;
        const next =
            ratio >= 1
                ? { width: Math.round(SIZE_ANCHOR * ratio), height: SIZE_ANCHOR }
                : { width: SIZE_ANCHOR, height: Math.round(SIZE_ANCHOR / ratio) };

        return next;
    });

    const throttleResize = FunctionUtils.trailingThrottle(() => setWindowSize(getWindowInnerSize()), 10);

    onMount(() => {
        onCleanup(() => {
            window.removeEventListener("resize", throttleResize);
        });

        window.addEventListener("resize", throttleResize);
    });

    return (
        <div id="app">
            <Router>
                <Route
                    path="/"
                    component={(props: RouteSectionProps) => (
                        <Viewport getSize={getViewportSize}>
                            <AppContent {...props} />
                        </Viewport>
                    )}
                >
                    <Route path="/" component={() => <>{null}</>} />
                    {TAB_CONFIGS.filter((c) => isComponentConfig(c)).map((c) => (
                        <Route path={componentToRouteName(c.name)} component={c.component} />
                    ))}
                </Route>
            </Router>
        </div>
    );
}
