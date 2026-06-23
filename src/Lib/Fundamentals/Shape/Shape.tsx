import { createMemo } from "solid-js";

import type { ShapeProps } from "./Shape.types";
import { ShapeUtils } from "./Shape.utils";

export const Shape = (props: ShapeProps) => {
    const getPaths = createMemo(() => {
        const width = props.getWidth();
        const height = props.getHeight();
        const pts = props.getPoints({ width, height });

        return ShapeUtils.getPaths(
            pts,
            props.edgeThicknesses,
            props.edgeThicknessKinds,
            props.joinRadii,
            props.joinKinds,
        );
    });

    return (
        <svg
            width={props.getWidth()}
            height={props.getHeight()}
            viewBox={`0 0 ${props.getWidth()} ${props.getHeight()}`}
            overflow="visible"
        >
            <path d={`${getPaths().outer}`} fill-rule="evenodd" fill="#00F0C0" />
            <path d={`${getPaths().inner}`} fill-rule="evenodd" fill="#504030" />
        </svg>
    );
};
