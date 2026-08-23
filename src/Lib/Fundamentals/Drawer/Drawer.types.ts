import type { AccessorProps } from "../../Utils/typeUtils";
import type { ModalProps } from "../Modal/Modal.types";

export type DrawerEdge = "left" | "right" | "top" | "bottom";

export type DrawerProps = Omit<ModalProps, "role" | "alignment"> &
    AccessorProps<{
        edge: DrawerEdge;
    }>;
