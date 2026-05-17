import type { ParentProps } from "solid-js";
import { createMemo } from "solid-js";
import { createStore } from "solid-js/store";

import { PolygonUtils } from "@thewaver/ss-utils";
import { assignInlineVars } from "@vanilla-extract/dynamic";

import type { ButtonFlags, InternalButtonFlags } from "../Button/Button.types";
import type { ShapeButtonProps } from "./ShapeButton.types";

import * as buttonStyles from "../Button/Button.css";
import * as styles from "./ShapeButton.css";

const DEFAULT_SHAPE_BUTTON_STROKE_WIDTH = 2;
const DEFAULT_SHAPE_BUTTON_TRANSITION_DURATION_MS = 100;
const DEFAULT_SHAPE_BUTTON_OUTLINE = {
    color: "yellow",
    width: 2,
};

export const ShapeButton = (props: ParentProps<ShapeButtonProps>) => {
    const [internalFlags, setInternalFlags] = createStore<InternalButtonFlags>({});

    const getFlags = createMemo(
        (): ButtonFlags => ({
            ...internalFlags,
            isDisabled: props.getIsDisabled?.(),
            isPressed: props.getIsPressed?.(),
            hasError: props.getHasError?.(),
        }),
    );

    const getFillDefs = createMemo(() => props.getFillDefs(getFlags));

    const getStrokeDefs = createMemo(() => props.getStrokeDefs(getFlags));

    const getStrokeWidth = createMemo(() => getStrokeDefs().width ?? DEFAULT_SHAPE_BUTTON_STROKE_WIDTH);

    const getOutlineDefs = createMemo(() => props.getOutlineDefs?.() ?? DEFAULT_SHAPE_BUTTON_OUTLINE);

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
            fill: PolygonUtils.pointsToSVGString(points),
            stroke: PolygonUtils.pointsToSVGString(PolygonUtils.insetPolygon(points, getStrokeWidth() * 0.5)),
            outline: PolygonUtils.pointsToSVGString(PolygonUtils.insetPolygon(points, getOutlineDefs().width * 0.5)),
        };
    });

    return (
        <div
            class={styles.shapeButtonRoot}
            classList={{
                [buttonStyles.buttonError]: props.getHasError?.(),
                [buttonStyles.buttonPressed]: props.getIsPressed?.(),
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
                    class={styles.shapeButtonGroup}
                    role="button"
                    tabIndex={getTabIndex()}
                    aria-disabled={props.getIsDisabled?.()}
                    aria-pressed={props.getIsPressed?.()}
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

                    <polygon
                        class={styles.shapeButtonPolygonOutline}
                        points={getPolygonPoints().outline}
                        stroke={getOutlineDefs().color}
                        stroke-width={getOutlineDefs().width}
                        fill="transparent"
                    />
                </g>
            </svg>

            <div class={styles.shapeButtonChildrenWrapper}>{props.children}</div>
        </div>
    );
};
