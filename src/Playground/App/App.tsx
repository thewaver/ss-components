import type { JSX } from "solid-js";
import { createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";

import { A, Route, type RouteSectionProps, Router } from "@solidjs/router";
import { FunctionUtils, Size2d, StringUtils } from "@thewaver/ss-utils";

import { Viewport } from "../../Lib/Exotics/Viewport/Viewport";
import { Tabs } from "../../Lib/Fundamentals/Tabs/Tabs";
import type { Tab } from "../../Lib/Fundamentals/Tabs/Tabs.types";
import { AccordionPage } from "./Pages/AccordionPage/AccordionPage";
import { AmountInputPage } from "./Pages/AmountInputPage/AmountInputPage";
import { ButtonPage } from "./Pages/ButtonPage/ButtonPage";
import { CalendarPage } from "./Pages/CalendarPage/CalendarPage";
import { CellAnimationPage } from "./Pages/CellAnimationPage/CellAnimationPage";
import { CheckboxPage } from "./Pages/CheckboxPage/CheckboxPage";
import { ColorAreaPage } from "./Pages/ColorAreaPage/ColorAreaPage";
import { ColorInputPage } from "./Pages/ColorInputPage/ColorInputPage";
import { DatePickerPage } from "./Pages/DatePickerPage/DatePickerPage";
import { DrawerPage } from "./Pages/DrawerPage/DrawerPage";
import { ElementHighlightPage } from "./Pages/ElementHighlightPage/ElementHighlightPage";
import { FileInputPage } from "./Pages/FileInputPage/FileInputPage";
import { FormPage } from "./Pages/FormPage/FormPage";
import { ImageSwitcherPage } from "./Pages/ImageSwitcherPage/ImageSwitcherPage";
import { LabelPage } from "./Pages/LabelPage/LabelPage";
import { MenuPage } from "./Pages/MenuPage/MenuPage";
import { ModalPage } from "./Pages/ModalPage/ModalPage";
import { NumberInputPage } from "./Pages/NumberInputPage/NumberInputPage";
import { ProgressPage } from "./Pages/ProgressPage/ProgressPage";
import { RadioPage } from "./Pages/RadioPage/RadioPage";
import { RangePage } from "./Pages/RangePage/RangePage";
import { ScanlineAnimationPage } from "./Pages/ScanLineAnimationPage/ScanLineAnimationPage";
import { ScreenWiperPage } from "./Pages/ScreenWiperPage/ScreenWiperPage";
import { SelectPage } from "./Pages/SelectPage/SelectPage";
import { ShapePage } from "./Pages/ShapePage/ShapePage";
import { SurfacePage } from "./Pages/SurfacePage/SurfacePage";
import { TabsPage } from "./Pages/TabsPage/TabsPage";
import { TextAreaPage } from "./Pages/TextAreaPage/TextAreaPage";
import { TextInputPage } from "./Pages/TextInputPage/TextInputPage";
import { ToastsPage } from "./Pages/ToastsPage/ToastsPage";
import { TogglePage } from "./Pages/TogglePage/TogglePage";
import { TypewriterPage } from "./Pages/TypewriterPage/TypewriterPage";
import { ViewportPage } from "./Pages/ViewportPage/ViewportPage";
import { PageTextField } from "./StyledComponents/Field/Field";

import * as styles from "./App.css";

type CategoryTabConfig = {
    name: string;
    hidden?: boolean;
};

type ComponentTabConfig = {
    name: string;
    component: () => JSX.Element;
    hidden?: boolean;
};

type TabConfig = CategoryTabConfig | ComponentTabConfig;

const isComponentConfig = (config: TabConfig): config is ComponentTabConfig => "component" in config;

const componentToRouteName = (name: string) => `/${StringUtils.camelToKebabCase(name)}`;

const SHOW_COMPOSITES = false;
const SEARCH_FIELD_WIDTH = 200;

const TAB_CONFIGS: TabConfig[] = [
    {
        name: "Exotics",
    },
    {
        name: "CellAnimation",
        component: () => <CellAnimationPage />,
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
        name: "Shape",
        component: () => <ShapePage />,
    },
    {
        name: "TypeWriter",
        component: () => <TypewriterPage />,
    },
    {
        name: "Viewport",
        component: () => <ViewportPage />,
    },
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
        name: "Accordion",
        component: () => <AccordionPage />,
    },
    {
        name: "Button",
        component: () => <ButtonPage />,
    },
    {
        name: "Calendar",
        component: () => <CalendarPage />,
    },
    {
        name: "Checkbox",
        component: () => <CheckboxPage />,
    },
    {
        name: "ColorArea",
        component: () => <ColorAreaPage />,
    },
    {
        name: "ColorInput",
        component: () => <ColorInputPage />,
    },
    {
        name: "DatePicker",
        component: () => <DatePickerPage />,
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
    {
        name: "Form",
        component: () => <FormPage />,
    },
    {
        name: "ImageSwitcher",
        component: () => <ImageSwitcherPage />,
    },
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
        name: "AmountInput",
        component: () => <AmountInputPage />,
    },
    {
        name: "NumberInput",
        component: () => <NumberInputPage />,
    },
    {
        name: "Progress",
        component: () => <ProgressPage />,
    },
    {
        name: "Radio",
        component: () => <RadioPage />,
    },
    {
        name: "Range",
        component: () => <RangePage />,
    },
    {
        name: "Select",
        component: () => <SelectPage />,
    },
    {
        name: "Tabs",
        component: () => <TabsPage />,
    },
    {
        name: "TextArea",
        component: () => <TextAreaPage />,
    },
    {
        name: "TextInput",
        component: () => <TextInputPage />,
    },
    {
        name: "Toasts",
        component: () => <ToastsPage />,
    },
    {
        name: "Toggle",
        component: () => <TogglePage />,
    },
    {
        name: "Composites",
        hidden: !SHOW_COMPOSITES,
    },
    {
        name: "Surface",
        component: () => <SurfacePage />,
        hidden: !SHOW_COMPOSITES,
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

        if (!searchTerm) return TAB_CONFIGS.filter((item) => !item.hidden);
        return TAB_CONFIGS.filter(
            (item) =>
                !item.hidden &&
                (!isComponentConfig(item) ||
                    item === selectedConfig ||
                    item.name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())),
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

const SIZE_ANCHOR = window.screen.height;

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
        <div id="app" class={styles.appRoot}>
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
