import type { JSX } from "solid-js";
import { createMemo, createSignal } from "solid-js";

import type { AnchorPlacement } from "../../../../Lib/Abstracts/Anchor/Anchor.types";
import { Label } from "../../../../Lib/Fundamentals/Input/Label/Label";
import { MultiSelect } from "../../../../Lib/Fundamentals/Input/MultiSelect/MultiSelect";
import { Select } from "../../../../Lib/Fundamentals/Input/Select/Select";
import type { SelectItem, SelectOption } from "../../../../Lib/Fundamentals/Input/Select/Select.types";
import { SelectUtils } from "../../../../Lib/Fundamentals/Input/Select/Select.utils";
import { PageVariants } from "../../PageComponents/Variants/Variants";
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
    >
        {renderOptions()}
    </PagePopoverSurface>
);

export const SelectPage = () => {
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
    const recordSignal = createSignal<Airport | undefined>();
    const erroredSignal = createSignal<string | undefined>();
    const disabledSignal = createSignal<string | undefined>("Sweden");
    const reachableSignal = createSignal<string | undefined>("Sweden");
    const labelledSignal = createSignal<string | undefined>();

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

    return <PageVariants getItems={getVariants} />;
};
