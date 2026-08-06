import { Modal } from "../Modal/Modal";
import type { AlertDialogProps } from "./AlertDialog.types";

export const AlertDialog = (props: AlertDialogProps) => (
    <Modal {...props} getRole={() => "alertdialog"} getIsDismissableOnOverlayClick={() => false} />
);
