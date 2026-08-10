import type { AccessorProps } from "../../Utils/typeUtils";
import type { InteractionControlProps, InteractionWrapperProps } from "../InteractionWrapper/InteractionWrapper.types";

export type ButtonType = "button" | "submit" | "reset";

export type ButtonCbs = {
    onClick?: (e: MouseEvent | KeyboardEvent) => void | Promise<void>;
    onPointerDown?: (e: PointerEvent) => void | Promise<void>;
    onPointerUp?: (e: PointerEvent) => void | Promise<void>;
    onMouseEnter?: (e: MouseEvent) => void | Promise<void>;
    onMouseLeave?: (e: MouseEvent) => void | Promise<void>;
};

export type ButtonElementProps = AccessorProps<ButtonCbs & InteractionControlProps & { type?: ButtonType }>;

export type ButtonProps = Omit<InteractionWrapperProps, "renderControl"> &
    AccessorProps<
        ButtonCbs & Pick<InteractionControlProps, "id" | "ariaLabel" | "renderContent"> & { type?: ButtonType }
    >;
