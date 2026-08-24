import type { JSX } from "solid-js";
import { createEffect, createMemo, createSignal, on } from "solid-js";

import { FPSUtils } from "../../../../Lib/Abstracts/FPS/FPS.utils";
import type { SelectOption } from "../../../../Lib/Fundamentals/Input/Select/Select.types";
import { SelectUtils } from "../../../../Lib/Fundamentals/Input/Select/Select.utils";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { AirportsExample } from "./Examples/Airports";
import { AutocompleteExample } from "./Examples/Autocomplete";
import { AutocompleteOnDemandExample } from "./Examples/AutocompleteOnDemand";
import { CountriesExample } from "./Examples/Countries";
import { DeliveriesExample } from "./Examples/Deliveries";
import { HoursExample } from "./Examples/Hours";
import { LabelledExample } from "./Examples/Labelled";
import { MultiSelectCountriesExample } from "./Examples/MultiSelectCountries";
import { MultiSelectGroupedExample } from "./Examples/MultiSelectGrouped";
import { OnDemandExample } from "./Examples/OnDemand";
import { ReachableExample } from "./Examples/Reachable";
import { VirtualizedExample } from "./Examples/Virtualized";
import {
    AIRPORTS,
    COUNTRIES_WITH_DISABLED,
    COUNTRIES_WITH_REACHABLE,
    GROUPED_COUNTRIES,
    STRESS_GROUP_SIZE,
    createStressDeliveries,
    createStressDeliveryGroups,
} from "./SelectPage.const";
import type { Airport, Delivery } from "./SelectPage.types";

