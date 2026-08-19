import { ColorInput } from "../../../../../Lib/Fundamentals/Input/ColorInput/ColorInput";
import { pageColorPickerSlots } from "../../../StyledComponents/ColorAreaContent/ColorAreaContent";
import { PageColorInputContent } from "../../../StyledComponents/ColorInputContent/ColorInputContent";
import { NO_BRAND_COLOR } from "../ColorInputPage.const";
import type { ColorInputExampleProps } from "../ColorInputPage.types";

type Props = ColorInputExampleProps;

export const ErroredExample = (props: Props) => (
    <ColorInput
        {...pageColorPickerSlots}
        valueSignal={props.valueSignal}
        getHasError={() => props.valueSignal[0]() === NO_BRAND_COLOR}
        getAriaLabel={() => "Validated colour"}
        renderContent={(getFlags) => <PageColorInputContent getFlags={getFlags} />}
    />
);
