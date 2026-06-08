import { Typewriter } from "../../../../../Lib/Fundamentals/Typewriter/Typewriter";
import knight from "../../../knight.png";

import * as styles from "../TypewriterPage.css";

export const ComplexExample = () => {
    return (
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
    );
};
