import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { TextFieldTextStyle } from "../../../../Lib/Fundamentals/Input/TextField/TextField.types";
import type { TextFieldContentProps } from "./TextFieldContent.types";

import { themeVars } from "../../Theme.css";
import * as styles from "./TextFieldContent.css";

export const computePageTextFieldTextStyle = (getFlags: () => InteractionFlags): TextFieldTextStyle => ({
    "color": getFlags().isDisabled ? `rgb(from currentColor r g b / 50%)` : "currentColor",
    "caret-color": themeVars.color.primary.main,
    "font-size": styles.FIELD_FONT_SIZE,
    "line-height": styles.FIELD_LINE_HEIGHT,
});

export const PageTextFieldContent = (props: TextFieldContentProps) => (
    <div
        class={styles.textFieldContent}
        style={{
            width: props.getWidth ? `${props.getWidth()}px` : undefined,
            height: props.getHeight ? `${props.getHeight()}px` : undefined,
        }}
        classList={{
            [styles.isStretched]: props.getIsStretched?.(),
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isReadOnly]: props.getFlags().isReadOnly,
            [styles.isDisabled]: props.getFlags().isDisabled,
            [styles.hasError]: props.getFlags().hasError,
        }}
    />
);
