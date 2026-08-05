import { createSignal } from "solid-js";

import { InteractionUtils } from "../../../Abstracts/Interaction/Interaction.utils";
import { BinarySwitch } from "../BinarySwitch/BinarySwitch";
import { useRadioGroupContext } from "../RadioGroup/RadioGroup.context";
import type { RadioProps } from "./Radio.types";

export const Radio = <T,>(props: RadioProps<T>) => {
    const context = useRadioGroupContext();

    const [getElementRef, setElementRef] = createSignal<HTMLElement>();

    const getIsDisabled = () => props.getIsDisabled?.() ?? false;

    const getIsReachable = () =>
        InteractionUtils.computeIsReachable(
            getIsDisabled(),
            props.getIsReachableWhenDisabled?.() ?? false,
            props.getTooltipDefs !== undefined,
        );

    context.register({
        getElementRef,
        getIsDisabled,
        getIsReachable,
        getValue: props.getValue,
    });

    return (
        <BinarySwitch
            {...props}
            ref={setElementRef}
            getType={() => "radio"}
            getName={context.getName}
            getIsChecked={() => context.getValue() === (props.getValue() as unknown)}
            getIsTabbable={() => context.computeIsTabbable(props.getValue())}
            onChange={(isChecked) => {
                context.setValue(props.getValue());

                void props.onChange?.(isChecked);
            }}
        />
    );
};
