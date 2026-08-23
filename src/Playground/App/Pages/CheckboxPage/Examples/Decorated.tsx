import { Corners } from "../../../../../Lib/Fundamentals/Corners/Corners";
import { Checkbox } from "../../../../../Lib/Fundamentals/Input/Checkbox/Checkbox";
import { PageCheckboxContent } from "../../../StyledComponents/CheckboxContent/CheckboxContent";
import type { CheckboxExampleProps } from "../CheckboxPage.types";

const CORNER_LENGTH = { width: 8, height: 8 };
const STROKE_THICKNESS = 2;

type Props = CheckboxExampleProps;

export const DecoratedExample = (props: Props) => (
    <Checkbox
        checkedSignal={props.checkedSignal}
        ariaLabel={"Decorated checkbox"}
        isPressed={props.checkedSignal[0]}
        renderContent={(getFlags) => <PageCheckboxContent flags={getFlags} />}
        renderDecoration={(getFlags) => (
            <Corners
                color={() => (getFlags().isPressed ? "yellow" : "transparent")}
                cornerLength={() => CORNER_LENGTH}
                strokeThickness={() => STROKE_THICKNESS}
            />
        )}
    />
);
