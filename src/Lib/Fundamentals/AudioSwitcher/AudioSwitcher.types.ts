import { AccessorProps } from "../../Utils/typeUtils";

export type AudioSwitcherProps = AccessorProps<{
    src: string;
    crossfadeMs?: number;
}>;
