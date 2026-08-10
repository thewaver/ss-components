import { Show } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { PageButtonContent } from "../ButtonContent/ButtonContent";
import type { ToastContentProps } from "./ToastContent.types";

import * as styles from "./ToastContent.css";

const POSITION_OFFSET = 1;

export const PageToastContent = (props: ToastContentProps) => (
    <div
        class={[
            styles.toastCard,
            styles.toastKindVariants[props.getToast().value.kind],
            props.getVisibilityTarget() === 1
                ? styles.toastAnimationOn
                : styles.toastAnimationOffVariants[props.getAnimation()],
        ].join(" ")}
        style={{
            transition: `transform ${props.getTransitionDurationMs()}ms, opacity ${props.getTransitionDurationMs()}ms`,
        }}
    >
        <div class={styles.toastBody}>
            <div class={styles.toastMessage}>{props.getToast().value.message}</div>

            <div class={styles.toastMeta} aria-hidden>
                {props.getState().index + POSITION_OFFSET} of {props.getState().count}
                {props.getToast().durationMs === undefined && " · stays until dismissed"}
                {props.getState().isPaused && " · paused"}
            </div>
        </div>

        <Button
            renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>Close</PageButtonContent>}
            onClick={props.onDismiss}
        />

        <Show when={props.getToast().durationMs}>
            {(getDurationMs) => (
                <div
                    class={styles.toastCountdown}
                    data-countdown
                    style={{
                        "animation-duration": `${getDurationMs()}ms`,
                        "animation-play-state": props.getState().isPaused ? "paused" : "running",
                    }}
                />
            )}
        </Show>
    </div>
);
