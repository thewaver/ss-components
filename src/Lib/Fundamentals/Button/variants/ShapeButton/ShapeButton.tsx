import { ParentProps, createMemo } from "solid-js";

import { assignInlineVars } from "@vanilla-extract/dynamic";

import { ShapeButtonColorDefs, ShapeButtonProps } from "./ShapeButton.types";

import * as buttonStyles from "../../Button.css";
import * as styles from "./ShapeButton.css";

const DEFAULT_SHAPE_BUTTON_STROKE_WIDTH = 2;
const DEFAULT_SHAPE_BUTTON_COLORS: ShapeButtonColorDefs = {
    color: "transparent",
    strokeColor: "transparent",
};

export const ShapeButton = (props: ParentProps<ShapeButtonProps>) => {
    const getStrokeWidth = createMemo(() => props.getStrokeWidth?.() ?? DEFAULT_SHAPE_BUTTON_STROKE_WIDTH);

    const getColorDefs = createMemo(() => props.getColorDefs?.() ?? DEFAULT_SHAPE_BUTTON_COLORS);

    const getTabIndex = createMemo(() => (!props.getIsDisabled?.() ? 0 : -1));

    const getPolygonPoints = createMemo(() => {
        const padding = getStrokeWidth() * 0.5;
        const width = props.getWidth();
        const height = props.getHeight();

        switch (props.getShape()) {
            case "lozenge":
                return [
                    `${width * 0.5},${padding}`,
                    `${width - padding},${height * 0.5}`,
                    `${width * 0.5},${height - padding}`,
                    `${padding},${height * 0.5}`,
                ].join(" ");

            case "hexagon":
                return [
                    `${width * 0.5},${padding}`,
                    `${width - padding},${height / 3 + padding}`,
                    `${width - padding},${(height / 3) * 2 - padding}`,
                    `${width * 0.5},${height - padding}`,
                    `${padding},${(height / 3) * 2 - padding}`,
                    `${padding},${height / 3 + padding}`,
                ].join(" ");
        }
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
                    [styles.shapeButtonColor]: getColorDefs().color,
                    [styles.shapeButtonStrokeColor]: getColorDefs().strokeColor,
                }),
            }}
        >
            <svg
                ref={(el) => {
                    el.tabIndex = getTabIndex();
                }}
                id={props.getId?.()}
                class={styles.shapeButtonSVG}
                width={props.getWidth()}
                height={props.getHeight()}
                viewBox={`0 0 ${props.getWidth()} ${props.getHeight()}`}
                overflow="visible"
                role="button"
                aria-disabled={props.getIsDisabled?.()}
                onClick={!props.getIsDisabled?.() ? props.onClick : undefined}
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
                        await props.onClick?.(e);
                    }
                }}
            >
                <polygon
                    class={`${styles.shapeButtonPolygonStroke} ${props.getClassName?.()}`}
                    points={getPolygonPoints()}
                    stroke-width={getStrokeWidth()}
                />

                <polygon
                    class={`${styles.shapeButtonPolygonFill} ${props.getClassName?.()}`}
                    points={getPolygonPoints()}
                    stroke-width={getStrokeWidth()}
                />
            </svg>

            <div class={styles.shapeButtonChildrenWrapper}>{props.children}</div>
        </div>
    );
};
