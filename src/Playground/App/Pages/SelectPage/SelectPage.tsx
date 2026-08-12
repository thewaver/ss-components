import type { JSX } from "solid-js";
import { Show, createEffect, createMemo, createSignal, on } from "solid-js";

import type { AnchorPlacement } from "../../../../Lib/Abstracts/Anchor/Anchor.types";
import { FPSUtils } from "../../../../Lib/Abstracts/FPS/FPS.utils";
import { Label } from "../../../../Lib/Fundamentals/Input/Label/Label";
import { MultiSelect } from "../../../../Lib/Fundamentals/Input/MultiSelect/MultiSelect";
import { Select } from "../../../../Lib/Fundamentals/Input/Select/Select";
import type { SelectItem, SelectOption } from "../../../../Lib/Fundamentals/Input/Select/Select.types";
import { SelectUtils } from "../../../../Lib/Fundamentals/Input/Select/Select.utils";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageCheckField, PageNumberField } from "../../StyledComponents/Field/Field";
import { PageLabelCaption } from "../../StyledComponents/LabelCaption/LabelCaption";
import { PagePopoverSurface } from "../../StyledComponents/PopoverSurface/PopoverSurface";
import { PageSelectContent, computePageSelectTextStyle } from "../../StyledComponents/SelectContent/SelectContent";
import { PageSelectGroupContent } from "../../StyledComponents/SelectGroupContent/SelectGroupContent";
import { PageSelectOptionContent } from "../../StyledComponents/SelectOptionContent/SelectOptionContent";
import { PageTooltipContent } from "../../StyledComponents/TooltipContent/TooltipContent";

import * as popupStyles from "../../StyledComponents/PopoverSurface/PopoverSurface.css";
import { FIELD_CHEVRON_WIDTH, FIELD_GAP, FIELD_PADDING } from "../../StyledComponents/SelectContent/SelectContent.css";

type Airport = {
    code: string;
    city: string;
};

type Delivery = {
    name: string;
    description: string;
};

const PLACEHOLDER = "Pick one";

const COUNTRIES: SelectOption<string>[] = [
    { value: "Belgium" },
    { value: "Denmark" },
    { value: "Estonia" },
    { value: "Finland" },
    { value: "Portugal" },
    { value: "Sweden" },
];

const COUNTRIES_WITH_DISABLED: SelectOption<string>[] = [
    { value: "Belgium" },
    { value: "Denmark", isDisabled: true },
    { value: "Estonia" },
    { value: "Finland", isDisabled: true },
    { value: "Portugal" },
    { value: "Sweden" },
];

const COUNTRIES_WITH_REACHABLE: SelectOption<string>[] = [
    { value: "Belgium" },
    {
        value: "Denmark",
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
                    Not shipping here until the new depot opens.
                </PageTooltipContent>
            ),
        },
    },
    { value: "Estonia" },
    {
        value: "Finland",
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
                    Out of stock for the rest of the quarter.
                </PageTooltipContent>
            ),
        },
    },
    { value: "Portugal" },
    { value: "Sweden" },
];

const GROUPED_COUNTRIES: SelectItem<string>[] = [
    {
        label: "Nordics",
        options: [{ value: "Denmark" }, { value: "Finland", isDisabled: true }, { value: "Sweden" }],
    },
    {
        label: "Benelux",
        options: [{ value: "Belgium" }, { value: "Netherlands" }],
    },
    { value: "Portugal" },
];

const HOURS: SelectOption<string>[] = Array.from({ length: 24 }, (_, hour) => ({
    value: `${String(hour).padStart(2, "0")}:00`,
}));

const AIRPORTS: SelectOption<Airport>[] = [
    { value: { code: "AMS", city: "Amsterdam" } },
    { value: { code: "CPH", city: "Copenhagen" } },
    { value: { code: "LIS", city: "Lisbon" } },
    { value: { code: "OSL", city: "Oslo" } },
    { value: { code: "TLL", city: "Tallinn" } },
];

