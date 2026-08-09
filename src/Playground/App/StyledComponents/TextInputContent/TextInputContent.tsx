import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { TextInputTextStyle } from "../../../../Lib/Fundamentals/Input/TextInput/TextInput.types";
import type { TextInputContentProps } from "./TextInputContent.types";

import { themeVars } from "../../Theme.css";
import * as styles from "./TextInputContent.css";

export const computePageTextInputTextStyle = (getFlags: () => InteractionFlags): TextInputTextStyle => ({
    "color": getFlags().isDisabled ? `rgb(from currentColor r g b / 50%)` : "currentColor",
    "caret-color": themeVars.color.primary.main,
    "font-size": styles.FIELD_FONT_SIZE,
    "line-height": styles.FIELD_LINE_HEIGHT,
});

export const PageTextInputContent = (props: TextInputContentProps) => (
    <div
        class={styles.textInputContent}
        style={{ width: props.getWidth ? `${props.getWidth()}px` : undefined }}
        classList={{
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isReadOnly]: props.getFlags().isReadOnly,
            [styles.isDisabled]: props.getFlags().isDisabled,
            [styles.hasError]: props.getFlags().hasError,
        }}
    />
);
