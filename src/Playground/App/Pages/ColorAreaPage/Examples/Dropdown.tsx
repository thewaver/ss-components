import { createEffect, createSignal, onCleanup, untrack } from "solid-js";

import { Color } from "@thewaver/ss-utils";

import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { Range } from "../../../../../Lib/Fundamentals/Input/Range/Range";
import { Popover } from "../../../../../Lib/Fundamentals/Popover/Popover";
import {
    PageColorFieldTrigger,
    PageColorPickerPopup,
    PageColorPickerRow,
    PageColorPreview,
    PageColorSwatch,
    PageHueSlider,
} from "../../../StyledComponents/ColorAreaContent/ColorAreaContent";
import { PageColorChannels } from "../../../StyledComponents/ColorChannels/ColorChannels";
import type { ColorAreaDropdownExampleProps } from "../ColorAreaPage.types";
import { SurfaceExample } from "./Surface";

const HUE_THUMB_SIZE = 18;
const HUE_MAX = 360;

type Props = ColorAreaDropdownExampleProps;

export const DropdownExample = (props: Props) => {
    const [getTriggerRef, setTriggerRef] = createSignal<HTMLElement>();

    const [getIsOpen, setIsOpen] = props.isOpenSignal;

    const getCss = () => Color.RGBA.toCss(Color.HSVA.toRgba(props.hsvSignal[0]()));

    const getHexa = () => Color.HSVA.toHexa(props.hsvSignal[0]());

    createEffect(() => {
        if (!getIsOpen()) return;

        const handlePointerDown = (e: PointerEvent) => {
            const target = e.target as Node | null;

            if (!target) return;
            if (document.getElementById(props.getPopupId())?.contains(target)) return;
            if (getTriggerRef()?.contains(target)) return;

            setIsOpen(false);
        };

        document.addEventListener("pointerdown", handlePointerDown);

        onCleanup(() => {
            document.removeEventListener("pointerdown", handlePointerDown);
        });
    });

    createEffect(() => {
        const hue = props.hsvSignal[0]().h;

        if (untrack(props.hueSignal[0]) === hue) return;

        props.hueSignal[1](hue);
    });

    createEffect(() => {
        const hue = props.hueSignal[0]();

        if (untrack(() => props.hsvSignal[0]().h) === hue) return;

        props.hsvSignal[1]((prev) => ({ ...prev, h: hue }));
    });

    return (
        <>
            <Button
                ref={setTriggerRef}
                renderContent={(getFlags) => (
                    <PageColorFieldTrigger getFlags={getFlags}>
                        <PageColorSwatch getValue={getCss} />
                        {getHexa()}
                    </PageColorFieldTrigger>
                )}
                onClick={() => {
                    setIsOpen((prev) => !prev);
                }}
            />

            <Popover
                getId={props.getPopupId}
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
                        <PageColorPreview getValue={getCss} />

                        <SurfaceExample hsvSignal={props.hsvSignal} />

                        <PageColorPickerRow>
                            <Range
                                valueSignal={props.hueSignal}
                                getSizing={() => "fill"}
                                getMax={() => HUE_MAX}
                                getStep={() => 1}
                                getId={() => "hueSlider"}
                                getAriaLabel={() => "Hue"}
                                getThumbSize={() => HUE_THUMB_SIZE}
                                renderContent={(getFlags) => <PageHueSlider getFlags={getFlags} />}
                            />
                        </PageColorPickerRow>

                        <PageColorChannels hsvSignal={props.hsvSignal} />
                    </PageColorPickerPopup>
                )}
            />
        </>
    );
};
