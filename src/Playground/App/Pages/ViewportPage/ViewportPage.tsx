import type { JSX } from "solid-js";
import { createMemo, createSignal, createUniqueId } from "solid-js";

import type { AnchorPlacement } from "../../../../Lib/Abstracts/Anchor/Anchor.types";
import { Viewport } from "../../../../Lib/Exotics/Viewport/Viewport";
import { useViewportContext } from "../../../../Lib/Exotics/Viewport/Viewport.context";
import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Range } from "../../../../Lib/Fundamentals/Input/Range/Range";
import { Select } from "../../../../Lib/Fundamentals/Input/Select/Select";
import type { SelectOption } from "../../../../Lib/Fundamentals/Input/Select/Select.types";
import { Toasts } from "../../../../Lib/Fundamentals/Toasts/Toasts";
import type { Toast } from "../../../../Lib/Fundamentals/Toasts/Toasts.types";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import { PagePopoverSurface } from "../../StyledComponents/PopoverSurface/PopoverSurface";
import { PageRangeContent } from "../../StyledComponents/RangeContent/RangeContent";
import { PageSelectContent } from "../../StyledComponents/SelectContent/SelectContent";
import { PageSelectOptionContent } from "../../StyledComponents/SelectOptionContent/SelectOptionContent";
import { PageToastContent } from "../../StyledComponents/ToastContent/ToastContent";
import type { ToastDefs } from "../../StyledComponents/ToastContent/ToastContent.types";
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
const INNER_TOAST_MARGIN = 10;
const INNER_TOAST_MESSAGE = "Raised inside the square.";

const renderTooltip = (text: string) => ({
    placement: () => ({ x: "center", y: "top-out" }) as const,
    offset: () => ({ x: 0, y: 5 }),
    renderContent: (getVisibilityTarget: () => 0 | 1, getTransitionDurationMs: () => number) => (
        <PageTooltipContent visibilityTarget={getVisibilityTarget} transitionDurationMs={getTransitionDurationMs}>
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
        visibilityTarget={getVisibilityTarget}
        transitionDurationMs={getTransitionDurationMs}
        placement={getPlacement}
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
    const innerToasts = createSignal<Toast<ToastDefs>[]>([]);
    const [getScrolledValue, setScrolledValue] = createSignal<string | undefined>();

    const getStageSize = createMemo(() => {
        const side = Math.round((styles.HOST_SIZE * PERCENT) / getScalePercent());

        return { width: side, height: side };
    });

    return (
        <div class={styles.root}>
            <section class={styles.section} data-variant data-testid="roaming">
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
                        id={"roamerX"}
                        ariaLabel={"Horizontal position"}
                        thumbSize={() => RANGE_THUMB_SIZE}
                        renderContent={(getFlags) => <PageRangeContent flags={getFlags} />}
                    />

                    <div>Down</div>
                    <Range
                        valueSignal={[getRoamerY, setRoamerY]}
                        id={"roamerY"}
                        ariaLabel={"Vertical position"}
                        thumbSize={() => RANGE_THUMB_SIZE}
                        renderContent={(getFlags) => <PageRangeContent flags={getFlags} />}
                    />

                    <div>Scale</div>
                    <Range
                        valueSignal={[getScalePercent, setScalePercent]}
                        id={"viewportScale"}
                        ariaLabel={"Viewport scale"}
                        min={() => SCALE_MIN}
                        max={() => SCALE_MAX}
                        step={() => SCALE_STEP}
                        thumbSize={() => RANGE_THUMB_SIZE}
                        renderContent={(getFlags) => <PageRangeContent flags={getFlags} />}
                    />
                </div>

                <div class={styles.readout} data-readout>
                    {`x: ${getRoamerX()}% | y: ${getRoamerY()}% | scale: ${getScalePercent()}% of ${styles.HOST_SIZE}px`}
                </div>

                <div class={styles.host} data-stage>
                    <Viewport size={getStageSize}>
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
                                options={() => COUNTRIES}
                                id={"roamingCountry"}
                                ariaLabel={"Roaming country"}
                                tooltipDefs={() => renderTooltip("My tooltip has the same boundary I do.")}
                                renderContent={(getSelectedOption, getFlags) => (
                                    <PageSelectContent flags={getFlags}>
                                        {getSelectedOption()?.value ?? "Pick one"}
                                    </PageSelectContent>
                                )}
                                renderOption={(getOption, getFlags) => (
                                    <PageSelectOptionContent flags={getFlags}>
                                        {getOption().value}
                                    </PageSelectOptionContent>
                                )}
                                renderPopup={renderCountryPopup}
                            />
                        </div>

                        <div class={styles.toastRaiser}>
                            <Button
                                id={"raiseInnerToast"}
                                ariaLabel={"Raise a notification inside the viewport"}
                                renderContent={(getFlags) => (
                                    <PageButtonContent flags={getFlags}>Notify</PageButtonContent>
                                )}
                                onClick={() => {
                                    innerToasts[1]((prev) => [
                                        ...prev,
                                        { id: createUniqueId(), value: { kind: "info", message: INNER_TOAST_MESSAGE } },
                                    ]);
                                }}
                            />
                        </div>

                        <Toasts
                            toastsSignal={innerToasts}
                            ariaLabel={"Viewport notifications"}
                            alignment={"bottom-center"}
                            margins={() => ({
                                marginTop: INNER_TOAST_MARGIN,
                                marginRight: INNER_TOAST_MARGIN,
                                marginBottom: INNER_TOAST_MARGIN,
                                marginLeft: INNER_TOAST_MARGIN,
                            })}
                            renderToast={(getToast, getVisibilityTarget, getTransitionDurationMs, getState) => (
                                <PageToastContent
                                    toast={getToast}
                                    state={getState}
                                    animation={"fade"}
                                    visibilityTarget={getVisibilityTarget}
                                    transitionDurationMs={getTransitionDurationMs}
                                    onDismiss={() => {
                                        innerToasts[1]((prev) => prev.filter((toast) => toast.id !== getToast().id));
                                    }}
                                />
                            )}
                        />

                        <ViewportReadout />
                    </Viewport>
                </div>
            </section>

            <section class={styles.section} data-variant data-testid="scrolled">
                <div class={styles.sectionTitle}>An anchor inside a scrolled box</div>

                <div>
                    A viewport of the same size with a scrolling area inside it. Scrolling moves the anchor without
                    moving the page, so an open list has to follow it, stay off it, and stop at the square.
                </div>

                <div class={styles.host}>
                    <Viewport size={() => SCROLL_SIZE}>
                        <div class={styles.scrollBox} data-scroll-box>
                            <div class={styles.scrollFiller} />

                            <Select
                                valueSignal={[getScrolledValue, setScrolledValue]}
                                options={() => COUNTRIES}
                                id={"scrolledCountry"}
                                ariaLabel={"Scrolled country"}
                                renderContent={(getSelectedOption, getFlags) => (
                                    <PageSelectContent flags={getFlags}>
                                        {getSelectedOption()?.value ?? "Pick one"}
                                    </PageSelectContent>
                                )}
                                renderOption={(getOption, getFlags) => (
                                    <PageSelectOptionContent flags={getFlags}>
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
