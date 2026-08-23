import type { ParentProps } from "solid-js";

import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { SelectFlags } from "../../../../Lib/Fundamentals/Input/Select/Select.types";
import type { TextFieldTextStyle } from "../../../../Lib/Fundamentals/Input/TextField/TextField.types";
import { access } from "../../../../Lib/Utils/propUtils";
import type { SelectContentProps } from "./SelectContent.types";

import { themeVars } from "../../Theme.css";
import * as styles from "./SelectContent.css";

export const computePageSelectTextStyle = (getFlags: () => InteractionFlags<SelectFlags>): TextFieldTextStyle => ({
    "color": getFlags().isDisabled ? `rgb(from currentColor r g b / 50%)` : "currentColor",
    "caret-color": themeVars.color.primary.main,
    "font-size": styles.FIELD_FONT_SIZE,
    "line-height": styles.FIELD_LINE_HEIGHT,
});

export const PageSelectContent = (props: ParentProps<SelectContentProps>) => {
    return (
        <div
            class={styles.selectContent}
            style={{ width: props.width ? `${access(props.width)}px` : undefined }}
            classList={{
                [styles.isEmpty]: access(props.flags).isEmpty,
                [styles.isFiltering]: access(props.flags).isFiltering,
                [styles.isHovered]: access(props.flags).isHovered,
                [styles.isActive]: access(props.flags).isActive,
                [styles.isOpen]: access(props.flags).isOpen,
                [styles.isDisabled]: access(props.flags).isDisabled,
                [styles.hasError]: access(props.flags).hasError,
            }}
        >
            <div class={styles.selectValue}>{props.children}</div>
            <div class={styles.selectChevron} />
        </div>
    );
};
