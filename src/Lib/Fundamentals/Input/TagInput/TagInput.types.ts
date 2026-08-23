import type { Accessor, JSX, Signal } from "solid-js";

import type { InteractionFlags } from "../../../Abstracts/Interaction/Interaction.types";
import type { AccessorProps } from "../../../Utils/typeUtils";
import type {
    InteractionControlProps,
    InteractionWrapperProps,
} from "../../InteractionWrapper/InteractionWrapper.types";
import type { TextFieldTextStyle } from "../TextField/TextField.types";

export type TagInputFlags = {
    isEmpty: boolean;
    hasTags: boolean;
};

export type TagInputCbs = {
    computeTag?: (text: string) => string | undefined;
    computeTagAriaLabel?: (tag: string) => string;
    onTagsChange?: (tags: string[]) => void | Promise<void>;
    onMouseEnter?: (e: MouseEvent) => void | Promise<void>;
    onMouseLeave?: (e: MouseEvent) => void | Promise<void>;
};

export type TagInputState = {
    name?: string;
    ariaLabel?: string;
    padding?: number;
    gap?: number;
};

export type TagInputProps = Omit<InteractionWrapperProps<TagInputFlags>, "renderControl" | "extraFlags" | "role"> &
    AccessorProps<
        TagInputCbs &
            Pick<InteractionControlProps<TagInputFlags>, "id" | "renderContent"> &
            TagInputState & {
                valueSignal: Signal<string[]>;
            }
    > & {
        textSignal?: Signal<string>;
        computeTextStyle?: (getFlags: () => InteractionFlags<TagInputFlags>) => TextFieldTextStyle;
        renderTag: (getTag: Accessor<string>, getFlags: () => InteractionFlags) => JSX.Element;
        renderPlaceholder?: (getFlags: () => InteractionFlags<TagInputFlags>) => JSX.Element;
    };
