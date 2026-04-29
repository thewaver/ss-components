import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { SizerProps } from "./Sizer.types";

import * as pageStyles from "../../Pages/Pages.css";
import * as styles from "./Sizer.css";

export const Sizer = (props: SizerProps) => {
    return (
        <div class={styles.root}>
            <Button
                getIsDisabled={() => props.getValue() <= props.getMin()}
                onClick={async () => {
                    props.onChange(Math.max(props.getValue() - props.getStep(), props.getMin()));
                }}
            >
                <div class={pageStyles.buttonContent}>-</div>
            </Button>
            {props.getValue()}
            <Button
                getIsDisabled={() => props.getValue() >= props.getMax()}
                onClick={async () => {
                    props.onChange(Math.min(props.getValue() + props.getStep(), props.getMax()));
                }}
            >
                <div class={pageStyles.buttonContent}>+</div>
            </Button>
        </div>
    );
};
