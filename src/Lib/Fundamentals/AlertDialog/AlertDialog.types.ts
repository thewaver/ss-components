import type { ModalProps } from "../Modal/Modal.types";

export type AlertDialogProps = Omit<
    ModalProps,
    "getRole" | "getAlignment" | "getInitialFocusRef" | "getIsDismissableOnOverlayClick"
> &
    Required<Pick<ModalProps, "getInitialFocusRef">>;
