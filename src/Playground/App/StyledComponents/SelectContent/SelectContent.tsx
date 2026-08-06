import type { ParentProps } from "solid-js";

import type { InteractionFlags } from "../../../../Lib/Abstracts/Interaction/Interaction.types";
import type { SelectFlags } from "../../../../Lib/Fundamentals/Input/Select/Select.types";
import type { TextInputTextStyle } from "../../../../Lib/Fundamentals/Input/TextInput/TextInput.types";
import type { SelectContentProps } from "./SelectContent.types";

import * as pageStyles from "../../Pages/Pages.css";
import * as styles from "./SelectContent.css";

export const computePageSelectTextStyle = (getFlags: () => InteractionFlags<SelectFlags>): TextInputTextStyle => ({
    "color": getFlags().isDisabled ? "rgba(from var(--clr-text) r g b / 50%)" : "var(--clr-text)",
    "caret-color": "var(--clr-primary)",
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
            [styles.isOpen]: props.getFlags().isOpen,
            [pageStyles.isDisabled]: props.getFlags().isDisabled,
            [pageStyles.hasError]: props.getFlags().hasError,
        }}
    >
        <div class={styles.selectValue}>{props.children}</div>
        <div class={styles.selectChevron} />
    </div>
);
