import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { TextFieldTextStyle } from "../../../../Lib/Fundamentals/Input/TextField/TextField.types";
import { access } from "../../../../Lib/Utils/propUtils";
import type { TextFieldContentProps } from "./TextFieldContent.types";

import { themeVars } from "../../Theme.css";
import * as styles from "./TextFieldContent.css";

export const computePageTextFieldTextStyle = (getFlags: () => InteractionFlags): TextFieldTextStyle => ({
    "color": getFlags().isDisabled ? `rgb(from currentColor r g b / 50%)` : "currentColor",
    "caret-color": themeVars.color.primary.main,
    "font-size": styles.FIELD_FONT_SIZE,
    "line-height": styles.FIELD_LINE_HEIGHT,
});

export const PageTextFieldContent = (props: TextFieldContentProps) => {
    return (
        <div
            class={styles.textFieldContent}
            style={{
                width: props.width ? `${access(props.width)}px` : undefined,
                height: props.height ? `${access(props.height)}px` : undefined,
            }}
            classList={{
                [styles.isStretched]: access(props.isStretched),
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isReadOnly]: access(props.flags).isReadOnly,
                [styles.isDisabled]: access(props.flags).isDisabled,
                [styles.hasError]: access(props.flags).hasError,
            }}
        />
    );
};