const STARTING_STRESS_COUNT = 10000;
const PAGE_SIZE = 40;
const PAGED_TOTAL = 500;
const PAGE_DELAY_MS = 600;
const EXAMPLES_ROOT = "/src/Playground/App/Pages/SelectPage/Examples";

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
    const [getStressCount, setStressCount] = createSignal(STARTING_STRESS_COUNT);
    const [getOpenMs, setOpenMs] = createSignal<number>();

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
    const groupedStressSignal = createSignal<Delivery | undefined>();
    const groupedStressVisibility = createSignal(false);
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

    const getStressDeliveryGroups = createMemo(() => createStressDeliveryGroups(getStressCount()));

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

    const getExamples = createMemo(() => [
        {
            key: "default",
            name: "Default",
            readout: () => `value: ${defaultSignal[0]() ?? "undefined"}`,
            component: () => <CountriesExample valueSignal={defaultSignal} />,
            path: `${EXAMPLES_ROOT}/Countries.tsx`,
        },
        {
            key: "preselected",
            name: "Preselected",
            readout: () => `value: ${preselectedSignal[0]() ?? "undefined"} — reopening highlights it`,
            component: () => <CountriesExample valueSignal={preselectedSignal} />,
            path: `${EXAMPLES_ROOT}/Countries.tsx`,
        },
        {
            key: "recordValues",
            name: "Record values",
            readout: () => `value: ${recordSignal[0]()?.code ?? "undefined"}`,
            component: () => <AirportsExample valueSignal={recordSignal} />,
            path: `${EXAMPLES_ROOT}/Airports.tsx`,
        },
        {
            key: "titleDescription",
            name: "Title and description",
            readout: () =>
                `value: ${deliverySignal[0]()?.name ?? "undefined"} — the descriptions wrap, so no two rows are the same height`,
            component: () => <DeliveriesExample valueSignal={deliverySignal} />,
            path: `${EXAMPLES_ROOT}/Deliveries.tsx`,
        },
        {
            key: "optionGroups",
            name: "Option groups",
            readout: () =>
                `value: ${groupedSignal[0]() ?? "undefined"} — arrows cross group boundaries and skip Finland`,
            component: () => (
                <CountriesExample valueSignal={groupedSignal} options={() => GROUPED_COUNTRIES} hasGroups={true} />
            ),
            path: `${EXAMPLES_ROOT}/Countries.tsx`,
        },
        {
            key: "disabledOptions",
            name: "Disabled options",
            readout: () => `value: ${disabledOptionSignal[0]() ?? "undefined"} — arrows skip Denmark and Finland`,
            component: () => (
                <CountriesExample valueSignal={disabledOptionSignal} options={() => COUNTRIES_WITH_DISABLED} />
            ),
            path: `${EXAMPLES_ROOT}/Countries.tsx`,
        },
        {
            key: "disabledOptionsReachable",
            name: "Disabled options + reachable",
            readout: () =>
                `value: ${reachableOptionSignal[0]() ?? "undefined"} — arrows stop on them, hover explains why`,
            component: () => (
                <CountriesExample valueSignal={reachableOptionSignal} options={() => COUNTRIES_WITH_REACHABLE} />
            ),
            path: `${EXAMPLES_ROOT}/Countries.tsx`,
        },
        {
            key: "scrollingList",
            name: "Scrolling list",
            readout: () => `value: ${longSignal[0]() ?? "undefined"} — Home and End reach both ends`,
            component: () => <HoursExample valueSignal={longSignal} />,
            path: `${EXAMPLES_ROOT}/Hours.tsx`,
        },
        {
            key: "virtualized",
            span: 2,
            name: "Virtualized",
            readout: () =>
                `${getStressCount().toLocaleString("en-GB")} options — ${
                    getOpenMs() === undefined
                        ? "never opened"
                        : `${Math.round(getOpenMs()!)} ms from click to the first painted frame`
                }, ${stressVisibility[0]() ? `${getFPS().current.toFixed(0)} fps while open` : "closed"}`,
            component: () => (
                <VirtualizedExample
                    valueSignal={stressSignal}
                    visibilitySignal={stressVisibility}
                    options={getStressDeliveries}
                    count={getStressCount}
                    measureOpen={measureOpen}
                    onCountChange={(count) => {
                        setStressCount(count);
                        setOpenMs(undefined);
                    }}
                />
            ),
            path: `${EXAMPLES_ROOT}/Virtualized.tsx`,
        },
        {
            key: "virtualizedGroups",
            span: 2,
            name: "Virtualized, in groups",
            readout: () =>
                `${getStressCount().toLocaleString("en-GB")} options in ${Math.ceil(getStressCount() / STRESS_GROUP_SIZE).toLocaleString("en-GB")} groups — ${
                    groupedStressVisibility[0]() ? "open" : "closed"
                }`,
            component: () => (
                <VirtualizedExample
                    valueSignal={groupedStressSignal}
                    visibilitySignal={groupedStressVisibility}
                    options={getStressDeliveryGroups}
                    count={getStressCount}
                    measureOpen={(renderOptions) => renderOptions()}
                    onCountChange={(count) => setStressCount(count)}
                />
            ),
            path: `${EXAMPLES_ROOT}/Virtualized.tsx`,
        },
        {
            key: "onDemand",
            name: "Loaded on demand",
            readout: () =>
                `${getPagedRoutes().length} of ${PAGED_TOTAL} routes fetched${
                    getIsFetching() ? ", another batch in flight" : ""
                } — reaching the end asks for ${PAGE_SIZE} more, and the arrows stop at the last one held`,
            component: () => (
                <OnDemandExample
                    valueSignal={pagedSignal}
                    options={getPagedRoutes}
                    hasMore={getHasMoreRoutes}
                    isFetching={getIsFetching}
                    onReachEnd={() => void fetchNextRoutes()}
                />
            ),
            path: `${EXAMPLES_ROOT}/OnDemand.tsx`,
        },
        {
            key: "autocomplete",
            name: "Autocomplete",
            readout: () =>
                `value: ${filterSignal[0]()?.code ?? "undefined"} | query: "${filterQuerySignal[0]()}" — ${getFilteredAirports().length} of ${AIRPORTS.length} shown; the page matches on city or code, which only it knows about`,
            component: () => (
                <AutocompleteExample
                    valueSignal={filterSignal}
                    querySignal={filterQuerySignal}
                    options={getFilteredAirports}
                />
            ),
            path: `${EXAMPLES_ROOT}/Autocomplete.tsx`,
        },
        {
            key: "autocompleteOnDemand",
            name: "Autocomplete, loaded on demand",
            readout: () =>
                `value: ${searchSignal[0]()?.name ?? "undefined"} | query: "${searchQuerySignal[0]()}" — ${getSearchResults().length} of ${getSearchTotal()} matches held${
                    getIsSearching() ? ", asking the server" : ""
                }; typing starts a new search rather than filtering what arrived`,
            component: () => (
                <AutocompleteOnDemandExample
                    valueSignal={searchSignal}
                    querySignal={searchQuerySignal}
                    options={getSearchResults}
                    hasMore={getHasMoreResults}
                    isSearching={getIsSearching}
                    total={getSearchTotal}
                    onReachEnd={() => {
                        if (getIsSearching()) return;

                        void runSearch(getSearchResults().length);
                    }}
                />
            ),
            path: `${EXAMPLES_ROOT}/AutocompleteOnDemand.tsx`,
        },
        {
            key: "multiSelect",
            name: "Multi-select",
            readout: () => `values: [${multiSignal[0]().join(", ")}] — picking keeps the list open`,
            component: () => <MultiSelectCountriesExample valuesSignal={multiSignal} />,
            path: `${EXAMPLES_ROOT}/MultiSelectCountries.tsx`,
        },
        {
            key: "multiSelectGrouped",
            name: "Multi-select, grouped, autocomplete",
            readout: () =>
                `values: [${everythingSignal[0]().join(", ")}] | query: "${everythingQuerySignal[0]()}" — the page drops groups it has emptied`,
            component: () => (
                <MultiSelectGroupedExample
                    valuesSignal={everythingSignal}
                    querySignal={everythingQuerySignal}
                    options={getFilteredGroups}
                />
            ),
            path: `${EXAMPLES_ROOT}/MultiSelectGrouped.tsx`,
        },
        {
            key: "errored",
            name: "Error",
            readout: () => `value: ${erroredSignal[0]() ?? "undefined"} — required, nothing picked yet`,
            component: () => (
                <CountriesExample valueSignal={erroredSignal} hasError={() => erroredSignal[0]() === undefined} />
            ),
            path: `${EXAMPLES_ROOT}/Countries.tsx`,
        },
        {
            key: "disabled",
            name: "Disabled",
            readout: () => `value: ${disabledSignal[0]() ?? "undefined"}`,
            component: () => <CountriesExample valueSignal={disabledSignal} isDisabled={true} />,
            path: `${EXAMPLES_ROOT}/Countries.tsx`,
        },
        {
            key: "reachable",
            name: "Disabled + reachable",
            readout: () => `value: ${reachableSignal[0]() ?? "undefined"}`,
            component: () => <ReachableExample valueSignal={reachableSignal} />,
            path: `${EXAMPLES_ROOT}/Reachable.tsx`,
        },
        {
            key: "label",
            name: "In a Label",
            readout: () => `value: ${labelledSignal[0]() ?? "undefined"} — the caption opens the list`,
            component: () => <LabelledExample valueSignal={labelledSignal} />,
            path: `${EXAMPLES_ROOT}/Labelled.tsx`,
        },
    ]);

    return <PageExamples items={getExamples} />;
};
