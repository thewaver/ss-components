import type { JSX } from "solid-js";
import { createMemo, createSignal } from "solid-js";

import type { AnchorPlacement } from "../../../../Lib/Abstracts/Anchor/Anchor.types";
import { Viewport } from "../../../../Lib/Exotics/Viewport/Viewport";
import { useViewportContext } from "../../../../Lib/Exotics/Viewport/Viewport.context";
import { Range } from "../../../../Lib/Fundamentals/Input/Range/Range";
import { Select } from "../../../../Lib/Fundamentals/Input/Select/Select";
import type { SelectOption } from "../../../../Lib/Fundamentals/Input/Select/Select.types";
import { PagePopoverSurface } from "../../StyledComponents/PopoverSurface/PopoverSurface";
import { PageRangeContent } from "../../StyledComponents/RangeContent/RangeContent";
import { PageSelectContent } from "../../StyledComponents/SelectContent/SelectContent";
import { PageSelectOptionContent } from "../../StyledComponents/SelectOptionContent/SelectOptionContent";
import { PageTooltipContent } from "../../StyledComponents/TooltipContent/TooltipContent";

import { RANGE_THUMB_SIZE } from "../../StyledComponents/RangeContent/RangeContent.css";
import * as styles from "./ViewportPage.css";

const COUNTRIES: SelectOption<string>[] = [
    { value: "Belgium" },
    { value: "Denmark" },
    { value: "Estonia" },
    { value: "Finland" },
    { value: "Germany" },
    { value: "Iceland" },
    { value: "Ireland" },
    { value: "Latvia" },
    { value: "Norway" },
    { value: "Poland" },
    { value: "Portugal" },
    { value: "Sweden" },
];

const SCALE_MIN = 50;
const SCALE_MAX = 200;
const SCALE_STEP = 10;
const PERCENT = 100;

const SCROLL_SIZE = { width: styles.HOST_SIZE, height: styles.HOST_SIZE };

const renderTooltip = (text: string) => ({
    getPlacement: () => ({ x: "center", y: "top-out" }) as const,
    getOffset: () => ({ x: 0, y: 5 }),
    renderContent: (getVisibilityTarget: () => 0 | 1, getTransitionDurationMs: () => number) => (
        <PageTooltipContent getVisibilityTarget={getVisibilityTarget} getTransitionDurationMs={getTransitionDurationMs}>
            {text}
        </PageTooltipContent>
    ),
});

