import { For, createMemo, createSignal } from "solid-js";

import { Corners } from "../../../../Lib/Fundamentals/Corners/Corners";
import { Radio } from "../../../../Lib/Fundamentals/Input/Radio/Radio";
import { RadioGroup } from "../../../../Lib/Fundamentals/Input/RadioGroup/RadioGroup";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageRadioContent } from "../../StyledComponents/RadioContent/RadioContent";
import {
    PageRadioSegmentContent,
    PageRadioSegmentFloater,
    PageRadioSegmentGroup,
} from "../../StyledComponents/RadioSegmentContent/RadioSegmentContent";
import { PageRadioStarContent } from "../../StyledComponents/RadioStarContent/RadioStarContent";
import { PageTooltipContent } from "../../StyledComponents/TooltipContent/TooltipContent";

type SizeValue = "small" | "medium" | "large";

const SIZE_OPTIONS: { value: SizeValue; label: string }[] = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
];

const RATING_OPTIONS = [1, 2, 3, 4, 5];

const RADIO_GROUP_GAP = 10;

export const RadioPage = () => {
    const defaultSignal = createSignal<SizeValue | undefined>(undefined);
    const segmentedSignal = createSignal<SizeValue>("medium");
    const ratingSignal = createSignal(3);
    const hoveredRatingSignal = createSignal<number | undefined>(undefined);
    const decoratedSignal = createSignal<SizeValue>("medium");
    const disabledSignal = createSignal<SizeValue>("small");
    const reachableSignal = createSignal<SizeValue>("small");
    const erroredSignal = createSignal<SizeValue | undefined>(undefined);

    const getVariants = createMemo(() => {
        return [
            {
                key: "default",
                name: "Default",
                readout: () => `value: ${defaultSignal[0]()}`,
                component: () => (
                    <RadioGroup
                        valueSignal={defaultSignal}
                        getAriaLabel={() => "Default size"}
                        getGap={() => RADIO_GROUP_GAP}
                    >
                        <For each={SIZE_OPTIONS}>
                            {(option) => (
                                <Radio
                                    getValue={() => option.value}
                                    getAriaLabel={() => option.label}
                                    renderContent={(getFlags) => (
                                        <PageRadioContent getFlags={getFlags}>{option.label}</PageRadioContent>
                                    )}
                                />
                            )}
                        </For>
                    </RadioGroup>
                ),
            },
            {
                key: "segmented",
                name: "Segmented",
                readout: () => `value: ${segmentedSignal[0]()}`,
                component: () => (
                    <PageRadioSegmentGroup>
                        <RadioGroup
                            valueSignal={segmentedSignal}
                            getAriaLabel={() => "Segmented size"}
                            getDir={() => "row"}
                            getGap={() => 0}
                            renderFloater={(getVisibilityTarget, getTransitionDurationMs) => (
                                <PageRadioSegmentFloater
                                    getVisibilityTarget={getVisibilityTarget}
                                    getTransitionDurationMs={getTransitionDurationMs}
                                />
                            )}
                        >
                            <For each={SIZE_OPTIONS}>
                                {(option) => (
                                    <Radio
                                        getValue={() => option.value}
                                        getAriaLabel={() => option.label}
                                        renderContent={(getFlags) => (
                                            <PageRadioSegmentContent getFlags={getFlags}>
                                                {option.label}
                                            </PageRadioSegmentContent>
                                        )}
                                    />
                                )}
                            </For>
                        </RadioGroup>
                    </PageRadioSegmentGroup>
                ),
            },
            {
                key: "rating",
                name: "Rating",
                readout: () => `value: ${ratingSignal[0]()}`,
                component: () => (
                    <RadioGroup
                        valueSignal={ratingSignal}
                        getAriaLabel={() => "Rating"}
                        getDir={() => "row"}
                        getGap={() => 0}
                    >
                        <For each={RATING_OPTIONS}>
                            {(rating) => (
                                <Radio
                                    getValue={() => rating}
                                    getAriaLabel={() => (rating === 1 ? "1 star" : `${rating} stars`)}
                                    onMouseEnter={() => {
                                        hoveredRatingSignal[1](rating);
                                    }}
                                    onMouseLeave={() => {
                                        hoveredRatingSignal[1](undefined);
                                    }}
                                    renderContent={(getFlags) => (
                                        <PageRadioStarContent
                                            getFlags={getFlags}
                                            getIsFilled={() =>
                                                rating <= (hoveredRatingSignal[0]() ?? ratingSignal[0]())
                                            }
                                        />
                                    )}
                                />
                            )}
                        </For>
                    </RadioGroup>
                ),
            },
            {
                key: "decorated",
                name: "Decorated",
                readout: () => `value: ${decoratedSignal[0]()}`,
                component: () => (
                    <RadioGroup
                        valueSignal={decoratedSignal}
                        getAriaLabel={() => "Decorated size"}
                        getGap={() => RADIO_GROUP_GAP}
                    >
                        <For each={SIZE_OPTIONS}>
                            {(option) => (
                                <Radio
                                    getValue={() => option.value}
                                    getAriaLabel={() => option.label}
                                    renderContent={(getFlags) => (
                                        <PageRadioContent getFlags={getFlags}>{option.label}</PageRadioContent>
                                    )}
                                    renderDecoration={(getFlags) => (
                                        <Corners
                                            getColor={() =>
                                                getFlags().checkedState === true ? "yellow" : "transparent"
                                            }
                                            getCornerLength={() => ({ width: 8, height: 8 })}
                                            getStrokeThickness={() => 2}
                                        />
                                    )}
                                />
                            )}
                        </For>
                    </RadioGroup>
                ),
            },
            {
                key: "disabled",
                name: "Disabled",
                readout: () => `value: ${disabledSignal[0]()}`,
                component: () => (
                    <RadioGroup
                        valueSignal={disabledSignal}
                        getAriaLabel={() => "Disabled size"}
                        getGap={() => RADIO_GROUP_GAP}
                    >
                        <For each={SIZE_OPTIONS}>
                            {(option) => (
                                <Radio
                                    getValue={() => option.value}
                                    getAriaLabel={() => option.label}
                                    getIsDisabled={() => true}
                                    renderContent={(getFlags) => (
                                        <PageRadioContent getFlags={getFlags}>{option.label}</PageRadioContent>
                                    )}
                                />
                            )}
                        </For>
                    </RadioGroup>
                ),
            },
            {
                key: "reachable",
                name: "Disabled + reachable",
                readout: () => `value: ${reachableSignal[0]()}`,
                component: () => (
                    <RadioGroup
                        valueSignal={reachableSignal}
                        getAriaLabel={() => "Partly disabled size"}
                        getGap={() => RADIO_GROUP_GAP}
                    >
                        <For each={SIZE_OPTIONS}>
                            {(option) => (
                                <Radio
                                    getValue={() => option.value}
                                    getAriaLabel={() => option.label}
                                    getIsDisabled={() => option.value === "medium"}
                                    getIsReachableWhenDisabled={() => option.value === "medium"}
                                    renderContent={(getFlags) => (
                                        <PageRadioContent getFlags={getFlags}>{option.label}</PageRadioContent>
                                    )}
                                    getTooltipDefs={
                                        option.value === "medium"
                                            ? () => ({
                                                  getPlacement: () => ({ x: "center", y: "top-out" }),
                                                  getOffset: () => ({ x: 0, y: 5 }),
                                                  renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                                                      <PageTooltipContent
                                                          getVisibilityTarget={getVisibilityTarget}
                                                          getTransitionDurationMs={getTransitionDurationMs}
                                                      >
                                                          Arrow keys still land here so this tooltip can be read, but
                                                          they must not select it and clicking must leave the value
                                                          alone.
                                                      </PageTooltipContent>
                                                  ),
                                              })
                                            : undefined
                                    }
                                />
                            )}
                        </For>
                    </RadioGroup>
                ),
            },
            {
                key: "errored",
                name: "Error",
                readout: () => `value: ${erroredSignal[0]()}`,
                component: () => (
                    <RadioGroup
                        valueSignal={erroredSignal}
                        getAriaLabel={() => "Required size"}
                        getGap={() => RADIO_GROUP_GAP}
                        getHasError={() => erroredSignal[0]() === undefined}
                    >
                        <For each={SIZE_OPTIONS}>
                            {(option) => (
                                <Radio
                                    getValue={() => option.value}
                                    getAriaLabel={() => option.label}
                                    getHasError={() => erroredSignal[0]() === undefined}
                                    renderContent={(getFlags) => (
                                        <PageRadioContent getFlags={getFlags}>{option.label}</PageRadioContent>
                                    )}
                                />
                            )}
                        </For>
                    </RadioGroup>
                ),
            },
        ];
    });

    return <PageVariants getItems={getVariants} />;
};
