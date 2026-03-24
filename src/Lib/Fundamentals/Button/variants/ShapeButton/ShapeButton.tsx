import { ParentProps, createMemo } from "solid-js";

import { CssUtils } from "../../../../Abstracts/Css/Css.utils";
import { ShapeButtonUIConst } from "./ShapeButton.const";
import { ShapeButtonProps } from "./ShapeButton.types";

import * as buttonStyles from "../../Button.css";
import * as styles from "./ShapeButton.css";

export const ShapeButton = (props: ParentProps<ShapeButtonProps>) => {
    const getColorDefs = createMemo(() => props.getColorDefs?.() ?? ShapeButtonUIConst.COLORS);

    const getTabIndex = createMemo(() => (!props.getIsDisabled?.() ? 0 : -1));

    const getPolygonPoints = createMemo(() => {
        const padding = ShapeButtonUIConst.STROKE_WIDTH * 0.5;
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
                width: CssUtils.getUnit(props.getWidth()),
                height: CssUtils.getUnit(props.getHeight()),
                ...CssUtils.assignInlineVars({
                    [styles.shapeButtonColor]: CssUtils.getColor(getColorDefs().color),
                    [styles.shapeButtonStrokeColor]: CssUtils.getColor(getColorDefs().strokeColor),
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
                    stroke-width={ShapeButtonUIConst.STROKE_WIDTH}
                />

                <polygon
                    class={`${styles.shapeButtonPolygonFill} ${props.getClassName?.()}`}
                    points={getPolygonPoints()}
                    stroke-width={ShapeButtonUIConst.STROKE_WIDTH}
                />
            </svg>

            <div class={styles.shapeButtonChildrenWrapper}>{props.children}</div>
        </div>
    );
};
