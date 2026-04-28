import { createSignal } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Typewriter } from "../../../../Lib/Fundamentals/Typewriter/Typewriter";

import * as pageStyles from "../Pages.css";
import * as styles from "./TypewriterPage.css";

export const TypewriterPage = () => {
    const [getTextWidth, setTextWidth] = createSignal(240);

    return (
        <div class={styles.root}>
            <div class={[styles.textContent, pageStyles.measureBox].join(" ")} style={{ width: `${getTextWidth()}px` }}>
                <Typewriter>{"I am a brown, crispy potatoe!?..."}</Typewriter>
            </div>
            <div class={[styles.textContent, pageStyles.measureBox].join(" ")} style={{ width: `${getTextWidth()}px` }}>
                {"I am a brown, crispy potatoe!?..."}
            </div>
            <div class={styles.flexRow}>
                <Button
                    onClick={async () => {
                        setTextWidth((prev) => prev - 4);
                    }}
                >
                    <div class={pageStyles.buttonContent}>-</div>
                </Button>
                {getTextWidth()}
                <Button
                    onClick={async () => {
                        setTextWidth((prev) => prev + 4);
                    }}
                >
                    <div class={pageStyles.buttonContent}>+</div>
                </Button>
            </div>
        </div>
    );
};
