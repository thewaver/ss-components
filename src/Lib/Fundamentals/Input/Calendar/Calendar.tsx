import { Index, createEffect, createMemo, createSignal, createUniqueId } from "solid-js";

import type {
    DateValue,
    DateValueWeekStart,
    DateValueWeekdayWidth,
} from "../../../Abstracts/DateValue/DateValue.types";
import { DateValueUtils } from "../../../Abstracts/DateValue/DateValue.utils";
import { LiveAnnouncer } from "../../../Abstracts/LiveAnnouncer/LiveAnnouncer";
import { NavigationUtils } from "../../../Abstracts/Navigation/Navigation.utils";
import { access } from "../../../Utils/propUtils";
import { InteractionWrapper } from "../../InteractionWrapper/InteractionWrapper";
import type { CalendarCompositeProps, CalendarDayProps, CalendarFlags, CalendarProps } from "./Calendar.types";

import * as styles from "./Calendar.css";

const DEFAULT_CALENDAR_WEEK_STARTS_ON: DateValueWeekStart = 1;
const DEFAULT_CALENDAR_WEEKDAY_WIDTH: DateValueWeekdayWidth = "short";
const DEFAULT_CALENDAR_GAP = 0;
const DAYS_PER_WEEK = 7;
const GRID_WEEKS = 6;
const MONTH_STEP = 1;
const YEAR_STEP = 1;
const SELECT_KEYS = ["Enter", " "];

const DAY_LABEL_OPTIONS: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
const MONTH_ANNOUNCE_OPTIONS: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" };
const PAST_ERA_DAY_LABEL_OPTIONS: Intl.DateTimeFormatOptions = { ...DAY_LABEL_OPTIONS, era: "short" };
const PAST_ERA_MONTH_ANNOUNCE_OPTIONS: Intl.DateTimeFormatOptions = { ...MONTH_ANNOUNCE_OPTIONS, era: "short" };

const CalendarDay = (props: CalendarDayProps) => {
    const getIsDisabled = () => access(props.flags).isDisabled ?? false;

    return (
        <div
            id={access(props.id)}
            ref={(element) => props.ref?.(element)}
            class={styles.calendarDay}
            role="gridcell"
            aria-label={access(props.ariaLabel)}
            aria-selected={access(props.flags).isSelected}
            aria-current={access(props.flags).isToday ? "date" : undefined}
            aria-disabled={getIsDisabled() || undefined}
            onClick={() => {
                if (getIsDisabled()) return;

                props.onSelect();
            }}
        >
            {props.renderContent(() => access(props.flags))}
        </div>
    );
};

