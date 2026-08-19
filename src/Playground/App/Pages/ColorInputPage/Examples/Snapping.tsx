import { ColorInput } from "../../../../../Lib/Fundamentals/Input/ColorInput/ColorInput";
import { pageColorPickerSlots } from "../../../StyledComponents/ColorAreaContent/ColorAreaContent";
import { PageColorInputContent } from "../../../StyledComponents/ColorInputContent/ColorInputContent";
import { toNearestPaletteColor } from "../ColorInputPage.const";
import type { ColorInputExampleProps } from "../ColorInputPage.types";

type Props = ColorInputExampleProps;

export const SnappingExample = (props: Props) => (
    <ColorInput
        {...pageColorPickerSlots}
        valueSignal={props.valueSignal}
        getAriaLabel={() => "Palette colour"}
        renderContent={(getFlags) => <PageColorInputContent getFlags={getFlags} />}
        onInput={(value) => {
            props.valueSignal[1](toNearestPaletteColor(value));
        }}
    />
);
