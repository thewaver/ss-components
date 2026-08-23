import type { Point2d } from "@thewaver/ss-utils";

import type { AnchorPlacement } from "../../../../Lib/Abstracts/Anchor/Anchor.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type SatelliteExampleProps = AccessorProps<{
    placement: AnchorPlacement;
    offset: Point2d;
    isBehindSubject: boolean;
    subjectWidth: number;
    subjectHeight: number;
    badgeSize: number;
    hasSatellite: boolean;
}>;
