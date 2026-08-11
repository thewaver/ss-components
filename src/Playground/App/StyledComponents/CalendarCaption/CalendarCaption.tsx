import { Show, createEffect, createMemo, createSignal, onCleanup } from "solid-js";

import { FunctionUtils } from "@thewaver/ss-utils";

import type { DateValue } from "../../../../Lib/Abstracts/DateValue/DateValue.types";
import { DateValueUtils } from "../../../../Lib/Abstracts/DateValue/DateValue.utils";
import { FocusUtils } from "../../../../Lib/Abstracts/Focus/Focus.utils";
import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import { PageCalendarHeader, PageCalendarTitle } from "../../StyledComponents/CalendarContent/CalendarContent";
import { PageNumberField, PageSelectField } from "../Field/Field";
import type { PageCalendarCaptionProps } from "./CalendarCaption.types";

import * as styles from "./CalendarCaption.css";

const MONTHS_PER_YEAR = 12;
const MONTH_STEP = 1;
const MONTH_FIELD_WIDTH = 122;
const YEAR_FIELD_WIDTH = 80;
const YEAR_SETTLE_MS = 300;
const MONTH_VALUES = Array.from({ length: MONTHS_PER_YEAR }, (_, index) => index + 1);
const TITLE_OPTIONS: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" };

export const PageCalendarCaption = (props: PageCalendarCaptionProps) => {
    const [getIsEditing, setIsEditing] = createSignal(false);
    const [getIsRestoringFocus, setIsRestoringFocus] = createSignal(false);
    const [getTitleRef, setTitleRef] = createSignal<HTMLElement>();
    const [getFieldsRef, setFieldsRef] = createSignal<HTMLElement>();

    let restorePoint: DateValue | undefined;
    let pendingYear: number | undefined;

    const getMonth = () => props.monthSignal[0]();

    const getMonthNames = createMemo(() => DateValueUtils.getMonthNames(props.getLocale?.()));

    const getTitle = () => DateValueUtils.format(getMonth(), TITLE_OPTIONS, props.getLocale?.());

    const jumpTo = (value: Partial<DateValue>) => {
        props.monthSignal[1]({ year: getMonth().year, month: getMonth().month, day: 1, ...value });
    };

    const page = (direction: 1 | -1) => {
        props.monthSignal[1]((prev) => DateValueUtils.addMonths(prev, direction * MONTH_STEP));
    };

    const writeYear = FunctionUtils.debounce((year: number) => {
        pendingYear = undefined;
        jumpTo({ year });
    }, YEAR_SETTLE_MS);

    const queueYear = (year: number) => {
        if (!getIsEditing()) return;

        pendingYear = year;
        writeYear(year);
    };

    const settleYear = () => {
        writeYear.cancel();

        if (pendingYear === undefined) return;

        jumpTo({ year: pendingYear });
        pendingYear = undefined;
    };

    const startEditing = () => {
        restorePoint = getMonth();
        setIsEditing(true);
    };

    const stopEditing = (restoreFocus: boolean) => {
        settleYear();
        setIsRestoringFocus(restoreFocus);
        setIsEditing(false);
    };

    const abandonEditing = () => {
        writeYear.cancel();
        pendingYear = undefined;

        setIsRestoringFocus(true);
        setIsEditing(false);

        if (restorePoint) props.monthSignal[1](restorePoint);
    };

    createEffect(() => {
        if (getIsEditing()) {
            FocusUtils.getFirstFocusableChild(getFieldsRef())?.focus();

            return;
        }

        const ref = getTitleRef();

        if (!getIsRestoringFocus() || !ref?.isConnected) return;

        setIsRestoringFocus(false);
        ref.focus();
    });

    onCleanup(writeYear.cancel);

    return (
        <PageCalendarHeader>
            <Button
                getAriaLabel={() => "Previous month"}
                renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>◀</PageButtonContent>}
                onClick={() => page(-1)}
            />

            <Show
                when={getIsEditing()}
                fallback={
                    <Button
                        ref={setTitleRef}
                        getAriaLabel={() => `${getTitle()}, pick a month and year`}
                        renderContent={(getFlags) => (
                            <PageCalendarTitle getFlags={getFlags}>{getTitle()}</PageCalendarTitle>
                        )}
                        onClick={startEditing}
                    />
                }
            >
                <div
                    ref={setFieldsRef}
                    class={styles.calendarCaptionFields}
                    onKeyDown={(e) => {
                        if (e.defaultPrevented) return;

                        if (e.key === "Enter") {
                            e.preventDefault();
                            stopEditing(true);
                        } else if (e.key === "Escape") {
                            e.preventDefault();
                            abandonEditing();
                        }
                    }}
                    onFocusOut={(e) => {
                        if (!getIsEditing()) return;
                        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;

                        stopEditing(false);
                    }}
                >
                    <PageSelectField
                        getValue={() => getMonth().month}
                        getValues={() => MONTH_VALUES}
                        getWidth={() => MONTH_FIELD_WIDTH}
                        getAriaLabel={() => "Month"}
                        computeLabel={(month) => getMonthNames()[month - 1]}
                        onChange={(month) => jumpTo({ month })}
                    />

                    <PageNumberField
                        getValue={() => getMonth().year}
                        getWidth={() => YEAR_FIELD_WIDTH}
                        getAriaLabel={() => "Year"}
                        onInput={queueYear}
                    />
                </div>
            </Show>

            <Button
                getAriaLabel={() => "Next month"}
                renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>▶</PageButtonContent>}
                onClick={() => page(1)}
            />
        </PageCalendarHeader>
    );
};
