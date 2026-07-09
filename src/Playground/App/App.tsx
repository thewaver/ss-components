import type { JSX } from "solid-js";
import { createEffect, createMemo, createSignal } from "solid-js";

import { Route, type RouteSectionProps, Router } from "@solidjs/router";
import { StringUtils } from "@thewaver/ss-utils";

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
                    getIsDisabled={(getIndex) => !isComponentConfig(getTabConfig()[getIndex()])}
                    onSelectionChange={setTabIndex}
                    hrefs={getHrefs()}
                    renderFloater={() => <div class={styles.tabFloater} />}
                    renderTab={(getIndex) => (
                        <div
                            class={isComponentConfig(getTabConfig()[getIndex()]) ? styles.tabItem : styles.tabCategory}
                            classList={{ [styles.isSelected]: getIndex() === getTabIndex() }}
                        >
                            {getTabConfig()[getIndex()].name}
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

export function App() {
    return (
        <div id="app">
            <Router>
                <Route
                    path="/"
                    component={(props) => (
                        <Viewport getSize={() => ({ width: 1920, height: 1080 })}>
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
