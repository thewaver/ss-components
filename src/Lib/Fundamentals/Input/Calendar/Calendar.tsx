import { Index, createEffect, createMemo, createSignal, createUniqueId } from "solid-js";

import type {
    DateValue,
    DateValueWeekStart,
    DateValueWeekdayWidth,
} from "../../../Abstracts/DateValue/DateValue.types";
import { DateValueUtils } from "../../../Abstracts/DateValue/DateValue.utils";
import { LiveAnnouncer } from "../../../Abstracts/LiveAnnouncer/LiveAnnouncer";
import { NavigationUtils } from "../../../Abstracts/Navigation/Navigation.utils";
import { InteractionWrapper } from "../../InteractionWrapper/InteractionWrapper";
import type { CalendarDayProps, CalendarFlags, CalendarProps } from "./Calendar.types";

import * as styles from "./Calendar.css";

const DEFAULT_CALENDAR_WEEK_STARTS_ON: DateValueWeekStart = 1;
const DEFAULT_CALENDAR_WEEKDAY_WIDTH: DateValueWeekdayWidth = "short";
const DEFAULT_CALENDAR_GAP = 0;
const DAYS_PER_WEEK = 7;
const GRID_WEEKS = 6;
const MONTH_STEP = 1;
const SELECT_KEYS = ["Enter", " "];

const DAY_LABEL_OPTIONS: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
const MONTH_ANNOUNCE_OPTIONS: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" };
const PAST_ERA_DAY_LABEL_OPTIONS: Intl.DateTimeFormatOptions = { ...DAY_LABEL_OPTIONS, era: "short" };
const PAST_ERA_MONTH_ANNOUNCE_OPTIONS: Intl.DateTimeFormatOptions = { ...MONTH_ANNOUNCE_OPTIONS, era: "short" };

const CalendarDay = (props: CalendarDayProps) => {
    const getIsDisabled = () => props.getFlags().isDisabled ?? false;

    return (
        <div
            id={props.getId?.()}
            ref={(element) => props.ref?.(element)}
            class={styles.calendarDay}
            role="gridcell"
            aria-label={props.getAriaLabel()}
            aria-selected={props.getFlags().isSelected}
            aria-current={props.getFlags().isToday ? "date" : undefined}
            aria-disabled={getIsDisabled() || undefined}
            onClick={() => {
                if (getIsDisabled()) return;

                props.onSelect();
            }}
        >
            {props.renderContent(props.getFlags)}
        </div>
    );
};

