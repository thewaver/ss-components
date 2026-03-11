import { For, ParentProps, createMemo } from "solid-js";

import { Size2d } from "@thewaver/ss-utils";

import { CornerKey, CornersProps } from "./Corners.types";

import * as styles from "./Corners.css";

const DEFAULT_CORNERS_TRANSITION_DURATION_MS = 200;
const DEFAULT_CORNERS_STROKE_THICKNESS = 4;
const DEFAULT_CORNERS_CORNER_LENGTH: Size2d = { width: 20, height: 20 };
const DEFAULT_CORNERS_VISIBLE_CORNERS: Partial<Record<CornerKey, boolean>> = {
    bottomLeft: true,
    bottomRight: true,
    topLeft: true,
    topRight: true,
};

export const Corners = (props: ParentProps<CornersProps>) => {
    const getColor = createMemo(() => props.getColor?.() ?? "currentColor");

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_CORNERS_TRANSITION_DURATION_MS,
    );

    const getCornerLength = createMemo(() => props.getCornerLength?.() ?? DEFAULT_CORNERS_CORNER_LENGTH);

    const getStrokeThickness = createMemo(() => props.getStrokeThickness?.() ?? DEFAULT_CORNERS_STROKE_THICKNESS);

    const getVisibleCorners = createMemo(() => props.getVisibleCorners?.() ?? DEFAULT_CORNERS_VISIBLE_CORNERS);

    return (
        <div
            class={styles.cornersRoot}
            style={{
                color: getColor(),
                filter: `drop-shadow(0 0 8px ${getColor()}) drop-shadow(0 0 16px ${getColor()})`,
                transition: `color ${getTransitionDurationMs()}ms, filter ${getTransitionDurationMs()}ms`,
            }}
        >
            <For each={Object.keys(getVisibleCorners())}>
                {(cornerKey) => (
                    <svg
                        class={`${styles.cornerSVG} ${styles.cornerVariant[cornerKey as CornerKey]}`}
                        width={getCornerLength().width}
                        height={getCornerLength().height}
                        viewBox={`0 0 ${getCornerLength().width} ${getCornerLength().height}`}
                        overflow="visible"
                    >
                        <polygon
                            fill="currentColor"
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
