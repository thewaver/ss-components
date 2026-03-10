import { For, ParentProps, createMemo } from "solid-js";

import { Size2d } from "@thewaver/ss-utils";

import { CornerKey, CornersProps } from "./Corners.types";

import * as styles from "./Corners.css";

const DEFAULT_STROKE_THICKNESS = 4;
const DEFAULT_CORNER_LENGTH: Size2d = { width: 20, height: 20 };
const DEFAULT_VISIBLE_CORNERS: Partial<Record<CornerKey, boolean>> = {
    bottomLeft: true,
    bottomRight: true,
    topLeft: true,
    topRight: true,
};

export const Corners = (props: ParentProps<CornersProps>) => {
    const getColor = createMemo(() => props.getColor?.() ?? "currentColor");

    const getCornerLength = createMemo(() => props.getCornerLength?.() ?? DEFAULT_CORNER_LENGTH);

    const getStrokeThickness = createMemo(() => props.getStrokeThickness?.() ?? DEFAULT_STROKE_THICKNESS);

    const getVisibleCorners = createMemo(() => props.getVisibleCorners?.() ?? DEFAULT_VISIBLE_CORNERS);

    return (
        <div class={styles.cornersRoot}>
            <For each={Object.keys(getVisibleCorners())}>
                {(cornerKey) => (
                    <svg
                        class={`${styles.cornerSVG} ${styles.cornerVariant[cornerKey as CornerKey]}`}
                        width={getCornerLength().width}
                        height={getCornerLength().height}
                        color={getColor()}
                        viewBox={`0 0 ${getCornerLength().width} ${getCornerLength().height}`}
                        overflow="visible"
                    >
                        <polygon
                            class={styles.cornerPolygon}
                            points={[
                                `0,0`,
                                `${getCornerLength().width},0`,
                                `${getCornerLength().width - getStrokeThickness()},${getStrokeThickness()}`,
                                `${getStrokeThickness()},${getStrokeThickness()}`,
                                `${getStrokeThickness()},${getCornerLength().height - getStrokeThickness()}`,
                                `0,${getCornerLength().height}`,
                            ].join(" ")}
                        />
                    </svg>
                )}
            </For>

            {props.children}
        </div>
    );
};
