import type { JSX } from "solid-js";
import { Index, Show, createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";

import { A, Route, type RouteSectionProps, Router } from "@solidjs/router";
import { FunctionUtils, Size2d, StringUtils } from "@thewaver/ss-utils";

import { Viewport } from "../../Lib/Exotics/Viewport/Viewport";
import { TabPanel, Tabs } from "../../Lib/Fundamentals/Tabs/Tabs";
import type { Tab } from "../../Lib/Fundamentals/Tabs/Tabs.types";
import { AccordionPage } from "./Pages/AccordionPage/AccordionPage";
import { BreadcrumbsPage } from "./Pages/BreadcrumbsPage/BreadcrumbsPage";
import { ButtonPage } from "./Pages/ButtonPage/ButtonPage";
import { CalendarPage } from "./Pages/CalendarPage/CalendarPage";
import { CarouselPage } from "./Pages/CarouselPage/CarouselPage";
import { CellAnimationPage } from "./Pages/CellAnimationPage/CellAnimationPage";
import { CheckboxPage } from "./Pages/CheckboxPage/CheckboxPage";
import { ColorAreaPage } from "./Pages/ColorAreaPage/ColorAreaPage";
import { ColorInputPage } from "./Pages/ColorInputPage/ColorInputPage";
import { CurrencyInputPage } from "./Pages/CurrencyInputPage/CurrencyInputPage";
import { DatePickerPage } from "./Pages/DatePickerPage/DatePickerPage";
import { DrawerPage } from "./Pages/DrawerPage/DrawerPage";
import { ElementMosaicPage } from "./Pages/ElementMosaicPage/ElementMosaicPage";
import { FileInputPage } from "./Pages/FileInputPage/FileInputPage";
import { FormPage } from "./Pages/FormPage/FormPage";
import { FormationPage } from "./Pages/FormationPage/FormationPage";
import { ImageMosaicPage } from "./Pages/ImageMosaicPage/ImageMosaicPage";
import { ImageSwitcherPage } from "./Pages/ImageSwitcherPage/ImageSwitcherPage";
import { LabelPage } from "./Pages/LabelPage/LabelPage";
import { MenuPage } from "./Pages/MenuPage/MenuPage";
import { ModalPage } from "./Pages/ModalPage/ModalPage";
import { NumberInputPage } from "./Pages/NumberInputPage/NumberInputPage";
import { PaginatorPage } from "./Pages/PaginatorPage/PaginatorPage";
import { PreviewPage } from "./Pages/PreviewPage/PreviewPage";
import { ProgressPage } from "./Pages/ProgressPage/ProgressPage";
import { RadioPage } from "./Pages/RadioPage/RadioPage";
import { RangePage } from "./Pages/RangePage/RangePage";
import { SatellitePage } from "./Pages/SatellitePage/SatellitePage";
import { ScanlineAnimationPage } from "./Pages/ScanLineAnimationPage/ScanLineAnimationPage";
import { ScreenWiperPage } from "./Pages/ScreenWiperPage/ScreenWiperPage";
import { ScrollerPage } from "./Pages/ScrollerPage/ScrollerPage";
import { SelectPage } from "./Pages/SelectPage/SelectPage";
import { ShapePage } from "./Pages/ShapePage/ShapePage";
import { SlideButtonPage } from "./Pages/SlideButtonPage/SlideButtonPage";
import { SplitPanePage } from "./Pages/SplitPanePage/SplitPanePage";
import { SpotlightPage } from "./Pages/SpotlightPage/SpotlightPage";
import { StaircasePage } from "./Pages/StaircasePage/StaircasePage";
import { StepperPage } from "./Pages/StepperPage/StepperPage";
import { SurfacePage } from "./Pages/SurfacePage/SurfacePage";
import { TabsPage } from "./Pages/TabsPage/TabsPage";
import { TagInputPage } from "./Pages/TagInputPage/TagInputPage";
import { TextAreaPage } from "./Pages/TextAreaPage/TextAreaPage";
import { TextInputPage } from "./Pages/TextInputPage/TextInputPage";
import { ToastsPage } from "./Pages/ToastsPage/ToastsPage";
import { TogglePage } from "./Pages/TogglePage/TogglePage";
import { TreePage } from "./Pages/TreePage/TreePage";
import { TypewriterPage } from "./Pages/TypewriterPage/TypewriterPage";
import { ViewportPage } from "./Pages/ViewportPage/ViewportPage";
import { WheelPage } from "./Pages/WheelPage/WheelPage";
import { PageTextField } from "./StyledComponents/Field/Field";

import * as styles from "./App.css";

type ComponentConfig = {
    name: string;
    description: string;
    component: () => JSX.Element;
};

type CategoryConfig = {
    name: string;
    components: ComponentConfig[];
    hidden?: boolean;
};

const componentToRouteName = (name: string) => `/${StringUtils.camelToKebabCase(name)}`;

const componentToTabId = (name: string) => `menu-tab-${StringUtils.camelToKebabCase(name)}`;

const componentToPanelId = (name: string) => `menu-panel-${StringUtils.camelToKebabCase(name)}`;

const SHOW_COMPOSITES = false;
const SEARCH_FIELD_WIDTH = 200;

const CATEGORY_CONFIGS: CategoryConfig[] = [
    {
        name: "Exotics",
        components: [
            {
                name: "CellAnimation",
                description:
                    "Cuts an image into a grid and animates the cells on a stagger, where a cell's turn comes from a weight rather than from its index. The animations, weights and origins on this page are Playground samples — the component itself only asks for a function from timeline to result.",
                component: () => <CellAnimationPage />,
            },
            {
                name: "ElementMosaic",
                description:
                    "Packs a set of differently sized elements into the least room they will fit in. One side is taken from the parent and the other is whatever the arrangement costs, so a short item does not leave a hole under it — the next item that fits rises into it. Items are rendered in the order they end up reading in rather than the order they were passed, so Tab and a screen reader follow the eye.",
                component: () => <ElementMosaicPage />,
            },
            {
                name: "Formation",
                description:
                    "Places a set of items into an arrangement — a podium, a whorl of three, a zigzag — from a function that answers with a position per item. Every position is a fraction of the formation's own width, so the whole thing scales with the container and nothing is measured in JavaScript.",
                component: () => <FormationPage />,
            },
            /*
            {
                name: "RichText",
                component: () => null,
            },
            */
            {
                name: "ImageMosaic",
                description:
                    "The same packing over images, where the sizes are the component's to choose rather than the consumer's. Every row is scaled to fill the fixed side exactly and each image keeps its own shape, so what the consumer picks is not a size but the shape the finished mosaic should come out closest to — a square by default.",
                component: () => <ImageMosaicPage />,
            },
            {
                name: "Satellite",
                description:
                    "Anchors one element to another and grows its own box to cover both, so a badge hanging off a corner still takes part in the parent's layout instead of spilling out of it. The placement vocabulary is the one Anchor already uses for floating layers.",
                component: () => <SatellitePage />,
            },
            {
                name: "ScanlineAnimation",
                description:
                    "The same staggering applied to horizontal lines instead of a grid, so an image can be swept, split or glitched a row at a time. The seven examples differ only in the function they hand it.",
                component: () => <ScanlineAnimationPage />,
            },
            {
                name: "ScreenWiper",
                description:
                    "Covers and uncovers the screen with a tessellation of staggered cells. Each cell is one div clipped by CSS rather than an SVG shape, because several hundred independent transforms composite far better than one viewport-sized SVG.",
                component: () => <ScreenWiperPage />,
            },
            {
                name: "Shape",
                description:
                    "Draws a border and a fill around arbitrary children, from a point list rather than a CSS box. It only reaches for SVG when the paint needs it and stays a plain div when it does not.",
                component: () => <ShapePage />,
            },
            {
                name: "Staircase",
                description:
                    "Stacks rows and insets each one by a function of its index, which makes a funnel, a spindle or a zigzag depending on the function. The direction knob hands the steps back to front rather than asking the function to know about direction.",
                component: () => <StaircasePage />,
            },
            {
                name: "TypeWriter",
                description:
                    "Reveals text one character at a time without flattening it first, so a bold run or a nested element still animates in place.",
                component: () => <TypewriterPage />,
            },
            {
                name: "Viewport",
                description:
                    "Scales everything inside it to one design size. It is terminal: anything measured, anchored or portalled within it works in the viewport's coordinates rather than the window's.",
                component: () => <ViewportPage />,
            },
            {
                name: "Wheel",
                description:
                    "A wheel of wedges that spins to a wedge the consumer names, flat on the page or as a drum seen from the side. Both are presets over one unexported shell, and both take their rotation from the same abstract: spinning to an index, overshooting and settling back, and turning on its own until it is spun.",
                component: () => <WheelPage />,
            },
        ],
    },
    {
        name: "Fundamentals",
        components: [
            /*
            {
                name: "AudioSwitcher",
                component: () => null,
            },
            */
            {
                name: "Accordion",
                description:
                    "A set of disclosure sections, each a heading that opens a region. A collapsed panel stays built and measured, which is what lets it animate to its own height rather than to a guess.",
                component: () => <AccordionPage />,
            },
            {
                name: "Breadcrumbs",
                description:
                    "A trail of links to where you are, as a navigation landmark holding an ordered list. The last crumb is the page itself, so it is not a link and says so.",
                component: () => <BreadcrumbsPage />,
            },
            {
                name: "Button",
                description:
                    "The plain button, plus the two things it owns that a native one does not: a name that wins over whatever the painter draws, and a pointer report a repeating control can hold.",
                component: () => <ButtonPage />,
            },
            {
                name: "Calendar",
                description:
                    "A month grid over a date value that carries its own calendar system, so first day, last day and era are asked of the value rather than assumed to be Gregorian.",
                component: () => <CalendarPage />,
            },
            {
                name: "Carousel",
                description:
                    "One slide at a time, wrapping at both ends, and the only component here that moves without being asked. That is what makes the stop control and the holds a conformance requirement rather than a nicety: it pauses under the pointer, while anything inside it holds focus, and while the tab is in the background.",
                component: () => <CarouselPage />,
            },
            {
                name: "Checkbox",
                description:
                    "One of three presets over a shared binary switch. It is the only one with a third state — indeterminate is a value here, not a styling trick.",
                component: () => <CheckboxPage />,
            },
            {
                name: "ColorArea",
                description:
                    "The saturation and brightness surface that replaces the operating system's colour dialog. It holds hue, saturation and value rather than hex, because eight bits per channel cannot carry hue at black — re-reading hex every frame would drift and then stick.",
                component: () => <ColorAreaPage />,
            },
            {
                name: "ColorInput",
                description:
                    "A colour field where the browser owns the picker itself. The component owns the trigger and the value, and nothing about what the dialog looks like.",
                component: () => <ColorInputPage />,
            },
            {
                name: "CurrencyInput",
                description:
                    "A money field, and deliberately not a number field with grouping switched on: the currency decides the symbol, which side it sits on and how many decimals there are, so the mask follows from the locale.",
                component: () => <CurrencyInputPage />,
            },
            {
                name: "DatePicker",
                description:
                    "A masked date field with a calendar in a popup. Only digits are typed — separators appear as you go, and the caret is computed rather than preserved.",
                component: () => <DatePickerPage />,
            },
            {
                name: "Drawer",
                description:
                    "A modal that arrives from an edge. It is a preset rather than a mode, because a panel cannot become a centred dialog while it is open.",
                component: () => <DrawerPage />,
            },
            {
                name: "FileInput",
                description:
                    "A file field where the operating system owns the dialog. The component owns what activates it and what comes back.",
                component: () => <FileInputPage />,
            },
            {
                name: "Form",
                description:
                    "Association and announcement, and nothing else. The library generates the ids and wires a control to its message; whether a value is valid is the consumer's to decide and to report.",
                component: () => <FormPage />,
            },
            {
                name: "ImageSwitcher",
                description:
                    "Cross-fades between image sources, loading the next one out of sight first so a slow or missing file never leaves a hole where the old picture was.",
                component: () => <ImageSwitcherPage />,
            },
            {
                name: "Label",
                description:
                    "A caption that wraps its control rather than pointing at it by id, so nothing has to be kept unique or in sync. It paints nothing at all, cursor included.",
                component: () => <LabelPage />,
            },
            {
                name: "Menu",
                description:
                    "A popup list of commands, with a popup per submenu level rather than one list that redraws. Focus moves between the levels, and a dismissal closes them from the innermost out.",
                component: () => <MenuPage />,
            },
            {
                name: "Modal",
                description:
                    "A dialog that traps focus, joins one dismissal stack, and hands the overlay to the consumer to paint. Escape always closes it, and that is a conformance requirement rather than a courtesy.",
                component: () => <ModalPage />,
            },
            {
                name: "NumberInput",
                description:
                    "A number field with steppers that repeat while held, and the first field to take a codec — the thing that turns typed characters into a value and back.",
                component: () => <NumberInputPage />,
            },
            {
                name: "Paginator",
                description:
                    "A page-range control, and the arithmetic is the point: which page numbers are worth showing, where the gaps fall, and which pages each gap stands for. The consumer knows the address shape, so it computes an href from a page rather than authoring the list.",
                component: () => <PaginatorPage />,
            },
            {
                name: "Preview",
                description:
                    "Content shown down to a height you set, with a control that opens it the rest of the way. Unlike a disclosure, nothing is ever hidden — the opening lines are readable from the start, which is why the part still folded away stays in the accessibility tree rather than going inert.",
                component: () => <PreviewPage />,
            },
            {
                name: "Progress",
                description:
                    "The one Fundamental with no interaction in it: state in, paint out. The painter is handed a ratio as well as the raw value, so clamping is never repeated at the call site.",
                component: () => <ProgressPage />,
            },
            {
                name: "Radio",
                description:
                    "The third preset over the shared binary switch, and the one whose group rather than whose item owns which is chosen.",
                component: () => <RadioPage />,
            },
            {
                name: "Range",
                description:
                    "A slider with one or two thumbs, on either axis. The drag arrives as a ratio along the track rather than as pixels.",
                component: () => <RangePage />,
            },
            {
                name: "Scroller",
                description:
                    "A strip too wide for its box, paged by a previous and a next button instead of a scrollbar. It holds whatever it is given without rendering or typing it, it never claims the arrow keys — whatever is inside may already own them — and when a child is focused it scrolls just far enough to show that child whole.",
                component: () => <ScrollerPage />,
            },
            {
                name: "Select",
                description:
                    "A list of options in a popup over one value or several. Filtering is the consumer's — autocomplete narrows what is shown, and the component never decides what counts as a match.",
                component: () => <SelectPage />,
            },
            {
                name: "SlideButton",
                description:
                    "A confirmation you drag rather than press. Holding it is the single-pointer route the standard asks for, so the gesture is never the only way through.",
                component: () => <SlideButtonPage />,
            },
            {
                name: "Spotlight",
                description:
                    "Cuts a hole in an overlay around one element. Three presets rather than one mode prop, because a hint, a prompt and a guide can never become one another while open.",
                component: () => <SpotlightPage />,
            },
            {
                name: "SplitPane",
                description:
                    "Resizable panes over a CSS grid: the ratios are fr shares and a pane's bounds are a clamp, so a window resize is the browser's arithmetic rather than the component's. When the minimums cannot all fit, it overflows, exactly as grid does.",
                component: () => <SplitPanePage />,
            },
            {
                name: "Stepper",
                description:
                    "A progress strip whose per-step states are the consumer's to invent — the library owns only which step is current, and insists that whatever a state means reaches the step's name as words rather than as paint alone.",
                component: () => <StepperPage />,
            },
            {
                name: "Tabs",
                description:
                    "A tab list built from records rather than from children, so the same list can be buttons, anchors, or a consumer's own link component. The panel is optional, and pairing it is the consumer's to wire.",
                component: () => <TabsPage />,
            },
            {
                name: "TagInput",
                description:
                    "A field whose value is a list: type a word, press Enter, and it becomes a tag beside the caret. Backspace on an empty field steps back into the tags rather than deleting one outright.",
                component: () => <TagInputPage />,
            },
            {
                name: "TextArea",
                description:
                    "The multi-line preset over the shared text field, including auto-sizing that follows its own content between a minimum and a maximum number of rows.",
                component: () => <TextAreaPage />,
            },
            {
                name: "TextInput",
                description:
                    "The single-line preset over the shared text field. The input itself is a blank slate laid over the painter, so the focus ring lands exactly around what was painted.",
                component: () => <TextInputPage />,
            },
            {
                name: "Toasts",
                description:
                    "A queue the consumer owns. The component shows what is in it and reports when one is finished; nothing is added or dropped behind the consumer's back.",
                component: () => <ToastsPage />,
            },
            {
                name: "Toggle",
                description:
                    "A preset over the shared binary switch. What separates it from a checkbox is what it announces and when the change takes effect, not what it stores.",
                component: () => <TogglePage />,
            },
            {
                name: "Tree",
                description:
                    "A disclosure tree with one keyboard walk over the rows that are actually visible. A node's children sit in a group box beside the node rather than inside it, which is what the role requires.",
                component: () => <TreePage />,
            },
        ],
    },
    {
        name: "Composites",
        hidden: !SHOW_COMPOSITES,
        components: [
            {
                name: "Surface",
                description:
                    "A box that takes the SVG path only when its fill or stroke needs one, and stays a plain div with inline radii when it does not.",
                component: () => <SurfacePage />,
            },
        ],
    },
];

type MenuCategory = {
    name: string;
    hidden?: boolean;
    tabs: Tab<ComponentConfig>[];
};

const MENU_CATEGORIES: MenuCategory[] = CATEGORY_CONFIGS.map((category) => ({
    name: category.name,
    hidden: category.hidden,
    tabs: category.components.map((component) => ({
        value: component,
        href: componentToRouteName(component.name),
        id: componentToTabId(component.name),
        panelId: componentToPanelId(component.name),
    })),
}));

const COMPONENT_CONFIGS = CATEGORY_CONFIGS.flatMap((category) => category.components);

const COMPONENT_CONFIGS_BY_ROUTE = Object.fromEntries(
    COMPONENT_CONFIGS.map((config) => [componentToRouteName(config.name), config]),
);

export function AppContent(props: RouteSectionProps) {
    const [getSelectedConfig, setSelectedConfig] = createSignal<ComponentConfig>();
    const [getSearchTerm, setSearchTerm] = createSignal("");

    const getVisibleCategories = createMemo(() => {
        const selectedConfig = getSelectedConfig();
        const searchTerm = getSearchTerm().toLocaleLowerCase();

        return MENU_CATEGORIES.filter((category) => !category.hidden)
            .map((category) => ({
                name: category.name,
                tabs: searchTerm
                    ? category.tabs.filter(
                          (tab) =>
                              tab.value === selectedConfig || tab.value.name.toLocaleLowerCase().includes(searchTerm),
                      )
                    : category.tabs,
            }))
            .filter((category) => category.tabs.length > 0);
    });

    createEffect(() => {
        const pathName = props.location.pathname;

        setSelectedConfig(() => COMPONENT_CONFIGS_BY_ROUTE[pathName]);
    });

    return (
        <div class={styles.appContent}>
            <div class={styles.leftMenu}>
                <div class={styles.searchContainer}>
                    <PageTextField
                        value={getSearchTerm}
                        width={() => SEARCH_FIELD_WIDTH}
                        placeholder={"Search"}
                        ariaLabel={"Search components"}
                        onInput={setSearchTerm}
                    />
                </div>

                <Index each={getVisibleCategories()}>
                    {(getCategory) => (
                        <div class={styles.menuSection}>
                            <h2 class={styles.menuCategory}>{getCategory().name}</h2>

                            <Tabs
                                dir={"column"}
                                ariaLabel={() => getCategory().name}
                                tabs={() => getCategory().tabs}
                                selectedValue={getSelectedConfig}
                                onSelectionChange={(config) => setSelectedConfig(() => config)}
                                linkComponent={A}
                                renderFloater={(getVisibilityTarget, getTransitionDurationMs) => (
                                    <div
                                        class={styles.tabFloater}
                                        classList={{ [styles.isVisible]: getVisibilityTarget() === 1 }}
                                        style={{ "transition-duration": `${getTransitionDurationMs()}ms` }}
                                    />
                                )}
                                renderTab={(getTab) => (
                                    <div
                                        class={styles.tabItem}
                                        classList={{ [styles.isSelected]: getTab().value === getSelectedConfig() }}
                                    >
                                        {getTab().value.name}
                                    </div>
                                )}
                            />
                        </div>
                    )}
                </Index>
            </div>

            <div class={styles.tabPage}>
                <Show when={getSelectedConfig()} fallback={props.children}>
                    {(getConfig) => (
                        <TabPanel
                            id={() => componentToPanelId(getConfig().name)}
                            tabId={() => componentToTabId(getConfig().name)}
                        >
                            <div class={styles.tabPanelBody}>
                                <div class={styles.tabPageHeader}>
                                    <div class={styles.tabPageTitle}>{getConfig().name}</div>
                                    <div class={styles.tabPageDescription}>{getConfig().description}</div>
                                </div>

                                {props.children}
                            </div>
                        </TabPanel>
                    )}
                </Show>
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
                        <Viewport size={getViewportSize}>
                            <AppContent {...props} />
                        </Viewport>
                    )}
                >
                    <Route path="/" component={() => <>{null}</>} />
                    {COMPONENT_CONFIGS.map((config) => (
                        <Route path={componentToRouteName(config.name)} component={config.component} />
                    ))}
                </Route>
            </Router>
        </div>
    );
}
