import { Index, type JSX, Show, createMemo } from "solid-js";
import { Dynamic } from "solid-js/web";

import { InteractionWrapper } from "../InteractionWrapper/InteractionWrapper";
import type { BreadcrumbsItemProps, BreadcrumbsProps } from "./Breadcrumbs.types";

import * as styles from "./Breadcrumbs.css";

const DEFAULT_BREADCRUMBS_GAP = 0;

const BreadcrumbsItem = <T,>(props: BreadcrumbsItemProps<T>) => {
    const getIsDisabled = () => props.getFlags().isDisabled ?? false;

    const handleClick = (e: MouseEvent) => {
        if (getIsDisabled()) {
            e.preventDefault();
            return;
        }

        props.onSelect(props.getCrumb().value);
    };

    const commonProps: Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> = {
        "class": styles.breadcrumbsItem,
        get "id"() {
            return props.getCrumb().id;
        },
        get "aria-disabled"() {
            return getIsDisabled() || undefined;
        },
    };

    return (
        <Show
            when={!props.getFlags().isCurrent}
            fallback={
                <span
                    ref={(element) => props.ref?.(element)}
                    class={styles.breadcrumbsItem}
                    id={props.getCrumb().id}
                    aria-current="page"
                >
                    {props.renderContent(props.getFlags)}
                </span>
            }
        >
            <Show
                when={props.getCrumb().href}
                fallback={
                    <button
                        type="button"
                        ref={(element) => props.ref?.(element)}
                        {...commonProps}
                        onClick={handleClick}
                    >
                        {props.renderContent(props.getFlags)}
                    </button>
                }
            >
                <Dynamic
                    component={props.linkComponent ?? "a"}
                    ref={(element: HTMLElement) => props.ref?.(element)}
                    href={props.getCrumb().href!}
                    {...commonProps}
                    onClick={handleClick}
                >
                    {props.renderContent(props.getFlags)}
                </Dynamic>
            </Show>
        </Show>
    );
};

export const Breadcrumbs = <T,>(props: BreadcrumbsProps<T>) => {
    const getLastIndex = createMemo(() => props.getCrumbs().length - 1);

    return (
        <nav class={styles.breadcrumbsRoot} aria-label={props.getAriaLabel?.()}>
            <ol class={styles.breadcrumbsList} style={{ gap: `${props.getGap?.() ?? DEFAULT_BREADCRUMBS_GAP}px` }}>
                <Index each={props.getCrumbs()}>
                    {(getCrumb, index) => (
                        <li class={styles.breadcrumbsEntry}>
                            <InteractionWrapper
                                getIsDisabled={() => getCrumb().isDisabled ?? false}
                                getExtraFlags={() => ({ isCurrent: index === getLastIndex() })}
                                renderControl={(setElementRef, getFlags) => (
                                    <BreadcrumbsItem
                                        ref={setElementRef}
                                        getCrumb={getCrumb}
                                        getFlags={getFlags}
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
