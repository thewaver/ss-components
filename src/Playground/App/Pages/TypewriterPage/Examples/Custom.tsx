import { createEffect, createSignal, on } from "solid-js";

import { FunctionUtils } from "@thewaver/ss-utils";

import { Typewriter } from "../../../../../Lib/Exotics/Typewriter/Typewriter";
import type { TypewriterController } from "../../../../../Lib/Exotics/Typewriter/Typewriter.types";
import { access } from "../../../../../Lib/Utils/propUtils";
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

        setText(access(props.text));
        getController()?.update("content");
    };

    const updateContentDebounced = FunctionUtils.debounce(updateContent, 500);

    createEffect(on(() => access(props.text), hasMounted ? updateContentDebounced : updateContent));

    return (
        <Typewriter animationName={props.animationName} onMount={setController}>
            {getText()}
        </Typewriter>
    );
};
