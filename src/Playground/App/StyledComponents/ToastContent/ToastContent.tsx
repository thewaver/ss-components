import { Show } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { access } from "../../../../Lib/Utils/propUtils";
import { PageButtonContent } from "../ButtonContent/ButtonContent";
import type { ToastContentProps } from "./ToastContent.types";

import * as styles from "./ToastContent.css";

const POSITION_OFFSET = 1;

export const PageToastContent = (props: ToastContentProps) => {
    return (
        <div
            class={[
                styles.toastCard,
                styles.toastKindVariants[access(props.toast).value.kind],
                access(props.visibilityTarget) === 1
                    ? styles.toastAnimationOn
                    : styles.toastAnimationOffVariants[access(props.animation)],
            ].join(" ")}
            style={{
                transition: `transform ${access(props.transitionDurationMs)}ms, opacity ${access(props.transitionDurationMs)}ms`,
            }}
        >
            <div class={styles.toastBody}>
                <div class={styles.toastMessage}>{access(props.toast).value.message}</div>

                <div class={styles.toastMeta} aria-hidden>
                    {access(props.state).index + POSITION_OFFSET} of {access(props.state).count}
                    {access(props.toast).durationMs === undefined && " · stays until dismissed"}
                    {access(props.state).isPaused && " · paused"}
                </div>
            </div>

            <Button
                renderContent={(getFlags) => <PageButtonContent flags={getFlags}>Close</PageButtonContent>}
                onClick={props.onDismiss}
            />

            <Show when={access(props.toast).durationMs}>
                {(getDurationMs) => (
                    <div
                        class={styles.toastCountdown}
                        data-countdown
                        style={{
                            "animation-duration": `${getDurationMs()}ms`,
                            "animation-play-state": access(props.state).isPaused ? "paused" : "running",
                        }}
                    />
                )}
            </Show>
        </div>
    );
};
