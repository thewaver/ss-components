import { createSignal } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Typewriter } from "../../../../Lib/Fundamentals/Typewriter/Typewriter";
import knight from "../../knight.png";

import * as pageStyles from "../Pages.css";
import * as styles from "./TypewriterPage.css";

const STARTING_TEXT = "I am a brown, crispy potatoe!?...";

export const TypewriterPage = () => {
    const [getTextWidth, setTextWidth] = createSignal(240);

    return (
        <div class={styles.root}>
            <div class={[styles.textContent, pageStyles.measureBox].join(" ")} style={{ width: `${getTextWidth()}px` }}>
                <Typewriter>
                    This is a bit of{" "}
                    <b>
                        text that appears
                        <div class={styles.textHighlight} style={{ color: "red" }} title="ONE MEANS ONE!">
                            one
                        </div>
                    </b>
                    <span>single</span>
                    {" text character\tat a time,"}
                    <br />
                    <br />
                    <div style={{ "width": "100%", "height": "0.5em", "border-bottom": "2px solid currentColor" }} />
                    {"and has\nescaped "}
                    <img src={knight} height={24} style={{ "vertical-align": "middle" }} />
                    <a href="http://www.google.com">characters.</a>
                </Typewriter>
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
