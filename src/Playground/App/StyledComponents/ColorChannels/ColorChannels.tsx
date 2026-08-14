import { createEffect, createSignal, untrack } from "solid-js";

import { Color } from "@thewaver/ss-utils";

import { Radio } from "../../../../Lib/Fundamentals/Input/Radio/Radio";
import { RadioGroup } from "../../../../Lib/Fundamentals/Input/RadioGroup/RadioGroup";
import { TextInput } from "../../../../Lib/Fundamentals/Input/TextInput/TextInput";
import {
    PageColorChannel,
    PageColorChannelGrid,
    PageColorPickerRow,
} from "../../StyledComponents/ColorAreaContent/ColorAreaContent";
import { PageRadioContent } from "../../StyledComponents/RadioContent/RadioContent";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../StyledComponents/TextFieldContent/TextFieldContent";
import { PageNumberField } from "../Field/Field";
import type { PageColorChannelsProps } from "./ColorChannels.types";

import { FIELD_GAP, FIELD_PADDING } from "../../StyledComponents/TextFieldContent/TextFieldContent.css";

const SPACES: Color.ValueSpace[] = ["rgba", "hsla", "hexa"];
const RGB_CHANNELS = ["r", "g", "b"] as const;
const HSL_CHANNELS = ["s", "l"] as const;
const CHANNEL_FIELD_WIDTH = 76;
const HEX_FIELD_WIDTH = 150;
const CHANNEL_MAX = 255;
const HUE_MAX = 360;
const PERCENT = 100;
const ALPHA_STEP = 0.01;
const ALPHA_MAX = 1;

export const PageColorChannels = (props: PageColorChannelsProps) => {
    const spaceSignal = createSignal<Color.ValueSpace>("rgba");
    const hexSignal = createSignal("");

    const getRgba = () => Color.HSVA.toRgba(props.hsvSignal[0]());

    const getHsla = () => Color.HSVA.toHsla(props.hsvSignal[0]());

    const getHexa = () => Color.RGBA.toHexa(getRgba());

    const getAlpha = () => Color.HSVA.getClampedAlpha(props.hsvSignal[0]());

    const setRgbaChannel = (channel: (typeof RGB_CHANNELS)[number], value: number) => {
        props.hsvSignal[1](() => Color.RGBA.toHsva({ ...getRgba(), [channel]: value }));
    };

    const setHslaChannel = (channel: "h" | (typeof HSL_CHANNELS)[number], value: number) => {
        const hsl = { ...getHsla(), [channel]: channel === "h" ? value : value / PERCENT };

        props.hsvSignal[1](() => Color.HSLA.toHsva({ ...hsl, a: getAlpha() }));
    };

    const setAlpha = (alpha: number) => {
        props.hsvSignal[1]((prev) => ({ ...prev, a: alpha }));
    };

    const refreshHexField = () => {
        hexSignal[1](untrack(getHexa));
    };

    createEffect(() => {
        const hexa = hexSignal[0]();

        if (!Color.Hexa.isHexa(hexa)) return;

        props.hsvSignal[1](() => Color.Hexa.toHsva(hexa));
    });

    createEffect(() => {
        if (spaceSignal[0]() !== "hexa") return;

        refreshHexField();
    });

    return (
        <>
            <PageColorPickerRow>
                <RadioGroup
                    valueSignal={spaceSignal}
                    getDir={() => "row"}
                    getGap={() => 5}
                    getAriaLabel={() => "Colour space"}
                >
                    {SPACES.map((space) => (
                        <Radio
                            getValue={() => space}
                            getAriaLabel={() => space.toUpperCase()}
                            renderContent={(getFlags) => (
                                <PageRadioContent getFlags={getFlags}>{space.toUpperCase()}</PageRadioContent>
                            )}
                        />
                    ))}
                </RadioGroup>
            </PageColorPickerRow>

            {spaceSignal[0]() === "rgba" && (
                <PageColorChannelGrid>
                    {RGB_CHANNELS.map((channel) => (
                        <PageColorChannel label={channel}>
                            <PageNumberField
                                getValue={() => Math.round(getRgba()[channel])}
                                getMin={() => 0}
                                getMax={() => CHANNEL_MAX}
                                getWidth={() => CHANNEL_FIELD_WIDTH}
                                getAriaLabel={() => `Red green blue channel ${channel}`}
                                onInput={(value) => setRgbaChannel(channel, value)}
                            />
                        </PageColorChannel>
                    ))}

                    <PageColorChannel label="a">
                        <PageNumberField
                            getValue={getAlpha}
                            getMin={() => 0}
                            getMax={() => ALPHA_MAX}
                            getStep={() => ALPHA_STEP}
                            getWidth={() => CHANNEL_FIELD_WIDTH}
                            getAriaLabel={() => "Alpha"}
                            onInput={setAlpha}
                        />
                    </PageColorChannel>
                </PageColorChannelGrid>
            )}

            {spaceSignal[0]() === "hsla" && (
                <PageColorChannelGrid>
                    <PageColorChannel label="h">
                        <PageNumberField
                            getValue={() => Math.round(getHsla().h)}
                            getMin={() => 0}
                            getMax={() => HUE_MAX}
                            getWidth={() => CHANNEL_FIELD_WIDTH}
                            getAriaLabel={() => "Hue channel"}
                            onInput={(value) => setHslaChannel("h", value)}
                        />
                    </PageColorChannel>

                    {HSL_CHANNELS.map((channel) => (
                        <PageColorChannel label={channel}>
                            <PageNumberField
                                getValue={() => Math.round(getHsla()[channel] * PERCENT)}
                                getMin={() => 0}
                                getMax={() => PERCENT}
                                getWidth={() => CHANNEL_FIELD_WIDTH}
                                getAriaLabel={() => `Hue saturation lightness channel ${channel}`}
                                onInput={(value) => setHslaChannel(channel, value)}
                            />
                        </PageColorChannel>
                    ))}

                    <PageColorChannel label="a">
                        <PageNumberField
                            getValue={getAlpha}
                            getMin={() => 0}
                            getMax={() => ALPHA_MAX}
                            getStep={() => ALPHA_STEP}
                            getWidth={() => CHANNEL_FIELD_WIDTH}
                            getAriaLabel={() => "Alpha"}
                            onInput={setAlpha}
                        />
                    </PageColorChannel>
                </PageColorChannelGrid>
            )}

            {spaceSignal[0]() === "hexa" && (
                <div onFocusOut={refreshHexField}>
                    <PageColorChannel label="hexa">
                        <TextInput
                            valueSignal={hexSignal}
                            getAriaLabel={() => "Hex with alpha"}
                            getPadding={() => FIELD_PADDING}
                            getGap={() => FIELD_GAP}
                            computeTextStyle={computePageTextFieldTextStyle}
                            renderContent={(getFlags) => (
                                <PageTextFieldContent getFlags={getFlags} getWidth={() => HEX_FIELD_WIDTH} />
                            )}
                        />
                    </PageColorChannel>
                </div>
            )}
        </>
    );
};
