import { Wheel } from "../Wheel/Wheel";
import type { DrumWheelProps } from "../Wheel/Wheel.types";

export const DrumWheel = <T,>(props: DrumWheelProps<T>) => <Wheel<T> {...props} variant={"drum"} />;
