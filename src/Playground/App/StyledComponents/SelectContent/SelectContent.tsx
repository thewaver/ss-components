import type { ParentProps } from "solid-js";

import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { SelectFlags } from "../../../../Lib/Fundamentals/Input/Select/Select.types";
import type { TextFieldTextStyle } from "../../../../Lib/Fundamentals/Input/TextField/TextField.types";
import type { SelectContentProps } from "./SelectContent.types";

import { themeVars } from "../../Theme.css";
import * as styles from "./SelectContent.css";

export const computePageSelectTextStyle = (getFlags: () => InteractionFlags<SelectFlags>): TextFieldTextStyle => ({
    "color": getFlags().isDisabled ? `rgb(from currentColor r g b / 50%)` : "currentColor",
    "caret-color": themeVars.color.primary.main,
    "font-size": styles.FIELD_FONT_SIZE,
    "line-height": styles.FIELD_LINE_HEIGHT,
});

export const PageSelectContent = (props: ParentProps<SelectContentProps>) => (
    <div
        class={styles.selectContent}
        style={{ width: props.getWidth ? `${props.getWidth()}px` : undefined }}
        classList={{
            [styles.isEmpty]: props.getFlags().isEmpty,
            [styles.isFiltering]: props.getFlags().isFiltering,
            [styles.isHovered]: props.getFlags().isHovered,
            [styles.isActive]: props.getFlags().isActive,
            [styles.isOpen]: props.getFlags().isOpen,
            [styles.isDisabled]: props.getFlags().isDisabled,
            [styles.hasError]: props.getFlags().hasError,
        }}
    >
        <div class={styles.selectValue}>{props.children}</div>
        <div class={styles.selectChevron} />
    </div>
);
