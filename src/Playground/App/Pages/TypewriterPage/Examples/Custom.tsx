import { createEffect, createSignal, on } from "solid-js";

import { FunctionUtils } from "@thewaver/ss-utils";

import { Typewriter } from "../../../../../Lib/Fundamentals/Typewriter/Typewriter";
import type { TypewriterController } from "../../../../../Lib/Fundamentals/Typewriter/Typewriter.types";
import type { AccessorProps } from "../../../../../Lib/Utils/typeUtils";
import type { TypewriterExampleProps } from "../TypewriterPage.types";

type Props = TypewriterExampleProps &
    AccessorProps<{
        text: string;
    }>;

export const CustomExample = (props: Props) => {
    let hasMounted = false;

    const [getController, setController] = createSignal<TypewriterController>();
    const [getText, setText] = createSignal("");

    const updateContent = () => {
        hasMounted = true;

        setText(props.getText());
        getController()?.update("content");
    };

    const updateContentDebounced = FunctionUtils.debounce(updateContent, 500);

    createEffect(on(props.getText, hasMounted ? updateContentDebounced : updateContent));

    return (
        <Typewriter getAnimationName={props.getAnimationName} getController={setController}>
            {getText()}
        </Typewriter>
    );
};
