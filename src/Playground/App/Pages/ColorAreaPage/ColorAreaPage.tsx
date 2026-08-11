import { createEffect, createMemo, createSignal, createUniqueId, onCleanup, untrack } from "solid-js";

import type { ColorValueHsv } from "../../../../Lib/Abstracts/ColorValue/ColorValue.types";
import { ColorValueUtils } from "../../../../Lib/Abstracts/ColorValue/ColorValue.utils";
import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { ColorArea } from "../../../../Lib/Fundamentals/Input/ColorArea/ColorArea";
import { Range } from "../../../../Lib/Fundamentals/Input/Range/Range";
import { Popover } from "../../../../Lib/Fundamentals/Popover/Popover";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import {
    PageColorAreaContent,
    PageColorFieldTrigger,
    PageColorPickerPopup,
    PageColorPickerRow,
    PageColorPreview,
    PageColorSwatch,
    PageHueSlider,
} from "../../StyledComponents/ColorAreaContent/ColorAreaContent";
import { PageColorChannels } from "../../StyledComponents/ColorChannels/ColorChannels";

const AREA_SIZE = 160;
const HUE_THUMB_SIZE = 18;
const HUE_MAX = 360;
const PERCENT = 100;
const STARTING_HSV: ColorValueHsv = { h: 210, s: 0.7, v: 0.9 };

export const ColorAreaPage = () => {
    const popupId = createUniqueId();

    const bareSignal = createSignal<ColorValueHsv>(STARTING_HSV);
    const pickerSignal = createSignal<ColorValueHsv>({ h: 90, s: 0.5, v: 0.8 });
    const disabledSignal = createSignal<ColorValueHsv>({ h: 0, s: 0.6, v: 0.6 });

    const [getIsOpen, setIsOpen] = createSignal(false);
    const [getTriggerRef, setTriggerRef] = createSignal<HTMLElement>();

    createEffect(() => {
        if (!getIsOpen()) return;

        const handlePointerDown = (e: PointerEvent) => {
            const target = e.target as Node | null;

            if (!target) return;
            if (document.getElementById(popupId)?.contains(target)) return;
            if (getTriggerRef()?.contains(target)) return;

            setIsOpen(false);
        };

        document.addEventListener("pointerdown", handlePointerDown);

        onCleanup(() => {
            document.removeEventListener("pointerdown", handlePointerDown);
        });
    });

    const getHexa = () => ColorValueUtils.toHexa(ColorValueUtils.hsvToRgba(pickerSignal[0]()));

    const hueSignal = createSignal(pickerSignal[0]().h);

    createEffect(() => {
        const hue = pickerSignal[0]().h;

        if (untrack(hueSignal[0]) === hue) return;

        hueSignal[1](hue);
    });

    createEffect(() => {
        const hue = hueSignal[0]();

        if (untrack(() => pickerSignal[0]().h) === hue) return;

        pickerSignal[1]((prev) => ({ ...prev, h: hue }));
    });

    const renderArea = (signal: typeof bareSignal, isDisabled?: boolean) => (
        <ColorArea
            hsvSignal={signal}
            getSizing={() => "fill"}
            getIsDisabled={() => isDisabled ?? false}
            getAriaLabel={() => "Saturation and brightness"}
            renderContent={(getFlags) => <PageColorAreaContent getFlags={getFlags} getSize={() => AREA_SIZE} />}
        />
    );

    const getVariants = createMemo(() => {
        return [
            {
                name: "The surface alone",
                readout: () =>
                    `hsv: ${Math.round(bareSignal[0]().h)}° ${Math.round(bareSignal[0]().s * PERCENT)}% ${Math.round(bareSignal[0]().v * PERCENT)}% — hex: ${ColorValueUtils.hsvToHex(bareSignal[0]())}`,
                component: () => renderArea(bareSignal),
            },
            {
                name: "In a dropdown, replacing the OS dialog",
                readout: () => `${getHexa()} — open: ${getIsOpen()}`,
                component: () => (
                    <>
                        <Button
                            ref={setTriggerRef}
                            renderContent={(getFlags) => (
                                <PageColorFieldTrigger getFlags={getFlags}>
                                    <PageColorSwatch getValue={() => ColorValueUtils.toCssColor(pickerSignal[0]())} />
                                    {getHexa()}
                                </PageColorFieldTrigger>
                            )}
                            onClick={() => {
                                setIsOpen((prev) => !prev);
                            }}
                        />

                        <Popover
                            getId={() => popupId}
                            getRole={() => "dialog"}
                            getAriaAttributes={() => ({ "aria-label": "Choose a colour" })}
                            getIsOpen={getIsOpen}
                            getAnchorRef={getTriggerRef}
                            getHasAutoFocus={() => true}
                            getOffset={() => ({ x: 0, y: 5 })}
                            onKeyDown={(e) => {
                                if (e.key !== "Escape") return;

                                setIsOpen(false);
                                getTriggerRef()?.focus();
                            }}
                            renderContent={() => (
                                <PageColorPickerPopup>
                                    <PageColorPreview getValue={() => ColorValueUtils.toCssColor(pickerSignal[0]())} />

                                    {renderArea(pickerSignal)}

                                    <PageColorPickerRow>
                                        <Range
                                            valueSignal={hueSignal}
                                            getSizing={() => "fill"}
                                            getMax={() => HUE_MAX}
                                            getStep={() => 1}
                                            getAriaLabel={() => "Hue"}
                                            getThumbSize={() => HUE_THUMB_SIZE}
                                            renderContent={(getFlags) => <PageHueSlider getFlags={getFlags} />}
                                        />
                                    </PageColorPickerRow>

                                    <PageColorChannels hsvSignal={pickerSignal} />
                                </PageColorPickerPopup>
                            )}
                        />
                    </>
                ),
            },
            {
                name: "Disabled",
                readout: () => "the drag is not attached at all, so nothing moves",
                component: () => renderArea(disabledSignal, true),
            },
        ];
    });

    return <PageVariants getItems={getVariants} />;
};