const DELIVERIES: SelectOption<Delivery>[] = [
    {
        value: {
            name: "Standard",
            description: "Three to five working days, left with the local post office if nobody answers.",
        },
    },
    {
        value: { name: "Express", description: "Next working day, before 13:00." },
    },
    {
        value: {
            name: "Depot pickup",
            description:
                "Held at the depot you choose for up to fourteen days. Bring the order number and photo ID, or name someone else at checkout and they can collect it for you instead.",
        },
    },
    {
        value: {
            name: "Courier to the door",
            description: "A two-hour window you pick the evening before, with a call ten minutes ahead.",
        },
    },
];

const MIN_STRESS_COUNT = 0;
const MAX_STRESS_COUNT = 200000;
const STRESS_COUNT_STEP = 1000;
const STARTING_STRESS_COUNT = 10000;
const STRESS_COUNT_FIELD_WIDTH = 120;

const STRESS_DESCRIPTIONS = [
    "Next working day, before 13:00.",
    "Three to five working days, left with the local post office if nobody answers.",
    "Held at the depot for up to fourteen days. Bring the order number and photo ID, or name someone else at checkout and they can collect it on your behalf instead.",
];

const createStressDeliveries = (count: number, offset = 0): SelectOption<Delivery>[] =>
    Array.from({ length: count }, (_, index) => ({
        value: {
            name: `Route ${offset + index + 1}`,
            description: STRESS_DESCRIPTIONS[(offset + index) % STRESS_DESCRIPTIONS.length],
        },
    }));

const PAGE_SIZE = 40;
const PAGED_TOTAL = 500;
const PAGE_DELAY_MS = 600;

const fetchRoutes = (offset: number) =>
    new Promise<SelectOption<Delivery>[]>((resolve) => {
        setTimeout(
            () => resolve(createStressDeliveries(Math.min(PAGE_SIZE, PAGED_TOTAL - offset), offset)),
            PAGE_DELAY_MS,
        );
    });

const SERVER_ROUTES = createStressDeliveries(PAGED_TOTAL);

const searchRoutes = (query: string, offset: number) =>
    new Promise<{ items: SelectOption<Delivery>[]; total: number }>((resolve) => {
        setTimeout(() => {
            const needle = query.toLocaleLowerCase();
            const matched = needle
                ? SERVER_ROUTES.filter((option) => option.value.name.toLocaleLowerCase().includes(needle))
                : SERVER_ROUTES;

            resolve({ items: matched.slice(offset, offset + PAGE_SIZE), total: matched.length });
        }, PAGE_DELAY_MS);
    });

