import type { Signal } from "solid-js";

import type { AccessorProps } from "../../../Utils/typeUtils";
import type {
    InteractionControlProps,
    InteractionWrapperProps,
} from "../../InteractionWrapper/InteractionWrapper.types";

export type FileInputFlags = {
    files: File[];
};

export type FileInputCbs = {
    onChange?: (files: File[]) => void | Promise<void>;
    onMouseEnter?: (e: MouseEvent) => void | Promise<void>;
    onMouseLeave?: (e: MouseEvent) => void | Promise<void>;
};

export type FileInputState = {
    name?: string;
    ariaLabel?: string;
    accept?: string;
    isMultiple?: boolean;
};

export type FileInputElementProps = AccessorProps<
    FileInputCbs & InteractionControlProps<FileInputFlags> & FileInputState & { files: File[] }
>;

export type FileInputProps = Omit<InteractionWrapperProps<FileInputFlags>, "renderControl" | "extraFlags"> &
    AccessorProps<
        FileInputCbs &
            Pick<InteractionControlProps<FileInputFlags>, "id" | "renderContent"> &
            FileInputState & {
                filesSignal: Signal<File[]>;
            }
    >;
