import { createMemo } from "solid-js";

import type { ShapeProps } from "./Shape.types";
import { ShapeUtils } from "./Shape.utils";

export const Shape = (props: ShapeProps) => {
    const getPaths = createMemo(() => {
        const width = props.getWidth();
        const height = props.getHeight();
        const pts = [
            { x: 0, y: 0 },
            { x: 0, y: height },
            { x: width, y: height },
            { x: width, y: 0 },
        ];

        console.log(ShapeUtils.getPaths(pts, [10, 10, 20, 20], [40, 80, 40, 80]));

        return ShapeUtils.getPaths(pts, [10, 10, 20, 20], [40, 80, 40, 80]);
    });

    return (
        <svg
            width={props.getWidth()}
            height={props.getHeight()}
            viewBox={`0 0 ${props.getWidth()} ${props.getHeight()}`}
            overflow="visible"
        >
            <path d={`${getPaths().outer}`} fill-rule="evenodd" fill="red" />
            <path d={`${getPaths().inner}`} fill-rule="evenodd" fill="yellow" />
        </svg>
    );
};