export const CalendarComposite = (props: CalendarCompositeProps) => {
    const gridId = createUniqueId();

    const [getRootRef, setRootRef] = createSignal<HTMLElement>();
    const [getDayRefs, setDayRefs] = createSignal<(HTMLElement | undefined)[]>([]);
    const [getHighlighted, setHighlighted] = createSignal<DateValue | undefined>();

    const getWeekStartsOn = createMemo(() => access(props.weekStartsOn) ?? DEFAULT_CALENDAR_WEEK_STARTS_ON);

    const getMonth = createMemo(() => props.monthSignal[0]());

    const getToday = createMemo(() =>
        DateValueUtils.withCalendar(
            access(props.today) ?? DateValueUtils.fromDate(new Date()),
            DateValueUtils.getCalendarId(getMonth()),
        ),
    );

    const getGrid = createMemo(() => DateValueUtils.getMonthGrid(getMonth(), getWeekStartsOn()));

    const getCurrentEraId = createMemo(() => {
        const eras = DateValueUtils.getEras(getMonth(), access(props.locale));

        return eras[eras.length - 1].id;
    });

    const getDayLabelOptions = (day: DateValue) =>
        day.era === getCurrentEraId() ? DAY_LABEL_OPTIONS : PAST_ERA_DAY_LABEL_OPTIONS;

    const getGridStart = createMemo(() => getGrid().weeks[0][0]);

    const getWeekdayNames = createMemo(() =>
        DateValueUtils.getWeekdayNames(
            getWeekStartsOn(),
            access(props.weekdayWidth) ?? DEFAULT_CALENDAR_WEEKDAY_WIDTH,
            access(props.locale),
        ),
    );

    const getIsDayDisabled = (day: DateValue) =>
        (access(props.isDisabled) ?? false) ||
        !DateValueUtils.getIsInRange(day, access(props.min), access(props.max)) ||
        (props.computeIsDayDisabled?.(day) ?? false);

    const getRovingDay = createMemo(() => {
        const highlighted = getHighlighted();

        if (highlighted && DateValueUtils.getCellOf(getGrid(), highlighted)) return highlighted;

        const anchor = props.computeAnchorDay?.();

        if (anchor && DateValueUtils.getCellOf(getGrid(), anchor)) return anchor;

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
        const clamped = DateValueUtils.clamp(day, access(props.min), access(props.max));

        const month = DateValueUtils.getStartOfMonth(clamped);

        setHighlighted(() => clamped);

        if (!DateValueUtils.isSame(month, DateValueUtils.getStartOfMonth(getMonth()))) {
            props.monthSignal[1](() => month);
        }
    };

    const pickDay = (day: DateValue) => {
        if (getIsDayDisabled(day)) return;

        setHighlighted(() => day);
        props.onPick(day);
    };

    const getPaintedRange = createMemo(() => props.computeRange?.(getRovingDay()));

    createEffect(() => {
        const anchor = props.computeAnchorDay?.();

        if (!anchor) return;

        setHighlighted(() => anchor);
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
                    access(props.locale),
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
            const direction = e.key === "PageUp" ? -1 : 1;

            e.preventDefault();
            moveTo(
                e.shiftKey
                    ? DateValueUtils.addYears(roving, direction * YEAR_STEP)
                    : DateValueUtils.addMonths(roving, direction * MONTH_STEP),
            );

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
            style={{ gap: `${access(props.gap) ?? DEFAULT_CALENDAR_GAP}px` }}
            role="grid"
            aria-label={access(props.ariaLabel)}
            aria-disabled={access(props.isDisabled) || undefined}
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
                                    sizing={"fill"}
                                    isDisabled={() => getIsDayDisabled(getDay())}
                                    isTabbable={() => DateValueUtils.isSame(getDay(), getRovingDay())}
                                    extraFlags={(): CalendarFlags => ({
                                        day: getDay(),
                                        isSelected: props.computeIsSelected(getDay()),
                                        isToday: DateValueUtils.isSame(getDay(), getToday()),
                                        isOutsideMonth: getDay().month !== getMonth().month,
                                        isHighlighted: DateValueUtils.isSame(getDay(), getRovingDay()),
                                        isInRange: DateValueUtils.getIsWithin(getDay(), getPaintedRange()),
                                        isRangeStart: DateValueUtils.isSame(getDay(), getPaintedRange()?.start),
                                        isRangeEnd: DateValueUtils.isSame(getDay(), getPaintedRange()?.end),
                                    })}
                                    ref={(element) => setDayRef(weekIndex * DAYS_PER_WEEK + dayIndex, element)}
                                    renderControl={(setElementRef, getFlags) => (
                                        <CalendarDay
                                            ref={setElementRef}
                                            id={() => `${gridId}-day-${DateValueUtils.toIso(getDay())}`}
                                            flags={getFlags}
                                            ariaLabel={() =>
                                                DateValueUtils.format(
                                                    getDay(),
                                                    getDayLabelOptions(getDay()),
                                                    access(props.locale),
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

export const Calendar = (props: CalendarProps) => (
    <CalendarComposite
        {...props}
        computeIsSelected={(day) => DateValueUtils.isSame(day, props.valueSignal[0]())}
        computeAnchorDay={() => props.valueSignal[0]()}
        onPick={(day) => props.valueSignal[1](() => day)}
    />
);
