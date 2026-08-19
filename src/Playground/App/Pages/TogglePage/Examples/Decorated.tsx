import { Corners } from "../../../../../Lib/Fundamentals/Corners/Corners";
import { Toggle } from "../../../../../Lib/Fundamentals/Input/Toggle/Toggle";
import { PageToggleContent } from "../../../StyledComponents/ToggleContent/ToggleContent";
import type { ToggleExampleProps } from "../TogglePage.types";

const CORNER_LENGTH = { width: 8, height: 8 };
const STROKE_THICKNESS = 2;

type Props = ToggleExampleProps;

export const DecoratedExample = (props: Props) => (
    <Toggle
        checkedSignal={props.checkedSignal}
        getAriaLabel={() => "Decorated toggle"}
        getIsPressed={props.checkedSignal[0]}
        renderContent={(getFlags) => <PageToggleContent getFlags={getFlags} />}
        renderDecoration={(getFlags) => (
            <Corners
                getColor={() => (getFlags().isPressed ? "yellow" : "transparent")}
                getCornerLength={() => CORNER_LENGTH}
                getStrokeThickness={() => STROKE_THICKNESS}
            />
        )}
    />
);
