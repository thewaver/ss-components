import { ParentProps, createMemo } from "solid-js";
import { createStore } from "solid-js/store";

import { Point2d } from "@thewaver/ss-utils";
import { assignInlineVars } from "@vanilla-extract/dynamic";

import { ButtonFlags, InternalButtonFlags } from "../../Button.types";
import { ShapeButtonProps } from "./ShapeButton.types";

import * as buttonStyles from "../../Button.css";
import * as styles from "./ShapeButton.css";

const DEFAULT_SHAPE_BUTTON_STROKE_WIDTH = 2;
const DEFAULT_SHAPE_BUTTON_TRANSITION_DURATION_MS = 100;

export function insetPolygon(points: Point2d[], shift: number): Point2d[] {
    const count = points.length;
    const result: Point2d[] = [];

    const getEdgeNormal = (p1: Point2d, p2: Point2d) => {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.hypot(dx, dy);

        return {
            x: -dy / len,
            y: dx / len,
        };
    };

    const intersect = (p: Point2d, r: Point2d, q: Point2d, s: Point2d): Point2d => {
        const cross = r.x * s.y - r.y * s.x;

        if (Math.abs(cross) < 1e-6) return q;

        const qp = { x: q.x - p.x, y: q.y - p.y };
        const t = (qp.x * s.y - qp.y * s.x) / cross;

        return {
            x: p.x + r.x * t,
            y: p.y + r.y * t,
        };
    };

    for (let i = 0; i < count; i++) {
        const prev = points[(i - 1 + count) % count];
        const curr = points[i];
        const next = points[(i + 1) % count];

        const n1 = getEdgeNormal(prev, curr);
        const n2 = getEdgeNormal(curr, next);

        const p1 = {
            x: prev.x + n1.x * shift,
            y: prev.y + n1.y * shift,
        };
        const p2 = {
            x: curr.x + n1.x * shift,
            y: curr.y + n1.y * shift,
        };

        const p3 = {
            x: curr.x + n2.x * shift,
            y: curr.y + n2.y * shift,
        };
        const p4 = {
            x: next.x + n2.x * shift,
            y: next.y + n2.y * shift,
        };

        const d1 = { x: p2.x - p1.x, y: p2.y - p1.y };
        const d2 = { x: p4.x - p3.x, y: p4.y - p3.y };

        result.push(intersect(p1, d1, p3, d2));
    }

    return result;
}

const toPointsString = (pts: Point2d[]) => pts.map((p) => `${p.x},${p.y}`).join(" ");

export const ShapeButton = (props: ParentProps<ShapeButtonProps>) => {
    const [internalFlags, setInternalFlags] = createStore<InternalButtonFlags>({});

    const getFlags = createMemo(
        (): ButtonFlags => ({
            ...internalFlags,
            isDisabled: props.getIsDisabled?.(),
            isSelected: props.getIsSelected?.(),
            hasError: props.getHasError?.(),
        }),
    );

    const getFillDefs = createMemo(() => {
        return props.getFillDefs(getFlags);
    });

    const getStrokeDefs = createMemo(() => {
        return props.getStrokeDefs(getFlags);
    });

    const getStrokeWidth = createMemo(() => {
        return getStrokeDefs().width ?? DEFAULT_SHAPE_BUTTON_STROKE_WIDTH;
    });

    const getTransitionDurationMs = createMemo(
        () => props.getTransitionDurationMs?.() ?? DEFAULT_SHAPE_BUTTON_TRANSITION_DURATION_MS,
    );

    const getTabIndex = createMemo(() => (!props.getIsDisabled?.() ? 0 : -1));

    const getPolygonPointsWithPadding = () => {
        const width = props.getWidth();
        const height = props.getHeight();

        switch (props.getShape()) {
            case "lozenge":
                return [
                    { x: width * 0.5, y: 0 },
                    { x: width, y: height * 0.5 },
                    { x: width * 0.5, y: height },
                    { x: 0, y: height * 0.5 },
                ];

            case "hexagon":
                return [
                    { x: width * 0.5, y: 0 },
                    { x: width, y: height / 3 },
                    { x: width, y: (height / 3) * 2 },
                    { x: width * 0.5, y: height },
                    { x: 0, y: (height / 3) * 2 },
                    { x: 0, y: height / 3 },
                ];
        }
    };

    const getPolygonPoints = createMemo(() => {
        const points = getPolygonPointsWithPadding();

        return {
            fill: toPointsString(points),
            stroke: toPointsString(insetPolygon(points, getStrokeWidth() * 0.5)),
        };
    });

    return (
        <div
            class={styles.shapeButtonRoot}
            classList={{
                [buttonStyles.buttonError]: props.getHasError?.(),
                [buttonStyles.buttonSelected]: props.getIsSelected?.(),
            }}
            style={{
                width: `${props.getWidth()}px`,
                height: `${props.getHeight()}px`,
                ...assignInlineVars({
                    [styles.shapeButtonTransitionDurationMs]: `${getTransitionDurationMs()}ms`,
                }),
            }}
        >
            <svg
                id={props.getId?.()}
                class={styles.shapeButtonSVG}
                width={props.getWidth()}
                height={props.getHeight()}
                viewBox={`0 0 ${props.getWidth()} ${props.getHeight()}`}
                overflow="visible"
            >
                <defs>
                    {getFillDefs().filter?.defsElement}
                    {getFillDefs().gradient?.defsElement}
                    {getStrokeDefs().filter?.defsElement}
                    {getStrokeDefs().gradient?.defsElement}
                </defs>

                <g
                    role="button"
                    tabIndex={getTabIndex()}
                    aria-disabled={props.getIsDisabled?.()}
                    aria-selected={props.getIsSelected?.()}
                    onClick={!props.getIsDisabled?.() ? props.onClick : undefined}
                    onFocus={() => {
                        setInternalFlags("isFocused", true);
                    }}
                    onBlur={() => {
                        setInternalFlags("isFocused", false);
                    }}
                    onMouseEnter={(e) => {
                        props.onMouseEnter?.(e);
                        setInternalFlags("isHovered", true);
                    }}
                    onMouseLeave={(e) => {
                        props.onMouseLeave?.(e);
                        setInternalFlags("isHovered", false);
                    }}
                    onMouseDown={(e) => {
                        if (props.getIsDisabled?.()) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }}
                    onKeyDown={async (e) => {
                        if (props.getIsDisabled?.()) {
                            e.preventDefault();
                            e.stopPropagation();
                        } else if (e.key === "Enter" || e.key === " ") {
                            if (e.key === " ") {
                                e.preventDefault();
                            }

                            await props.onClick?.(e);
                        }
                    }}
                >
                    <polygon
                        class={styles.shapeButtonPolygon}
                        points={getPolygonPoints().fill}
                        filter={getFillDefs().filter ? `url(#${getFillDefs().filter?.id})` : undefined}
                        fill={getFillDefs().gradient ? `url(#${getFillDefs().gradient?.id})` : getFillDefs().color}
                    />

                    <polygon
                        class={styles.shapeButtonPolygon}
                        points={getPolygonPoints().stroke}
                        filter={getStrokeDefs().filter ? `url(#${getStrokeDefs().filter?.id})` : undefined}
                        stroke={
                            getStrokeDefs().gradient ? `url(#${getStrokeDefs().gradient?.id})` : getStrokeDefs().color
                        }
                        stroke-dasharray={getStrokeDefs().dashArray}
                        stroke-width={getStrokeWidth()}
                        fill="transparent"
                    />
                </g>
            </svg>

            <div class={styles.shapeButtonChildrenWrapper}>{props.children}</div>
        </div>
    );
};
