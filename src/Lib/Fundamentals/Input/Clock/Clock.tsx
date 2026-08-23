import type { Accessor } from "solid-js";
import { Index, createEffect, createMemo, createSignal, createUniqueId } from "solid-js";

import { TimeUtils } from "@thewaver/ss-utils";
import type { TimeValue } from "@thewaver/ss-utils";

import { NavigationUtils } from "../../../Abstracts/Navigation/Navigation.utils";
import { access } from "../../../Utils/propUtils";
import { InteractionWrapper } from "../../InteractionWrapper/InteractionWrapper";
import type { ClockFlags, ClockOption, ClockOptionProps, ClockProps, ClockSteps, ClockUnit } from "./Clock.types";
import { ClockUtils } from "./Clock.utils";

import * as styles from "./Clock.css";

const DEFAULT_CLOCK_GAP = 0;
const DEFAULT_CLOCK_STEP = 1;
const NO_CLOCK_STEPS: ClockSteps = {};
const SELECT_KEYS = ["Enter", " "];
const LABEL_DIGITS = 2;

type ClockColumn = {
    unit: ClockUnit;
    readings: number[];
    options: ClockOption[];
};

const fromDate = (date: Date): TimeValue => ({
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
});

const ClockOptionControl = (props: ClockOptionProps) => {
    const getIsDisabled = () => access(props.flags).isDisabled ?? false;

    return (
        <div
            id={access(props.id)}
            ref={(element) => props.ref?.(element)}
            class={styles.clockOption}
            role="option"
            aria-label={access(props.ariaLabel)}
            aria-selected={access(props.flags).isSelected}
            aria-current={access(props.flags).isNow ? "time" : undefined}
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

export const Clock = (props: ClockProps) => {
    const groupId = createUniqueId();

    const [getRootRef, setRootRef] = createSignal<HTMLElement>();
    const [getOptionRefs, setOptionRefs] = createSignal<Record<string, HTMLElement | undefined>>({});
    const [getHighlighted, setHighlighted] = createSignal<TimeValue | undefined>();
    const [getHighlightedUnit, setHighlightedUnit] = createSignal<ClockUnit | undefined>();

    const getIsTwelveHour = createMemo(() => access(props.isTwelveHour) ?? false);

    const getHasSeconds = createMemo(() => access(props.hasSeconds) ?? false);

    const getGap = () => `${access(props.gap) ?? DEFAULT_CLOCK_GAP}px`;

    const getNow = createMemo(() => access(props.now) ?? fromDate(new Date()));

    const withShape = (time: TimeValue) => (getHasSeconds() ? { ...time, second: time.second ?? 0 } : time);

    const getBase = createMemo(() =>
        withShape(props.valueSignal[0]() ?? TimeUtils.clamp(getNow(), access(props.min), access(props.max))),
    );

    const getUnits = createMemo<ClockUnit[]>(() => {
        const units: ClockUnit[] = ["hour", "minute"];

        if (getHasSeconds()) units.push("second");
        if (getIsTwelveHour()) units.push("meridiem");

        return units;
    });

    const getMeridiemNames = createMemo(() => ClockUtils.getMeridiemNames(access(props.locale)));

    const getColumns = createMemo<ClockColumn[]>(() => {
        const isTwelveHour = getIsTwelveHour();
        const base = getBase();
        const steps = access(props.steps) ?? NO_CLOCK_STEPS;
        const meridiemNames = getMeridiemNames();

        return getUnits().map((unit) => {
            const step = unit === "meridiem" ? DEFAULT_CLOCK_STEP : (steps[unit] ?? DEFAULT_CLOCK_STEP);
            const readings = ClockUtils.getReadings(unit, isTwelveHour, step);

            return {
                unit,
                readings,
                options: readings.map((reading) => ({
                    unit,
                    time: ClockUtils.withReading(unit, reading, base, isTwelveHour),
                    label:
                        unit === "meridiem"
                            ? meridiemNames[ClockUtils.MERIDIEMS[reading]]
                            : String(reading).padStart(LABEL_DIGITS, "0"),
                })),
            };
        });
    });

    const getRovingTime = createMemo(() => getHighlighted() ?? getBase());

    const getRovingUnit = createMemo(() => {
        const unit = getHighlightedUnit();
        const units = getUnits();

        return unit && units.includes(unit) ? unit : units[0];
    });

    const getRovingIndex = (column: ClockColumn) =>
        ClockUtils.getNearestIndex(
            column.readings,
            ClockUtils.getReading(column.unit, getRovingTime(), getIsTwelveHour()),
        );

    const getIsTimeDisabled = (time: TimeValue) =>
        (access(props.isDisabled) ?? false) ||
        !TimeUtils.getIsInRange(time, access(props.min), access(props.max)) ||
        (props.computeIsTimeDisabled?.(time) ?? false);

    const setOptionRef = (unit: ClockUnit, index: number, element: HTMLElement) => {
        setOptionRefs((prev) => ({ ...prev, [`${unit}:${index}`]: element }));
    };

    const pick = (option: ClockOption) => {
        if (getIsTimeDisabled(option.time)) return;

        setHighlighted(() => option.time);
        setHighlightedUnit(option.unit);
        props.valueSignal[1](() => option.time);
    };

    createEffect(() => {
        const value = props.valueSignal[0]();

        if (!value) return;

        setHighlighted(() => value);
    });

    createEffect(() => {
        const refs = getOptionRefs();

        getColumns().forEach((column) => {
            refs[`${column.unit}:${getRovingIndex(column)}`]?.scrollIntoView({ block: "nearest" });
        });
    });

    createEffect(() => {
        const column = getColumns().find((candidate) => candidate.unit === getRovingUnit());
        const element = column && getOptionRefs()[`${column.unit}:${getRovingIndex(column)}`];
        const root = getRootRef();

        if (!element || !root?.contains(document.activeElement) || root === document.activeElement) return;

        element.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
        const columns = getColumns();
        const unitIndex = columns.findIndex((column) => column.unit === getRovingUnit());
        const column = columns[unitIndex];

        if (!column) return;

        const index = getRovingIndex(column);

        if (SELECT_KEYS.includes(e.key)) {
            e.preventDefault();
            pick(column.options[index]);

            return;
        }

        const nextIndex = NavigationUtils.computeNextPosition(e.key, index, column.readings.length, {
            orientation: "column",
        });

        if (nextIndex !== undefined) {
            e.preventDefault();
            setHighlighted(() =>
                ClockUtils.withReading(column.unit, column.readings[nextIndex], getRovingTime(), getIsTwelveHour()),
            );

            return;
        }

        const nextUnitIndex = NavigationUtils.computeNextPosition(e.key, unitIndex, columns.length, {
            orientation: "row",
            hasEdgeKeys: false,
        });

        if (nextUnitIndex === undefined) return;

        e.preventDefault();
        setHighlightedUnit(columns[nextUnitIndex].unit);
    };

    const renderOptions = (getColumn: Accessor<ClockColumn>) => (
        <Index each={getColumn().options}>
            {(getOption, optionIndex) => {
                const getIsHighlighted = () =>
                    getColumn().unit === getRovingUnit() && optionIndex === getRovingIndex(getColumn());

                const getIsAt = (time: TimeValue | undefined) =>
                    time !== undefined &&
                    ClockUtils.getReading(getColumn().unit, time, getIsTwelveHour()) ===
                        getColumn().readings[optionIndex];

                return (
                    <InteractionWrapper
                        sizing={"fill"}
                        isDisabled={() => getIsTimeDisabled(getOption().time)}
                        isTabbable={getIsHighlighted}
                        extraFlags={(): ClockFlags => ({
                            option: getOption(),
                            isSelected: getIsAt(props.valueSignal[0]()),
                            isNow: getIsAt(getNow()),
                            isHighlighted: getIsHighlighted(),
                        })}
                        ref={(element) => setOptionRef(getColumn().unit, optionIndex, element)}
                        renderControl={(setElementRef, getFlags) => (
                            <ClockOptionControl
                                ref={setElementRef}
                                id={() => `${groupId}-${getColumn().unit}-${optionIndex}`}
                                flags={getFlags}
                                ariaLabel={() => getOption().label}
                                renderContent={(getOptionFlags) => props.renderOption(getOption, getOptionFlags)}
                                onSelect={() => pick(getOption())}
                            />
                        )}
                    />
                );
            }}
        </Index>
    );

    return (
        <div
            ref={setRootRef}
            id={groupId}
            class={styles.clockRoot}
            style={{ gap: getGap() }}
            role="group"
            aria-label={access(props.ariaLabel)}
            aria-disabled={access(props.isDisabled) || undefined}
            onKeyDown={handleKeyDown}
        >
            <Index each={getColumns()}>
                {(getColumn) => {
                    const getUnit = createMemo(() => getColumn().unit);
                    const getName = createMemo(() => ClockUtils.getUnitName(getUnit(), access(props.locale)));

                    return (
                        <div class={styles.clockColumn}>
                            <div class={styles.clockUnit} aria-hidden>
                                {props.renderUnit?.(getName(), getUnit())}
                            </div>

                            <div
                                class={styles.clockList}
                                style={{ gap: getGap() }}
                                role="listbox"
                                aria-label={getName()}
                                aria-disabled={access(props.isDisabled) || undefined}
                            >
                                {props.renderColumn?.(() => renderOptions(getColumn), getUnit()) ??
                                    renderOptions(getColumn)}
                            </div>
                        </div>
                    );
                }}
            </Index>
        </div>
    );
};
