import { createMemo, createSignal } from "solid-js";

import { Range } from "../../../../Lib/Fundamentals/Input/Range/Range";
import type { RangeValues } from "../../../../Lib/Fundamentals/Input/Range/Range.types";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageRangeContent } from "../../StyledComponents/RangeContent/RangeContent";
import { PageTooltipContent } from "../../StyledComponents/TooltipContent/TooltipContent";

import { RANGE_THUMB_SIZE } from "../../StyledComponents/RangeContent/RangeContent.css";
import * as pageStyles from "../Pages.css";

const VERTICAL_LENGTH = 160;

export const RangePage = () => {
    const [getVolume, setVolume] = createSignal(40);
    const [getSteps, setSteps] = createSignal(3);
    const [getVertical, setVertical] = createSignal(60);
    const [getDisabled, setDisabled] = createSignal(25);
    const [getReachable, setReachable] = createSignal(75);
    const [getErrored, setErrored] = createSignal(90);

    const priceSignal = createSignal<RangeValues>({ start: 20, end: 80 });
    const verticalPairSignal = createSignal<RangeValues>({ start: 30, end: 70 });

    const getVariants = createMemo(() => {
        return [
            {
                name: "Default",
                readout: () => `value: ${getVolume()}`,
                component: () => (
                    <Range
                        valueSignal={[getVolume, setVolume]}
                        getAriaLabel={() => "Volume"}
                        getThumbSize={() => RANGE_THUMB_SIZE}
                        renderContent={(getFlags) => <PageRangeContent getFlags={getFlags} />}
                    />
                ),
            },
            {
                name: "Stepped",
                readout: () => `value: ${getSteps()} of 5`,
                component: () => (
                    <Range
                        valueSignal={[getSteps, setSteps]}
                        getAriaLabel={() => "Difficulty"}
                        getMin={() => 1}
                        getMax={() => 5}
                        getStep={() => 1}
                        getThumbSize={() => RANGE_THUMB_SIZE}
                        renderContent={(getFlags) => <PageRangeContent getFlags={getFlags} />}
                    />
                ),
            },
            {
                name: "Pair",
                readout: () => `start: ${priceSignal[0]().start} | end: ${priceSignal[0]().end}`,
                component: () => (
                    <Range
                        rangeSignal={priceSignal}
                        getAriaLabel={() => "Price range"}
                        getThumbLabels={() => ["Lowest price", "Highest price"]}
                        getThumbSize={() => RANGE_THUMB_SIZE}
                        renderContent={(getFlags) => <PageRangeContent getFlags={getFlags} />}
                    />
                ),
            },
            {
                name: "Vertical",
                readout: () =>
                    `single: ${getVertical()} | pair: ${verticalPairSignal[0]().start}–${verticalPairSignal[0]().end}`,
                component: () => (
                    <div class={pageStyles.controlRow}>
                        <Range
                            valueSignal={[getVertical, setVertical]}
                            getAriaLabel={() => "Vertical volume"}
                            getOrientation={() => "vertical"}
                            getThumbSize={() => RANGE_THUMB_SIZE}
                            renderContent={(getFlags) => (
                                <PageRangeContent getFlags={getFlags} getLength={() => VERTICAL_LENGTH} />
                            )}
                        />

                        <div class={pageStyles.controlRowLabel}>and a pair</div>

                        <Range
                            rangeSignal={verticalPairSignal}
                            getAriaLabel={() => "Vertical band"}
                            getThumbLabels={() => ["Band floor", "Band ceiling"]}
                            getOrientation={() => "vertical"}
                            getThumbSize={() => RANGE_THUMB_SIZE}
                            renderContent={(getFlags) => (
                                <PageRangeContent getFlags={getFlags} getLength={() => VERTICAL_LENGTH} />
                            )}
                        />
                    </div>
                ),
            },
            {
                name: "Disabled",
                readout: () => `value: ${getDisabled()}`,
                component: () => (
                    <Range
                        valueSignal={[getDisabled, setDisabled]}
                        getAriaLabel={() => "Disabled range"}
                        getIsDisabled={() => true}
                        getThumbSize={() => RANGE_THUMB_SIZE}
                        renderContent={(getFlags) => <PageRangeContent getFlags={getFlags} />}
                    />
                ),
            },
            {
                name: "Disabled + reachable",
                readout: () => `value: ${getReachable()}`,
                component: () => (
                    <Range
                        valueSignal={[getReachable, setReachable]}
                        getAriaLabel={() => "Disabled but reachable range"}
                        getIsDisabled={() => true}
                        getIsReachableWhenDisabled={() => true}
                        getThumbSize={() => RANGE_THUMB_SIZE}
                        renderContent={(getFlags) => <PageRangeContent getFlags={getFlags} />}
                        getTooltipDefs={() => ({
                            getPlacement: () => ({ x: "center", y: "top-out" }),
                            getOffset: () => ({ x: 0, y: 5 }),
                            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                                <PageTooltipContent
                                    getVisibilityTarget={getVisibilityTarget}
                                    getTransitionDurationMs={getTransitionDurationMs}
                                >
                                    Focusable so this tooltip can be read, but arrow keys and dragging must leave the
                                    value where it is.
                                </PageTooltipContent>
                            ),
                        })}
                    />
                ),
            },
            {
                name: "Error",
                readout: () => `value: ${getErrored()}`,
                component: () => (
                    <Range
                        valueSignal={[getErrored, setErrored]}
                        getAriaLabel={() => "Errored range"}
                        getHasError={() => getErrored() > 80}
                        getThumbSize={() => RANGE_THUMB_SIZE}
                        renderContent={(getFlags) => <PageRangeContent getFlags={getFlags} />}
                    />
                ),
            },
        ];
    });

    return <PageVariants getItems={getVariants} />;
};