export const Calendar = (props: CalendarProps) => {
    const gridId = createUniqueId();

    const [getRootRef, setRootRef] = createSignal<HTMLElement>();
    const [getDayRefs, setDayRefs] = createSignal<(HTMLElement | undefined)[]>([]);
    const [getHighlighted, setHighlighted] = createSignal<DateValue | undefined>();

    const getWeekStartsOn = createMemo(() => props.getWeekStartsOn?.() ?? DEFAULT_CALENDAR_WEEK_STARTS_ON);

    const getMonth = createMemo(() => props.monthSignal[0]());

    const getToday = createMemo(() =>
        DateValueUtils.withCalendar(
            props.getToday?.() ?? DateValueUtils.fromDate(new Date()),
            DateValueUtils.getCalendarId(getMonth()),
        ),
    );

    const getGrid = createMemo(() => DateValueUtils.getMonthGrid(getMonth(), getWeekStartsOn()));

    const getCurrentEraId = createMemo(() => {
        const eras = DateValueUtils.getEras(getMonth(), props.getLocale?.());

        return eras[eras.length - 1].id;
    });

    const getDayLabelOptions = (day: DateValue) =>
        day.era === getCurrentEraId() ? DAY_LABEL_OPTIONS : PAST_ERA_DAY_LABEL_OPTIONS;

    const getGridStart = createMemo(() => getGrid().weeks[0][0]);

    const getWeekdayNames = createMemo(() =>
        DateValueUtils.getWeekdayNames(
            getWeekStartsOn(),
            props.getWeekdayWidth?.() ?? DEFAULT_CALENDAR_WEEKDAY_WIDTH,
            props.getLocale?.(),
        ),
    );

    const getIsDayDisabled = (day: DateValue) =>
        (props.getIsDisabled?.() ?? false) ||
        !DateValueUtils.getIsInRange(day, props.getMin?.(), props.getMax?.()) ||
        (props.computeIsDayDisabled?.(day) ?? false);

    const getRovingDay = createMemo(() => {
        const highlighted = getHighlighted();

        if (highlighted && DateValueUtils.getCellOf(getGrid(), highlighted)) return highlighted;

        const value = props.valueSignal[0]();

        if (value && DateValueUtils.getCellOf(getGrid(), value)) return value;

        const today = getToday();

        if (DateValueUtils.getCellOf(getGrid(), today)) return today;

        return DateValueUtils.getStartOfMonth(getMonth());
    });

    const setDayRef = (index: number, element: HTMLElement) => {
        setDayRefs((prev) => {
            const next = [...prev];

            next[index] = element;

            return next;
        });
    };

    const moveTo = (day: DateValue) => {
        const clamped = DateValueUtils.clamp(day, props.getMin?.(), props.getMax?.());

        const month = DateValueUtils.getStartOfMonth(clamped);

        setHighlighted(() => clamped);

        if (!DateValueUtils.isSame(month, DateValueUtils.getStartOfMonth(getMonth()))) {
            props.monthSignal[1](() => month);
        }
    };

    const pickDay = (day: DateValue) => {
        if (getIsDayDisabled(day)) return;

        setHighlighted(() => day);
        props.valueSignal[1](() => day);
    };

    createEffect(() => {
        const value = props.valueSignal[0]();

        if (!value) return;

        setHighlighted(() => value);
    });

    createEffect<DateValue | undefined>((previous) => {
        const month = getMonth();

        if (
            previous &&
            !DateValueUtils.isSame(DateValueUtils.getStartOfMonth(previous), DateValueUtils.getStartOfMonth(month))
        ) {
            LiveAnnouncer.announce(
                DateValueUtils.format(
                    month,
                    month.era === getCurrentEraId() ? MONTH_ANNOUNCE_OPTIONS : PAST_ERA_MONTH_ANNOUNCE_OPTIONS,
                    props.getLocale?.(),
                ),
            );
        }

        return month;
    });

    createEffect(() => {
        const cell = DateValueUtils.getCellOf(getGrid(), getRovingDay());
        const root = getRootRef();

        if (!cell || !root?.contains(document.activeElement) || root === document.activeElement) return;

        getDayRefs()[cell.y * DAYS_PER_WEEK + cell.x]?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
        const roving = getRovingDay();

        if (SELECT_KEYS.includes(e.key)) {
            e.preventDefault();
            pickDay(roving);

            return;
        }

        if (e.key === "PageUp" || e.key === "PageDown") {
            e.preventDefault();
            moveTo(DateValueUtils.addMonths(roving, e.key === "PageUp" ? -MONTH_STEP : MONTH_STEP));

            return;
        }

        const cell = DateValueUtils.getCellOf(getGrid(), roving);

        if (!cell) return;

        const next = NavigationUtils.computeNextCell(
            e.key,
            cell,
            { width: DAYS_PER_WEEK, height: GRID_WEEKS },
            { hasPageKeys: false },
        );

        if (!next) return;

        e.preventDefault();
        moveTo(DateValueUtils.addDays(getGridStart(), next.y * DAYS_PER_WEEK + next.x));
    };

    return (
        <div
            ref={setRootRef}
            id={gridId}
            class={styles.calendarRoot}
            style={{ gap: `${props.getGap?.() ?? DEFAULT_CALENDAR_GAP}px` }}
            role="grid"
            aria-label={props.getAriaLabel?.()}
            aria-disabled={props.getIsDisabled?.() || undefined}
            onKeyDown={handleKeyDown}
        >
            <div class={styles.calendarRow} role="row">
                <Index each={getWeekdayNames()}>
                    {(getName, index) => (
                        <div class={styles.calendarWeekday} role="columnheader" aria-label={getName()}>
                            {props.renderWeekday?.(getName(), index)}
                        </div>
                    )}
                </Index>
            </div>

            <Index each={getGrid().weeks}>
                {(getWeek, weekIndex) => (
                    <div class={styles.calendarRow} role="row">
                        <Index each={getWeek()}>
                            {(getDay, dayIndex) => (
                                <InteractionWrapper
                                    getSizing={() => "fill"}
                                    getIsDisabled={() => getIsDayDisabled(getDay())}
                                    getIsTabbable={() => DateValueUtils.isSame(getDay(), getRovingDay())}
                                    getExtraFlags={(): CalendarFlags => ({
                                        day: getDay(),
                                        isSelected: DateValueUtils.isSame(getDay(), props.valueSignal[0]()),
                                        isToday: DateValueUtils.isSame(getDay(), getToday()),
                                        isOutsideMonth: getDay().month !== getMonth().month,
                                        isHighlighted: DateValueUtils.isSame(getDay(), getRovingDay()),
                                    })}
                                    ref={(element) => setDayRef(weekIndex * DAYS_PER_WEEK + dayIndex, element)}
                                    renderControl={(setElementRef, getFlags) => (
                                        <CalendarDay
                                            ref={setElementRef}
                                            getId={() => `${gridId}-day-${DateValueUtils.toIso(getDay())}`}
                                            getFlags={getFlags}
                                            getAriaLabel={() =>
                                                DateValueUtils.format(
                                                    getDay(),
                                                    getDayLabelOptions(getDay()),
                                                    props.getLocale?.(),
                                                )
                                            }
                                            renderContent={(getDayFlags) => props.renderDay(getDay, getDayFlags)}
                                            onSelect={() => pickDay(getDay())}
                                        />
                                    )}
                                />
                            )}
                        </Index>
                    </div>
                )}
            </Index>
        </div>
    );
};
