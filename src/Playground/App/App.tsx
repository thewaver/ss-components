import type { JSX } from "solid-js";
import { Show, createMemo, createSignal } from "solid-js";

import { Tabs } from "../../Lib/Fundamentals/Tabs/Tabs";
import { Viewport } from "../../Lib/Fundamentals/Viewport/Viewport";
import { BorderPage } from "./Pages/BorderPage/BorderPage";
import { ButtonPage } from "./Pages/ButtonPage/ButtonPage";
import { ElementHighlightPage } from "./Pages/ElementHighlightPage/ElementHighlightPage";
import { ScanlineAnimationPage } from "./Pages/ScanLineAnimationPage/ScanLineAnimationPage";
import { ScreenWiperPage } from "./Pages/ScreenWiperPage/ScreenWiperPage";
import { ShapeButtonPage } from "./Pages/ShapeButtonPage/ShapeButtonPage";
import { TypewriterPage } from "./Pages/TypewriterPage/TypewriterPage";

import * as styles from "./App.css";

/*
    const dominantColor = useColorExtractor({
        getSrc: () => knight,
        getColorCount: () => 3,
    });

            <div
                class={styles.imgContent}
                style={{
                    "background-image": `linear-gradient(45deg, ${dominantColor.getColorData()?.[0]?.css() ?? "transparent"} 50%, ${dominantColor.getColorData()?.[1]?.css() ?? "transparent"} 50%)`,
                }}
            >
                <img src={knight} height="100%" />
            </div>

*/

type TabConfig =
    | {
          name: string;
          component: () => JSX.Element;
      }
    | { name: string };

const TAB_CONFIGS: TabConfig[] = [
    {
        name: "Fundamentals",
    },
    {
        name: "AudioSwitcher",
        component: () => null,
    },
    {
        name: "Border",
        component: () => <BorderPage />,
    },
    {
        name: "Button",
        component: () => <ButtonPage />,
    },
    {
        name: "ElementHighlight",
        component: () => <ElementHighlightPage />,
    },
    {
        name: "ImageSwitcher",
        component: () => null,
    },
    {
        name: "RichText",
        component: () => null,
    },
    {
        name: "ScanlineAnimation",
        component: () => <ScanlineAnimationPage />,
    },
    {
        name: "ScreenWiper",
        component: () => <ScreenWiperPage />,
    },
    {
        name: "ShapeButton",
        component: () => <ShapeButtonPage />,
    },
    {
        name: "TypeWriter",
        component: () => <TypewriterPage />,
    },
];

const isCategory = (config: TabConfig): boolean => !("component" in config);

export function AppContent() {
    const [getTabIndex, setTabIndex] = createSignal(1);
    const [getSearchTerm, setSearchTerm] = createSignal("");

    const getTabConfig = createMemo(() => {
        const tabIndex = getTabIndex();
        const searchTerm = getSearchTerm();

        if (!getSearchTerm()) return TAB_CONFIGS;
        return TAB_CONFIGS.filter(
            (item, idx) => isCategory(item) || idx === tabIndex || item.name.toLocaleLowerCase().includes(searchTerm),
        );
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
                    getIsDisabled={(getIndex) => isCategory(getTabConfig()[getIndex()])}
                    onSelectionChange={setTabIndex}
                    renderFloater={() => <div class={styles.tabFloater} />}
                    renderTab={(getIndex) => (
                        <div
                            class={isCategory(getTabConfig()[getIndex()]) ? styles.tabCategory : styles.tabItem}
                            classList={{ [styles.isSelected]: getIndex() === getTabIndex() }}
                        >
                            {getTabConfig()[getIndex()].name}
                        </div>
                    )}
                />
            </div>

            <Show when={!isCategory(getTabConfig()[getTabIndex()])}>
                <div class={styles.tabPage}>
                    <div class={styles.tabPageTitle}>{getTabConfig()[getTabIndex()].name}</div>
                    {(getTabConfig()[getTabIndex()] as any).component()}
                </div>
            </Show>
        </div>
    );
}

export function App() {
    return (
        <div id="app">
            <Viewport getSize={() => ({ width: 1920, height: 1080 })}>
                <AppContent />
            </Viewport>
        </div>
    );
}
