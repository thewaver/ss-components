import { For, createMemo } from "solid-js";
import type { ParentProps } from "solid-js";

import { Size2d } from "@thewaver/ss-utils";

import { access } from "../../Utils/propUtils";
import type { CornerKey, CornersProps } from "./Corners.types";

import * as styles from "./Corners.css";

const DEFAULT_CORNERS_TRANSITION_DURATION_MS = 200;
const DEFAULT_CORNERS_STROKE_THICKNESS = 4;
const DEFAULT_CORNERS_CORNER_LENGTH: Size2d = { width: 20, height: 20 };
const DEFAULT_CORNERS_VISIBLE_CORNERS: Set<CornerKey> = new Set(["bottomLeft", "bottomRight", "topLeft", "topRight"]);

export const Corners = (props: ParentProps<CornersProps>) => {
    const getColor = createMemo(() => access(props.color) ?? "currentColor");

    const getTransitionDurationMs = createMemo(
        () => access(props.transitionDurationMs) ?? DEFAULT_CORNERS_TRANSITION_DURATION_MS,
    );

    const getCornerLength = createMemo(() => access(props.cornerLength) ?? DEFAULT_CORNERS_CORNER_LENGTH);

    const getStrokeThickness = createMemo(() => access(props.strokeThickness) ?? DEFAULT_CORNERS_STROKE_THICKNESS);

    const getVisibleCorners = createMemo(() => [...(access(props.visibleCorners) ?? DEFAULT_CORNERS_VISIBLE_CORNERS)]);

    return (
        <div class={styles.cornersRoot}>
            <div
                class={styles.cornersGlow}
                style={{
                    color: getColor(),
                    filter: `drop-shadow(0 0 8px ${getColor()}) drop-shadow(0 0 16px ${getColor()})`,
                    transition: `color ${getTransitionDurationMs()}ms, filter ${getTransitionDurationMs()}ms`,
                }}
                aria-hidden="true"
            >
                <For each={getVisibleCorners()}>
                    {(cornerKey) => (
                        <svg
                            class={`${styles.cornerSVG} ${styles.cornerVariant[cornerKey]}`}
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
            </div>

            {props.children}
        </div>
    );
};
