import { Index, type JSX, Show, createMemo } from "solid-js";
import { Dynamic } from "solid-js/web";

import { access } from "../../Utils/propUtils";
import { InteractionWrapper } from "../InteractionWrapper/InteractionWrapper";
import type { BreadcrumbsItemProps, BreadcrumbsProps } from "./Breadcrumbs.types";

import * as styles from "./Breadcrumbs.css";

const DEFAULT_BREADCRUMBS_GAP = 0;

const BreadcrumbsItem = <T,>(props: BreadcrumbsItemProps<T>) => {
    const getIsDisabled = () => access(props.flags).isDisabled ?? false;

    const handleClick = (e: MouseEvent) => {
        if (getIsDisabled()) {
            e.preventDefault();
            return;
        }

        props.onSelect(access(props.crumb).value);
    };

    const commonProps: Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> = {
        "class": styles.breadcrumbsItem,
        get "id"() {
            return access(props.crumb).id;
        },
        get "aria-disabled"() {
            return getIsDisabled() || undefined;
        },
    };

    return (
        <Show
            when={!access(props.flags).isCurrent}
            fallback={
                <span
                    ref={(element) => props.ref?.(element)}
                    class={styles.breadcrumbsItem}
                    id={access(props.crumb).id}
                    aria-current="page"
                >
                    {props.renderContent(() => access(props.flags))}
                </span>
            }
        >
            <Show
                when={access(props.crumb).href}
                fallback={
                    <button
                        type="button"
                        ref={(element) => props.ref?.(element)}
                        {...commonProps}
                        onClick={handleClick}
                    >
                        {props.renderContent(() => access(props.flags))}
                    </button>
                }
            >
                <Dynamic
                    component={props.linkComponent ?? "a"}
                    ref={(element: HTMLElement) => props.ref?.(element)}
                    href={access(props.crumb).href!}
                    {...commonProps}
                    onClick={handleClick}
                >
                    {props.renderContent(() => access(props.flags))}
                </Dynamic>
            </Show>
        </Show>
    );
};

export const Breadcrumbs = <T,>(props: BreadcrumbsProps<T>) => {
    const getLastIndex = createMemo(() => access(props.crumbs).length - 1);

    return (
        <nav class={styles.breadcrumbsRoot} aria-label={access(props.ariaLabel)}>
            <ol class={styles.breadcrumbsList} style={{ gap: `${access(props.gap) ?? DEFAULT_BREADCRUMBS_GAP}px` }}>
                <Index each={access(props.crumbs)}>
                    {(getCrumb, index) => (
                        <li class={styles.breadcrumbsEntry}>
                            <InteractionWrapper
                                isDisabled={() => getCrumb().isDisabled ?? false}
                                extraFlags={() => ({ isCurrent: index === getLastIndex() })}
                                renderControl={(setElementRef, getFlags) => (
                                    <BreadcrumbsItem
                                        ref={setElementRef}
                                        crumb={getCrumb}
                                        flags={getFlags}
                                        linkComponent={props.linkComponent}
                                        renderContent={(getItemFlags) => props.renderCrumb(getCrumb, getItemFlags)}
                                        onSelect={(value) => props.onSelect?.(value)}
                                    />
                                )}
                            />

                            <Show when={props.renderSeparator && index !== getLastIndex()}>
                                <span class={styles.breadcrumbsSeparator} aria-hidden="true">
                                    {props.renderSeparator!()}
                                </span>
                            </Show>
                        </li>
                    )}
                </Index>
            </ol>
        </nav>
    );
};
