import { ColorInput } from "../../../../../Lib/Fundamentals/Input/ColorInput/ColorInput";
import { pageColorPickerSlots } from "../../../StyledComponents/ColorAreaContent/ColorAreaContent";
import { PageColorInputContent } from "../../../StyledComponents/ColorInputContent/ColorInputContent";
import type { ColorInputExampleProps } from "../ColorInputPage.types";

type Props = ColorInputExampleProps;

export const CompactExample = (props: Props) => (
    <ColorInput
        {...pageColorPickerSlots}
        valueSignal={props.valueSignal}
        ariaLabel={"Compact colour"}
        renderContent={(getFlags) => <PageColorInputContent flags={getFlags} isCompact={true} />}
    />
);
