import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { TextInputTextStyle } from "../../../../Lib/Fundamentals/Input/TextInput/TextInput.types";
import type { TextInputContentProps } from "./TextInputContent.types";

import * as pageStyles from "../../Pages/Pages.css";
import * as styles from "./TextInputContent.css";

export const computePageTextInputTextStyle = (getFlags: () => InteractionFlags): TextInputTextStyle => ({
    "color": getFlags().isDisabled ? "rgba(from var(--clr-text) r g b / 50%)" : "var(--clr-text)",
    "caret-color": "var(--clr-primary)",
    "font-size": styles.FIELD_FONT_SIZE,
    "line-height": styles.FIELD_LINE_HEIGHT,
});

export const PageTextInputContent = (props: TextInputContentProps) => (
    <div
        class={styles.textInputContent}
        classList={{
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isReadOnly]: props.getFlags().isReadOnly,
            [pageStyles.isDisabled]: props.getFlags().isDisabled,
            [pageStyles.hasError]: props.getFlags().hasError,
        }}
    />
);