const renderCountryPopup = (
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

const ViewportReadout = () => {
    const context = useViewportContext();

    return (
        <div class={[styles.readout, styles.cornerReadout].join(" ")} data-inner-readout>
            {`${context.getScale().toFixed(2)}× of ${Math.round(context.getSize().width)}×${Math.round(context.getSize().height)}`}
        </div>
    );
};

export const ViewportPage = () => {
    const [getRoamerX, setRoamerX] = createSignal(50);
    const [getRoamerY, setRoamerY] = createSignal(50);
    const [getScalePercent, setScalePercent] = createSignal(PERCENT);
    const [getRoamingValue, setRoamingValue] = createSignal<string | undefined>();
    const [getScrolledValue, setScrolledValue] = createSignal<string | undefined>();

    /** The element is a fixed square, so asking for a bigger scale is asking for a smaller design to fill it. */
    const getStageSize = createMemo(() => {
        const side = Math.round((styles.HOST_SIZE * PERCENT) / getScalePercent());

        return { width: side, height: side };
    });

    return (
        <div class={styles.root}>
            <section class={styles.section} data-variant="A control roaming the viewport">
                <div class={styles.sectionTitle}>A control roaming the viewport</div>

                <div>
                    The dashed square is a viewport of its own, so it is the boundary that counts. Park the control
                    against any edge of it: its tooltip and its list turn around rather than cross that edge, keep the
                    side of the control they are on, and are cut by the square when there is not enough room. The scale
                    slider changes the resolution the square is designed for, so everything inside it grows or shrinks
                    while the boundary stays where it is.
                </div>

                <div class={styles.controls}>
                    <div>Across</div>
                    <Range
                        valueSignal={[getRoamerX, setRoamerX]}
                        getAriaLabel={() => "Horizontal position"}
                        getThumbSize={() => RANGE_THUMB_SIZE}
                        renderContent={(getFlags) => <PageRangeContent getFlags={getFlags} />}
                    />

                    <div>Down</div>
                    <Range
                        valueSignal={[getRoamerY, setRoamerY]}
                        getAriaLabel={() => "Vertical position"}
                        getThumbSize={() => RANGE_THUMB_SIZE}
                        renderContent={(getFlags) => <PageRangeContent getFlags={getFlags} />}
                    />

                    <div>Scale</div>
                    <Range
                        valueSignal={[getScalePercent, setScalePercent]}
                        getAriaLabel={() => "Viewport scale"}
                        getMin={() => SCALE_MIN}
                        getMax={() => SCALE_MAX}
                        getStep={() => SCALE_STEP}
                        getThumbSize={() => RANGE_THUMB_SIZE}
                        renderContent={(getFlags) => <PageRangeContent getFlags={getFlags} />}
                    />
                </div>

                <div class={styles.readout} data-readout>
                    {`x: ${getRoamerX()}% | y: ${getRoamerY()}% | scale: ${getScalePercent()}% of ${styles.HOST_SIZE}px`}
                </div>

                <div class={styles.host} data-stage>
                    <Viewport getSize={getStageSize}>
                        <div
                            class={styles.roamer}
                            style={{
                                left: `${getRoamerX()}%`,
                                top: `${getRoamerY()}%`,
                                transform: `translate(-${getRoamerX()}%, -${getRoamerY()}%)`,
                            }}
                        >
                            <Select
                                valueSignal={[getRoamingValue, setRoamingValue]}
                                getOptions={() => COUNTRIES}
                                getAriaLabel={() => "Roaming country"}
                                getTooltipDefs={() => renderTooltip("My tooltip has the same boundary I do.")}
                                renderContent={(getSelectedOption, getFlags) => (
                                    <PageSelectContent getFlags={getFlags}>
                                        {getSelectedOption()?.value ?? "Pick one"}
                                    </PageSelectContent>
                                )}
                                renderOption={(getOption, getFlags) => (
                                    <PageSelectOptionContent getFlags={getFlags}>
                                        {getOption().value}
                                    </PageSelectOptionContent>
                                )}
                                renderPopup={renderCountryPopup}
                            />
                        </div>

                        <ViewportReadout />
                    </Viewport>
                </div>
            </section>

            <section class={styles.section} data-variant="An anchor inside a scrolled box">
                <div class={styles.sectionTitle}>An anchor inside a scrolled box</div>

                <div>
                    A viewport of the same size with a scrolling area inside it. Scrolling moves the anchor without
                    moving the page, so an open list has to follow it, stay off it, and stop at the square.
                </div>

                <div class={styles.host}>
                    <Viewport getSize={() => SCROLL_SIZE}>
                        <div class={styles.scrollBox} data-scroll-box>
                            <div class={styles.scrollFiller} />

                            <Select
                                valueSignal={[getScrolledValue, setScrolledValue]}
                                getOptions={() => COUNTRIES}
                                getAriaLabel={() => "Scrolled country"}
                                renderContent={(getSelectedOption, getFlags) => (
                                    <PageSelectContent getFlags={getFlags}>
                                        {getSelectedOption()?.value ?? "Pick one"}
                                    </PageSelectContent>
                                )}
                                renderOption={(getOption, getFlags) => (
                                    <PageSelectOptionContent getFlags={getFlags}>
                                        {getOption().value}
                                    </PageSelectOptionContent>
                                )}
                                renderPopup={renderCountryPopup}
                            />

                            <div class={styles.scrollFiller} />
                        </div>
                    </Viewport>
                </div>
            </section>
        </div>
    );
};
