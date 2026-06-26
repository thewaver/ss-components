import type { Accessor, JSX } from "solid-js";

import type { Point2d, Size2d } from "@thewaver/ss-utils";

import type { InteractionStates } from "../../Abstracts/Interaction/Interaction.types";
import type { SVGDefs } from "../../Abstracts/SVG/Defs/SVGDefs.types";
import type { AccessorProps } from "../../Utils/typeUtils";
import type { ButtonOutlineDefs } from "../Button/Button.types";
import type { SVGInteractionWrapperProps } from "../SVGInteractible/SVGInteractionWrapper.types";

export const SHAPE_EDGE_THICKNESS_KINDS = ["progressive", "constant"] as const;
export type ShapeEdgeThicknessKind = (typeof SHAPE_EDGE_THICKNESS_KINDS)[number];

export const SHAPE_JOIN_KINDS = ["round", "bevel", "scoop"] as const;
export type ShapeJoinKind = (typeof SHAPE_JOIN_KINDS)[number];

export type ShapeProps = AccessorProps<{
    edgeThicknesses: number[];
    edgeThicknessKinds?: ShapeEdgeThicknessKind[];
    joinRadii?: number[];
    joinKinds?: ShapeJoinKind[];
    getPoints: (size: Size2d) => Point2d[];
    getStrokeDefs: (size: Size2d, interactionStates: InteractionStates) => SVGDefs[];
    renderChildren: () => JSX.Element;
}> &
    (
        | ({ isInteractible: true; getOutlineDefs?: Accessor<ButtonOutlineDefs> } & Omit<
              SVGInteractionWrapperProps,
              "renderChildren"
          >)
        | { isInteractible?: false | never }
    );
