import type { JSX } from "solid-js";
import { createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";

import { Route, type RouteSectionProps, Router } from "@solidjs/router";
import { FunctionUtils, Size2d, StringUtils } from "@thewaver/ss-utils";

import { Tabs } from "../../Lib/Fundamentals/Tabs/Tabs";
import { Viewport } from "../../Lib/Fundamentals/Viewport/Viewport";
import { ButtonPage } from "./Pages/ButtonPage/ButtonPage";
import { ElementHighlightPage } from "./Pages/ElementHighlightPage/ElementHighlightPage";
import { ModalPage } from "./Pages/ModalPage/ModalPage";
import { ScanlineAnimationPage } from "./Pages/ScanLineAnimationPage/ScanLineAnimationPage";
import { ScreenWiperPage } from "./Pages/ScreenWiperPage/ScreenWiperPage";
import { ShapePage } from "./Pages/ShapePage/ShapePage";
import { SurfacePage } from "./Pages/SurfacePage/SurfacePage";
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
        name: "Button",
        component: () => <ButtonPage />,
    },
    {
        name: "ElementHighlight",
        component: () => <ElementHighlightPage />,
    },
    /*
    {
        name: "ImageSwitcher",
        component: () => null,
    },
    */
    {
        name: "Modal",
        component: () => <ModalPage />,
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
        name: "Composites",
    },
    {
        name: "Surface",
        component: () => <SurfacePage />,
    },
];

const TAB_CONFIG_INDEXES = Object.fromEntries(TAB_CONFIGS.map((c, idx) => [componentToRouteName(c.name), idx]));

export function AppContent(props: RouteSectionProps) {
    const [getTabIndex, setTabIndex] = createSignal<number>();
    const [getSearchTerm, setSearchTerm] = createSignal("");

    const getTabConfig = createMemo(() => {
        const tabIndex = getTabIndex();
        const searchTerm = getSearchTerm();

        if (!getSearchTerm()) return TAB_CONFIGS;
        return TAB_CONFIGS.filter(
            (item, idx) =>
                !isComponentConfig(item) || idx === tabIndex || item.name.toLocaleLowerCase().includes(searchTerm),
        );
    });

    const getHrefs = createMemo(() => {
        const tabConfig = getTabConfig();

        return tabConfig.map((c) => (isComponentConfig(c) ? componentToRouteName(c.name) : ""));
    });

    createEffect(() => {
        const pathName = props.location.pathname;
        const index = TAB_CONFIG_INDEXES[pathName];

        setTabIndex(index);
    });

    return (
        <div class={styles.appContent}>
            <div class={styles.leftMenu}>
                <div class={styles.searchContainer}>
                    <input
                        type="text"
                        class={styles.searchInput}
                        placeholder="Search"
                        onInput={(e) => setSearchTerm(e.target.value.toLocaleLowerCase())}
                    />
                </div>

                <Tabs
                    getDir={() => "column"}
                    getSelectedIndex={getTabIndex}
                    getTabCount={() => getTabConfig().length}
                    computeIsDisabled={(index) => !isComponentConfig(getTabConfig()[index])}
                    onSelectionChange={setTabIndex}
                    getHrefs={getHrefs}
                    renderFloater={() => <div class={styles.tabFloater} />}
                    renderTab={(index) => (
                        <div
                            class={isComponentConfig(getTabConfig()[index]) ? styles.tabItem : styles.tabCategory}
                            classList={{ [styles.isSelected]: index === getTabIndex() }}
                        >
                            {getTabConfig()[index].name}
                        </div>
                    )}
                />
            </div>

            <div class={styles.tabPage}>
                {getTabIndex() && <div class={styles.tabPageTitle}>{getTabConfig()[getTabIndex()!].name}</div>}
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
