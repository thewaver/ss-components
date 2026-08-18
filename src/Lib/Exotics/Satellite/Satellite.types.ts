import type { JSX } from "solid-js";

import type { CSSPadding, Point2d } from "@thewaver/ss-utils";

import type { AnchorPlacement } from "../../Abstracts/Anchor/Anchor.types";
import type { AccessorProps } from "../../Utils/typeUtils";

export type SatelliteLayout = {
    padding: CSSPadding;
    satelliteOffset: Point2d;
};

export type SatelliteProps = AccessorProps<{
    placement?: AnchorPlacement;
    offset?: Point2d;
    isBehindSubject?: boolean;
}> & {
    renderSatellite?: () => JSX.Element;
};
