import { Modal } from "../Modal/Modal";
import type { DrawerProps } from "./Drawer.types";

export const Drawer = (props: DrawerProps) => <Modal {...props} getAlignment={props.getEdge} />;
