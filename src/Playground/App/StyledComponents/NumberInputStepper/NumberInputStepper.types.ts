import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { NumberInputStepper } from "../../../../Lib/Fundamentals/Input/NumberInput/NumberInput.types";
import type { TextFieldFlags } from "../../../../Lib/Fundamentals/Input/TextField/TextField.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type NumberInputStepperProps = AccessorProps<{
    flags: InteractionFlags<TextFieldFlags>;
}> & {
    stepper: NumberInputStepper;
};
