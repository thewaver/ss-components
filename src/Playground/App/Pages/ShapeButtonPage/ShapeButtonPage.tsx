import { ShapeButton } from "../../../../Lib/Fundamentals/ShapeButton/ShapeButton";

import * as pageStyles from "../Pages.css";
import * as styles from "./ShapeButtonPage.css";

export const ShapeButtonPage = () => {
    return (
        <div class={styles.root}>
            <div class={styles.flexRow}>
                <ShapeButton
                    onClick={async () => console.log("click")}
                    getWidth={() => 320}
                    getHeight={() => 240}
                    getShape={() => "lozenge"}
                    getStrokeDefs={() => ({ color: "#0000FF80", width: 10 })}
                    getFillDefs={() => ({ color: "#806040" })}
                />
                <ShapeButton
                    getWidth={() => 320}
                    getHeight={() => 240}
                    getShape={() => "hexagon"}
                    getStrokeDefs={() => ({ color: "#00FF0080", width: 20 })}
                    getFillDefs={() => ({ color: "#806040" })}
                />
            </div>
        </div>
    );
};
