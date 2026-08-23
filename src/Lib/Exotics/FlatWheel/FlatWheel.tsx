import { Wheel } from "../Wheel/Wheel";
import type { FlatWheelProps } from "../Wheel/Wheel.types";

export const FlatWheel = <T,>(props: FlatWheelProps<T>) => <Wheel<T> {...props} variant={"flat"} />;
