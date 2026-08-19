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
        getAriaLabel={() => "Decorated checkbox"}
        getIsPressed={props.checkedSignal[0]}
        renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
        renderDecoration={(getFlags) => (
            <Corners
                getColor={() => (getFlags().isPressed ? "yellow" : "transparent")}
                getCornerLength={() => CORNER_LENGTH}
                getStrokeThickness={() => STROKE_THICKNESS}
            />
        )}
    />
);