export const SelectPage = () => {
    const [getIsSkippingOffScreen, setIsSkippingOffScreen] = createSignal(true);
    const [getStressCount, setStressCount] = createSignal(STARTING_STRESS_COUNT);
    const [getOpenMs, setOpenMs] = createSignal<number>();

    const renderSelectPopup = (
        renderOptions: () => JSX.Element,
        getVisibilityTarget: () => 0 | 1,
        getTransitionDurationMs: () => number,
        getPlacement: () => AnchorPlacement,
    ) => (
        <PagePopoverSurface
            getVisibilityTarget={getVisibilityTarget}
            getTransitionDurationMs={getTransitionDurationMs}
            getPlacement={getPlacement}
            getIsSkippingOffScreen={getIsSkippingOffScreen}
        >
            {renderOptions()}
        </PagePopoverSurface>
    );

    const filterQuerySignal = createSignal("");
    const filterSignal = createSignal<Airport | undefined>();
    const groupedSignal = createSignal<string | undefined>();
    const multiSignal = createSignal<string[]>(["Denmark"]);
    const everythingQuerySignal = createSignal("");
    const everythingSignal = createSignal<string[]>([]);
    const defaultSignal = createSignal<string | undefined>();
    const preselectedSignal = createSignal<string | undefined>("Portugal");
    const disabledOptionSignal = createSignal<string | undefined>();
    const reachableOptionSignal = createSignal<string | undefined>();
    const longSignal = createSignal<string | undefined>("13:00");
    const deliverySignal = createSignal<Delivery | undefined>();
    const recordSignal = createSignal<Airport | undefined>();
    const erroredSignal = createSignal<string | undefined>();
    const disabledSignal = createSignal<string | undefined>("Sweden");
    const reachableSignal = createSignal<string | undefined>("Sweden");
    const labelledSignal = createSignal<string | undefined>();
    const stressSignal = createSignal<Delivery | undefined>();
    const stressVisibility = createSignal(false);
    const pagedSignal = createSignal<Delivery | undefined>();

    const [getPagedRoutes, setPagedRoutes] = createSignal<SelectOption<Delivery>[]>([]);
    const [getIsFetching, setIsFetching] = createSignal(false);

    const searchQuerySignal = createSignal("");
    const searchSignal = createSignal<Delivery | undefined>();

    const [getSearchResults, setSearchResults] = createSignal<SelectOption<Delivery>[]>([]);
    const [getSearchTotal, setSearchTotal] = createSignal(0);
    const [getIsSearching, setIsSearching] = createSignal(false);

    let searchRequest = 0;

    const runSearch = async (offset: number) => {
        const request = ++searchRequest;

        setIsSearching(true);

        const page = await searchRoutes(searchQuerySignal[0](), offset);

        if (request !== searchRequest) return;

        setSearchResults((results) => (offset > 0 ? [...results, ...page.items] : page.items));
        setSearchTotal(page.total);
        setIsSearching(false);
    };

    createEffect(
        on(
            () => searchQuerySignal[0](),
            () => {
                setSearchResults([]);
                setSearchTotal(0);

                void runSearch(0);
            },
        ),
    );

    const getHasMoreResults = () => getSearchResults().length < getSearchTotal() || getIsSearching();

    const getHasMoreRoutes = () => getPagedRoutes().length < PAGED_TOTAL;

    const fetchNextRoutes = async () => {
        if (getIsFetching()) return;

        setIsFetching(true);

        const page = await fetchRoutes(getPagedRoutes().length);

        setPagedRoutes((routes) => [...routes, ...page]);
        setIsFetching(false);
    };

    const { getFPS } = FPSUtils.createMonitor(() => !stressVisibility[0]());

    const getStressDeliveries = createMemo(() => createStressDeliveries(getStressCount()));

    const measureOpen = (renderOptions: () => JSX.Element) => {
        const startedAt = performance.now();
        const options = renderOptions();

        requestAnimationFrame(() => requestAnimationFrame(() => setOpenMs(performance.now() - startedAt)));

        return options;
    };

    const getFilteredAirports = createMemo(() => {
        const query = filterQuerySignal[0]().toLocaleLowerCase();

        if (!query) return AIRPORTS;

        return AIRPORTS.filter(
            (option) =>
                option.value.city.toLocaleLowerCase().includes(query) ||
                option.value.code.toLocaleLowerCase().includes(query),
        );
    });

    const getFilteredGroups = createMemo(() => {
        const query = everythingQuerySignal[0]().toLocaleLowerCase();

        if (!query) return GROUPED_COUNTRIES;

        return GROUPED_COUNTRIES.map((item) =>
            SelectUtils.getIsGroup(item)
                ? {
                      ...item,
                      options: item.options.filter((option) => option.value.toLocaleLowerCase().includes(query)),
                  }
                : item,
        ).filter((item) =>
            SelectUtils.getIsGroup(item) ? item.options.length > 0 : item.value.toLocaleLowerCase().includes(query),
        );
    });

    const getVariants = createMemo(() => {
        return [
            {
                name: "Default",
                readout: () => `value: ${defaultSignal[0]() ?? "undefined"}`,
                component: () => (
                    <Select
                        valueSignal={defaultSignal}
                        getOptions={() => COUNTRIES}
                        getAriaLabel={() => "Country"}
                        renderContent={(getSelectedOption, getFlags) => (
                            <PageSelectContent getFlags={getFlags}>
                                {getSelectedOption()?.value ?? PLACEHOLDER}
                            </PageSelectContent>
                        )}
                        renderOption={(getOption, getFlags) => (
                            <PageSelectOptionContent getFlags={getFlags}>{getOption().value}</PageSelectOptionContent>
                        )}
                        renderPopup={renderSelectPopup}
                    />
                ),
            },
            {
                name: "Preselected",
                readout: () => `value: ${preselectedSignal[0]() ?? "undefined"} — reopening highlights it`,
                component: () => (
                    <Select
                        valueSignal={preselectedSignal}
                        getOptions={() => COUNTRIES}
                        getAriaLabel={() => "Country"}
                        renderContent={(getSelectedOption, getFlags) => (
                            <PageSelectContent getFlags={getFlags}>
                                {getSelectedOption()?.value ?? PLACEHOLDER}
                            </PageSelectContent>
                        )}
                        renderOption={(getOption, getFlags) => (
                            <PageSelectOptionContent getFlags={getFlags}>{getOption().value}</PageSelectOptionContent>
                        )}
                        renderPopup={renderSelectPopup}
                    />
                ),
            },
            {
                name: "Disabled options",
                readout: () => `value: ${disabledOptionSignal[0]() ?? "undefined"} — arrows skip Denmark and Finland`,
                component: () => (
                    <Select
                        valueSignal={disabledOptionSignal}
                        getOptions={() => COUNTRIES_WITH_DISABLED}
                        getAriaLabel={() => "Country"}
                        renderContent={(getSelectedOption, getFlags) => (
                            <PageSelectContent getFlags={getFlags}>
                                {getSelectedOption()?.value ?? PLACEHOLDER}
                            </PageSelectContent>
                        )}
                        renderOption={(getOption, getFlags) => (
                            <PageSelectOptionContent getFlags={getFlags}>{getOption().value}</PageSelectOptionContent>
                        )}
                        renderPopup={renderSelectPopup}
                    />
                ),
            },
            {
                name: "Disabled options + reachable",
                readout: () =>
                    `value: ${reachableOptionSignal[0]() ?? "undefined"} — arrows stop on them, hover explains why`,
                component: () => (
                    <Select
                        valueSignal={reachableOptionSignal}
                        getOptions={() => COUNTRIES_WITH_REACHABLE}
                        getAriaLabel={() => "Country"}
                        renderContent={(getSelectedOption, getFlags) => (
                            <PageSelectContent getFlags={getFlags}>
                                {getSelectedOption()?.value ?? PLACEHOLDER}
                            </PageSelectContent>
                        )}
                        renderOption={(getOption, getFlags) => (
                            <PageSelectOptionContent getFlags={getFlags}>{getOption().value}</PageSelectOptionContent>
                        )}
                        renderPopup={renderSelectPopup}
                    />
                ),
            },
            {
                name: "Autocomplete",
                readout: () =>
                    `value: ${filterSignal[0]()?.code ?? "undefined"} | query: "${filterQuerySignal[0]()}" — ${getFilteredAirports().length} of ${AIRPORTS.length} shown; the page matches on city or code, which only it knows about`,
                component: () => (
                    <Select
                        valueSignal={filterSignal}
                        querySignal={filterQuerySignal}
                        getOptions={getFilteredAirports}
                        getAriaLabel={() => "Airport"}
                        getPadding={() => ({
                            paddingTop: FIELD_PADDING,
                            paddingBottom: FIELD_PADDING,
                            paddingLeft: FIELD_PADDING,
                            paddingRight: FIELD_PADDING + FIELD_GAP + FIELD_CHEVRON_WIDTH,
                        })}
                        computeTextStyle={computePageSelectTextStyle}
                        renderContent={(getSelectedOption, getFlags) => (
                            <PageSelectContent getFlags={getFlags}>
                                {getSelectedOption()?.value.city ?? PLACEHOLDER}
                            </PageSelectContent>
                        )}
                        renderOption={(getOption, getFlags) => (
                            <PageSelectOptionContent getFlags={getFlags}>
                                {getOption().value.city} ({getOption().value.code})
                            </PageSelectOptionContent>
                        )}
                        renderPopup={(renderOptions, getVisibilityTarget, getTransitionDurationMs, getPlacement) => (
                            <PagePopoverSurface
                                getVisibilityTarget={getVisibilityTarget}
                                getTransitionDurationMs={getTransitionDurationMs}
                                getPlacement={getPlacement}
                                getIsSkippingOffScreen={getIsSkippingOffScreen}
                            >
                                {getFilteredAirports().length ? (
                                    renderOptions()
                                ) : (
                                    <div class={popupStyles.popoverSurfaceEmpty}>No airport matches that</div>
                                )}
                            </PagePopoverSurface>
                        )}
                    />
                ),
            },
            {
                name: "Autocomplete, fetched",
                readout: () =>
                    `value: ${searchSignal[0]()?.name ?? "undefined"} | query: "${searchQuerySignal[0]()}" — ${getSearchResults().length} of ${getSearchTotal()} matches held${
                        getIsSearching() ? ", asking the server" : ""
                    }; typing starts a new search rather than filtering what arrived`,
                component: () => (
                    <Select
                        valueSignal={searchSignal}
                        querySignal={searchQuerySignal}
                        getOptions={getSearchResults}
                        getHasMoreOptions={getHasMoreResults}
                        getAriaLabel={() => "Route"}
                        getPadding={() => ({
                            paddingTop: FIELD_PADDING,
                            paddingBottom: FIELD_PADDING,
                            paddingLeft: FIELD_PADDING,
                            paddingRight: FIELD_PADDING + FIELD_GAP + FIELD_CHEVRON_WIDTH,
                        })}
                        computeTextStyle={computePageSelectTextStyle}
                        renderContent={(getSelectedOption, getFlags) => (
                            <PageSelectContent getFlags={getFlags}>
                                {getSelectedOption()?.value.name ?? PLACEHOLDER}
                            </PageSelectContent>
                        )}
                        renderOption={(getOption, getFlags) => (
                            <PageSelectOptionContent
                                getFlags={getFlags}
                                getDescription={() => getOption().value.description}
                            >
                                {getOption().value.name}
                            </PageSelectOptionContent>
                        )}
                        renderPopup={(renderOptions, getVisibilityTarget, getTransitionDurationMs, getPlacement) => (
                            <PagePopoverSurface
                                getVisibilityTarget={getVisibilityTarget}
                                getTransitionDurationMs={getTransitionDurationMs}
                                getPlacement={getPlacement}
                                getIsSkippingOffScreen={getIsSkippingOffScreen}
                            >
                                {renderOptions()}

                                <Show when={getIsSearching()}>
                                    <div class={popupStyles.popoverSurfaceEmpty}>Searching…</div>
                                </Show>

                                <Show when={!getIsSearching() && getSearchTotal() < 1}>
                                    <div class={popupStyles.popoverSurfaceEmpty}>No route matches that</div>
                                </Show>
                            </PagePopoverSurface>
                        )}
                        onReachEnd={() => {
                            if (getIsSearching()) return;

                            void runSearch(getSearchResults().length);
                        }}
                    />
                ),
            },
            {
                name: "Option groups",
                readout: () =>
                    `value: ${groupedSignal[0]() ?? "undefined"} — arrows cross group boundaries and skip Finland`,
                component: () => (
                    <Select
                        valueSignal={groupedSignal}
                        getOptions={() => GROUPED_COUNTRIES}
                        getAriaLabel={() => "Country"}
                        renderContent={(getSelectedOption, getFlags) => (
                            <PageSelectContent getFlags={getFlags}>
                                {getSelectedOption()?.value ?? PLACEHOLDER}
                            </PageSelectContent>
                        )}
                        renderGroup={(getGroup) => <PageSelectGroupContent>{getGroup().label}</PageSelectGroupContent>}
                        renderOption={(getOption, getFlags) => (
                            <PageSelectOptionContent getFlags={getFlags}>{getOption().value}</PageSelectOptionContent>
                        )}
                        renderPopup={renderSelectPopup}
                    />
                ),
            },
            {
                name: "Multi-select",
                readout: () => `values: [${multiSignal[0]().join(", ")}] — picking keeps the list open`,
                component: () => (
                    <MultiSelect
                        valuesSignal={multiSignal}
                        getOptions={() => COUNTRIES}
                        getAriaLabel={() => "Countries"}
                        renderContent={(getSelectedOptions, getFlags) => (
                            <PageSelectContent getFlags={getFlags}>
                                {getSelectedOptions().length
                                    ? getSelectedOptions()
                                          .map((option) => option.value)
                                          .join(", ")
                                    : PLACEHOLDER}
                            </PageSelectContent>
                        )}
                        renderOption={(getOption, getFlags) => (
                            <PageSelectOptionContent getFlags={getFlags}>{getOption().value}</PageSelectOptionContent>
                        )}
                        renderPopup={renderSelectPopup}
                    />
                ),
            },
            {
                name: "Multi-select, grouped, filterable",
                readout: () =>
                    `values: [${everythingSignal[0]().join(", ")}] | query: "${everythingQuerySignal[0]()}" — the page drops groups it has emptied`,
                component: () => (
                    <MultiSelect
                        valuesSignal={everythingSignal}
                        querySignal={everythingQuerySignal}
                        getOptions={getFilteredGroups}
                        getAriaLabel={() => "Countries"}
                        getPadding={() => ({
                            paddingTop: FIELD_PADDING,
                            paddingBottom: FIELD_PADDING,
                            paddingLeft: FIELD_PADDING,
                            paddingRight: FIELD_PADDING + FIELD_GAP + FIELD_CHEVRON_WIDTH,
                        })}
                        computeTextStyle={computePageSelectTextStyle}
                        renderContent={(getSelectedOptions, getFlags) => (
                            <PageSelectContent getFlags={getFlags}>
                                {getSelectedOptions().length ? `${getSelectedOptions().length} selected` : PLACEHOLDER}
                            </PageSelectContent>
                        )}
                        renderGroup={(getGroup) => <PageSelectGroupContent>{getGroup().label}</PageSelectGroupContent>}
                        renderOption={(getOption, getFlags) => (
                            <PageSelectOptionContent getFlags={getFlags}>{getOption().value}</PageSelectOptionContent>
                        )}
                        renderPopup={(renderOptions, getVisibilityTarget, getTransitionDurationMs, getPlacement) => (
                            <PagePopoverSurface
                                getVisibilityTarget={getVisibilityTarget}
                                getTransitionDurationMs={getTransitionDurationMs}
                                getPlacement={getPlacement}
                                getIsSkippingOffScreen={getIsSkippingOffScreen}
                            >
                                {getFilteredGroups().length ? (
                                    renderOptions()
                                ) : (
                                    <div class={popupStyles.popoverSurfaceEmpty}>No country matches that</div>
                                )}
                            </PagePopoverSurface>
                        )}
                    />
                ),
            },
            {
                name: "Scrolling list",
                readout: () => `value: ${longSignal[0]() ?? "undefined"} — Home and End reach both ends`,
                component: () => (
                    <Select
                        valueSignal={longSignal}
                        getOptions={() => HOURS}
                        getAriaLabel={() => "Departure hour"}
                        renderContent={(getSelectedOption, getFlags) => (
                            <PageSelectContent getFlags={getFlags}>
                                {getSelectedOption()?.value ?? PLACEHOLDER}
                            </PageSelectContent>
                        )}
                        renderOption={(getOption, getFlags) => (
                            <PageSelectOptionContent getFlags={getFlags}>{getOption().value}</PageSelectOptionContent>
                        )}
                        renderPopup={renderSelectPopup}
                    />
                ),
            },
            {
                name: "Title and description",
                readout: () =>
                    `value: ${deliverySignal[0]()?.name ?? "undefined"} — the descriptions wrap, so no two rows are the same height`,
                component: () => (
                    <Select
                        valueSignal={deliverySignal}
                        getOptions={() => DELIVERIES}
                        getAriaLabel={() => "Delivery"}
                        renderContent={(getSelectedOption, getFlags) => (
                            <PageSelectContent getFlags={getFlags}>
                                {getSelectedOption()?.value.name ?? PLACEHOLDER}
                            </PageSelectContent>
                        )}
                        renderOption={(getOption, getFlags) => (
                            <PageSelectOptionContent
                                getFlags={getFlags}
                                getDescription={() => getOption().value.description}
                            >
                                {getOption().value.name}
                            </PageSelectOptionContent>
                        )}
                        renderPopup={renderSelectPopup}
                    />
                ),
            },
            {
                name: "Stress test",
                readout: () =>
                    `${getStressCount().toLocaleString("en-GB")} options — ${
                        getOpenMs() === undefined
                            ? "never opened"
                            : `${Math.round(getOpenMs()!)} ms from click to the first painted frame`
                    }, ${stressVisibility[0]() ? `${getFPS().current.toFixed(0)} fps while open` : "closed"}`,
                component: () => (
                    <Select
                        valueSignal={stressSignal}
                        visibilitySignal={stressVisibility}
                        getOptions={getStressDeliveries}
                        getAriaLabel={() => "Route"}
                        renderContent={(getSelectedOption, getFlags) => (
                            <PageSelectContent getFlags={getFlags}>
                                {getSelectedOption()?.value.name ?? PLACEHOLDER}
                            </PageSelectContent>
                        )}
                        renderOption={(getOption, getFlags) => (
                            <PageSelectOptionContent
                                getFlags={getFlags}
                                getDescription={() => getOption().value.description}
                            >
                                {getOption().value.name}
                            </PageSelectOptionContent>
                        )}
                        renderPopup={(renderOptions, getVisibilityTarget, getTransitionDurationMs, getPlacement) =>
                            renderSelectPopup(
                                () => measureOpen(renderOptions),
                                getVisibilityTarget,
                                getTransitionDurationMs,
                                getPlacement,
                            )
                        }
                    />
                ),
            },
            {
                name: "Loaded on demand",
                readout: () =>
                    `${getPagedRoutes().length} of ${PAGED_TOTAL} routes fetched${
                        getIsFetching() ? ", another batch in flight" : ""
                    } — reaching the end asks for ${PAGE_SIZE} more, and the arrows stop at the last one held`,
                component: () => (
                    <Select
                        valueSignal={pagedSignal}
                        getOptions={getPagedRoutes}
                        getHasMoreOptions={getHasMoreRoutes}
                        getAriaLabel={() => "Route"}
                        renderContent={(getSelectedOption, getFlags) => (
                            <PageSelectContent getFlags={getFlags}>
                                {getSelectedOption()?.value.name ?? PLACEHOLDER}
                            </PageSelectContent>
                        )}
                        renderOption={(getOption, getFlags) => (
                            <PageSelectOptionContent
                                getFlags={getFlags}
                                getDescription={() => getOption().value.description}
                            >
                                {getOption().value.name}
                            </PageSelectOptionContent>
                        )}
                        renderPopup={(renderOptions, getVisibilityTarget, getTransitionDurationMs, getPlacement) => (
                            <PagePopoverSurface
                                getVisibilityTarget={getVisibilityTarget}
                                getTransitionDurationMs={getTransitionDurationMs}
                                getPlacement={getPlacement}
                                getIsSkippingOffScreen={getIsSkippingOffScreen}
                            >
                                {renderOptions()}

                                <Show when={getIsFetching()}>
                                    <div class={popupStyles.popoverSurfaceEmpty}>Fetching more routes…</div>
                                </Show>
                            </PagePopoverSurface>
                        )}
                        onReachEnd={fetchNextRoutes}
                    />
                ),
            },
            {
                name: "Record values",
                readout: () => `value: ${recordSignal[0]()?.code ?? "undefined"}`,
                component: () => (
                    <Select
                        valueSignal={recordSignal}
                        getOptions={() => AIRPORTS}
                        getAriaLabel={() => "Airport"}
                        renderContent={(getSelectedOption, getFlags) => (
                            <PageSelectContent getFlags={getFlags}>
                                {getSelectedOption() ? getSelectedOption()!.value.city : PLACEHOLDER}
                            </PageSelectContent>
                        )}
                        renderOption={(getOption, getFlags) => (
                            <PageSelectOptionContent getFlags={getFlags}>
                                {getOption().value.city} ({getOption().value.code})
                            </PageSelectOptionContent>
                        )}
                        renderPopup={renderSelectPopup}
                    />
                ),
            },
            {
                name: "Error",
                readout: () => `value: ${erroredSignal[0]() ?? "undefined"} — required, nothing picked yet`,
                component: () => (
                    <Select
                        valueSignal={erroredSignal}
                        getOptions={() => COUNTRIES}
                        getAriaLabel={() => "Country"}
                        getHasError={() => erroredSignal[0]() === undefined}
                        renderContent={(getSelectedOption, getFlags) => (
                            <PageSelectContent getFlags={getFlags}>
                                {getSelectedOption()?.value ?? PLACEHOLDER}
                            </PageSelectContent>
                        )}
                        renderOption={(getOption, getFlags) => (
                            <PageSelectOptionContent getFlags={getFlags}>{getOption().value}</PageSelectOptionContent>
                        )}
                        renderPopup={renderSelectPopup}
                    />
                ),
            },
            {
                name: "Disabled",
                readout: () => `value: ${disabledSignal[0]() ?? "undefined"}`,
                component: () => (
                    <Select
                        valueSignal={disabledSignal}
                        getOptions={() => COUNTRIES}
                        getIsDisabled={() => true}
                        getAriaLabel={() => "Country"}
                        renderContent={(getSelectedOption, getFlags) => (
                            <PageSelectContent getFlags={getFlags}>
                                {getSelectedOption()?.value ?? PLACEHOLDER}
                            </PageSelectContent>
                        )}
                        renderOption={(getOption, getFlags) => (
                            <PageSelectOptionContent getFlags={getFlags}>{getOption().value}</PageSelectOptionContent>
                        )}
                        renderPopup={renderSelectPopup}
                    />
                ),
            },
            {
                name: "Disabled + reachable",
                readout: () => `value: ${reachableSignal[0]() ?? "undefined"}`,
                component: () => (
                    <Select
                        valueSignal={reachableSignal}
                        getOptions={() => COUNTRIES}
                        getIsDisabled={() => true}
                        getIsReachableWhenDisabled={() => true}
                        getAriaLabel={() => "Country"}
                        renderContent={(getSelectedOption, getFlags) => (
                            <PageSelectContent getFlags={getFlags}>
                                {getSelectedOption()?.value ?? PLACEHOLDER}
                            </PageSelectContent>
                        )}
                        renderOption={(getOption, getFlags) => (
                            <PageSelectOptionContent getFlags={getFlags}>{getOption().value}</PageSelectOptionContent>
                        )}
                        renderPopup={renderSelectPopup}
                        getTooltipDefs={() => ({
                            getPlacement: () => ({ x: "center", y: "top-out" }),
                            getOffset: () => ({ x: 0, y: 5 }),
                            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                                <PageTooltipContent
                                    getVisibilityTarget={getVisibilityTarget}
                                    getTransitionDurationMs={getTransitionDurationMs}
                                >
                                    Focusable so this can be read, but the list must not open.
                                </PageTooltipContent>
                            ),
                        })}
                    />
                ),
            },
            {
                name: "In a Label",
                readout: () => `value: ${labelledSignal[0]() ?? "undefined"} — the caption opens the list`,
                component: () => (
                    <Label getDir={() => "column"} getGap={() => 5}>
                        <PageLabelCaption>Country</PageLabelCaption>

                        <Select
                            valueSignal={labelledSignal}
                            getOptions={() => COUNTRIES}
                            renderContent={(getSelectedOption, getFlags) => (
                                <PageSelectContent getFlags={getFlags}>
                                    {getSelectedOption()?.value ?? PLACEHOLDER}
                                </PageSelectContent>
                            )}
                            renderOption={(getOption, getFlags) => (
                                <PageSelectOptionContent getFlags={getFlags}>
                                    {getOption().value}
                                </PageSelectOptionContent>
                            )}
                            renderPopup={renderSelectPopup}
                        />
                    </Label>
                ),
            },
        ];
    });

    return (
        <>
            <PagePropsPanel getScope={() => "global"}>
                <PageProp getLabel={() => "Skip off-screen options"}>
                    <PageCheckField
                        getValue={getIsSkippingOffScreen}
                        getAriaLabel={() => "Skip off-screen options"}
                        onChange={setIsSkippingOffScreen}
                    />
                </PageProp>

                <PageProp getLabel={() => "Stress options"}>
                    <PageNumberField
                        getValue={getStressCount}
                        getMin={() => MIN_STRESS_COUNT}
                        getMax={() => MAX_STRESS_COUNT}
                        getStep={() => STRESS_COUNT_STEP}
                        getWidth={() => STRESS_COUNT_FIELD_WIDTH}
                        getAriaLabel={() => "Stress options"}
                        onInput={(count) => {
                            setStressCount(count);
                            setOpenMs(undefined);
                        }}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageVariants getItems={getVariants} />
        </>
    );
};
