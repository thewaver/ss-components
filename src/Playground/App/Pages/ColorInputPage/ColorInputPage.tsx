import { createMemo, createSignal } from "solid-js";

import { ColorInput } from "../../../../Lib/Fundamentals/Input/ColorInput/ColorInput";
import { Label } from "../../../../Lib/Fundamentals/Input/Label/Label";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { pageColorPickerSlots } from "../../StyledComponents/ColorAreaContent/ColorAreaContent";
import { PageColorInputContent } from "../../StyledComponents/ColorInputContent/ColorInputContent";
import { PageLabelCaption } from "../../StyledComponents/LabelCaption/LabelCaption";
import { PageTooltipContent } from "../../StyledComponents/TooltipContent/TooltipContent";

const PALETTE = ["#ff0055", "#00d1b2", "#ffb400", "#7a5cff"];

const toNearestPaletteColor = (value: string) => {
    const channels = (hex: string) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));
    const target = channels(value);

    return PALETTE.reduce((closest, candidate) => {
        const distance = (hex: string) =>
            channels(hex).reduce((sum, channel, index) => sum + (channel - target[index]) ** 2, 0);

        return distance(candidate) < distance(closest) ? candidate : closest;
    }, PALETTE[0]);
};

export const ColorInputPage = () => {
    const defaultSignal = createSignal("#3366ff");
    const compactSignal = createSignal("#3366ff");
    const snappingSignal = createSignal(PALETTE[0]);
    const disabledSignal = createSignal("#888888");
    const reachableSignal = createSignal("#888888");
    const erroredSignal = createSignal("#000000");
    const labelledSignal = createSignal("#ff0055");

    const getVariants = createMemo(() => {
        return [
            {
                key: "default",
                name: "Default",
                readout: () => `value: ${defaultSignal[0]()} — the swatch is the painter's, not the browser's`,
                component: () => (
                    <ColorInput
                        {...pageColorPickerSlots}
                        valueSignal={defaultSignal}
                        getAriaLabel={() => "Brand colour"}
                        renderContent={(getFlags) => <PageColorInputContent getFlags={getFlags} />}
                    />
                ),
            },
            {
                key: "compact",
                name: "Compact",
                readout: () => `value: ${compactSignal[0]()} — swatch only, no hex readout`,
                component: () => (
                    <ColorInput
                        {...pageColorPickerSlots}
                        valueSignal={compactSignal}
                        getAriaLabel={() => "Compact colour"}
                        renderContent={(getFlags) => (
                            <PageColorInputContent getFlags={getFlags} getIsCompact={() => true} />
                        )}
                    />
                ),
            },
            {
                key: "snapping",
                name: "Snapping setter",
                readout: () => `value: ${snappingSignal[0]()} — snapped to the nearest of four`,
                component: () => (
                    <ColorInput
                        {...pageColorPickerSlots}
                        valueSignal={snappingSignal}
                        getAriaLabel={() => "Palette colour"}
                        renderContent={(getFlags) => <PageColorInputContent getFlags={getFlags} />}
                        onInput={(value) => {
                            snappingSignal[1](toNearestPaletteColor(value));
                        }}
                    />
                ),
            },
            {
                key: "disabled",
                name: "Disabled",
                readout: () => `value: ${disabledSignal[0]()}`,
                component: () => (
                    <ColorInput
                        {...pageColorPickerSlots}
                        valueSignal={disabledSignal}
                        getIsDisabled={() => true}
                        getAriaLabel={() => "Disabled colour"}
                        renderContent={(getFlags) => <PageColorInputContent getFlags={getFlags} />}
                    />
                ),
            },
            {
                key: "reachable",
                name: "Disabled + reachable",
                readout: () => `value: ${reachableSignal[0]()}`,
                component: () => (
                    <ColorInput
                        {...pageColorPickerSlots}
                        valueSignal={reachableSignal}
                        getIsDisabled={() => true}
                        getIsReachableWhenDisabled={() => true}
                        getAriaLabel={() => "Disabled but reachable colour"}
                        renderContent={(getFlags) => <PageColorInputContent getFlags={getFlags} />}
                        getTooltipDefs={() => ({
                            getPlacement: () => ({ x: "center", y: "top-out" }),
                            getOffset: () => ({ x: 0, y: 5 }),
                            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                                <PageTooltipContent
                                    getVisibilityTarget={getVisibilityTarget}
                                    getTransitionDurationMs={getTransitionDurationMs}
                                >
                                    Focusable so this tooltip can be read, but the OS picker must not open.
                                </PageTooltipContent>
                            ),
                        })}
                    />
                ),
            },
            {
                key: "errored",
                name: "Error",
                readout: () => `value: ${erroredSignal[0]()} — black is not a brand colour`,
                component: () => (
                    <ColorInput
                        {...pageColorPickerSlots}
                        valueSignal={erroredSignal}
                        getHasError={() => erroredSignal[0]() === "#000000"}
                        getAriaLabel={() => "Validated colour"}
                        renderContent={(getFlags) => <PageColorInputContent getFlags={getFlags} />}
                    />
                ),
            },
            {
                key: "label",
                name: "In a Label",
                readout: () => `value: ${labelledSignal[0]()} — the caption opens the picker`,
                component: () => (
                    <Label getDir={() => "column"} getGap={() => 5}>
                        <PageLabelCaption>Accent</PageLabelCaption>

                        <ColorInput
                            {...pageColorPickerSlots}
                            {...pageColorPickerSlots}
                            valueSignal={labelledSignal}
                            renderContent={(getFlags) => <PageColorInputContent getFlags={getFlags} />}
                        />
                    </Label>
                ),
            },
        ];
    });

    return <PageVariants getItems={getVariants} />;
};
