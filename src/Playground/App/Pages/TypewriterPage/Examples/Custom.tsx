import { createEffect, createSignal, on } from "solid-js";

import { FunctionUtils } from "@thewaver/ss-utils";

import { Typewriter } from "../../../../../Lib/Fundamentals/Typewriter/Typewriter";
import type { TypewriterController } from "../../../../../Lib/Fundamentals/Typewriter/Typewriter.types";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";

type Props = AccessorProps<{
    text: string;
}>;

export const CustomExample = (props: Props) => {
    const [getController, setController] = createSignal<TypewriterController>();
    const [getText, setText] = createSignal(props.getText());

    const updateContent = FunctionUtils.debounce(() => {
        setText(props.getText());
        getController()?.update("content");
    }, 500);

    createEffect(on(props.getText, updateContent));

    return <Typewriter getController={setController}>{getText()}</Typewriter>;
};
