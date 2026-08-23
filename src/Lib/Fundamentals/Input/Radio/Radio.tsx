import { createSignal } from "solid-js";

import { InteractionUtils } from "../../../Abstracts/Interaction/Interaction.utils";
import { access } from "../../../Utils/propUtils";
import { BinarySwitch } from "../BinarySwitch/BinarySwitch";
import { useRadioGroupContext } from "../RadioGroup/RadioGroup.context";
import type { RadioProps } from "./Radio.types";

export const Radio = <T,>(props: RadioProps<T>) => {
    const getValue = () => access(props.value);

    const context = useRadioGroupContext();

    const [getElementRef, setElementRef] = createSignal<HTMLElement>();

    const getIsDisabled = () => access(props.isDisabled) ?? false;

    const getIsReachable = () =>
        InteractionUtils.computeIsReachable(
            getIsDisabled(),
            access(props.isReachableWhenDisabled) ?? false,
            props.tooltipDefs !== undefined,
        );

    context.register({
        getElementRef,
        getIsDisabled,
        getIsReachable,
        getValue,
    });

    return (
        <BinarySwitch
            {...props}
            ref={setElementRef}
            type={"radio"}
            name={context.getName}
            isChecked={() => context.getValue() === (getValue() as unknown)}
            isTabbable={() => context.computeIsTabbable(getValue())}
            onChange={(isChecked) => {
                context.setValue(getValue());

                void props.onChange?.(isChecked);
            }}
        />
    );
};
