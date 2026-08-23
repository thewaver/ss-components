import { ColorInput } from "../../../../../Lib/Fundamentals/Input/ColorInput/ColorInput";
import { pageColorPickerSlots } from "../../../StyledComponents/ColorAreaContent/ColorAreaContent";
import { PageColorInputContent } from "../../../StyledComponents/ColorInputContent/ColorInputContent";
import type { ColorInputExampleProps } from "../ColorInputPage.types";

type Props = ColorInputExampleProps;

export const DefaultExample = (props: Props) => (
    <ColorInput
        {...pageColorPickerSlots}
        valueSignal={props.valueSignal}
        ariaLabel={"Brand colour"}
        renderContent={(getFlags) => <PageColorInputContent flags={getFlags} />}
    />
);
