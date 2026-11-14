'use client';

import {
  type KeyboardEvent,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import type { ControlSizingProps } from '../control-sizing';
import styles from './date-picker.module.css';

export interface DatePickerProps extends ControlSizingProps {
  value?: Date | string | null;
  defaultValue?: Date | string | null;
  onChange?: (date: Date | null, isoString: string) => void;
  minDate?: Date | string;
  maxDate?: Date | string;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  clearable?: boolean;
  clearLabel?: string;
  previousMonthLabel?: string;
  nextMonthLabel?: string;
  previousYearLabel?: string;
  nextYearLabel?: string;
  previousYearsLabel?: string;
  nextYearsLabel?: string;
  selectMonthLabel?: string;
  selectYearLabel?: string;
  weekdays?: readonly string[];
  locale?: string;
  formatDate?: (date: Date) => string;
  className?: string;
  'data-testid'?: string;
  id?: string;
  name?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
}

type CalendarView = 'days' | 'months' | 'years';

function normalizeDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDate(val: Date | string | null | undefined): Date | null {
  if (!val) return null;
  if (val instanceof Date) {
    return Number.isNaN(val.getTime()) ? null : normalizeDay(val);
  }
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(val.trim());
  if (isoMatch) {
    const y = Number(isoMatch[1]);
    const m = Number(isoMatch[2]) - 1;
    const d = Number(isoMatch[3]);
    const date = new Date(y, m, d);
    if (
      !Number.isNaN(date.getTime()) &&
      date.getFullYear() === y &&
      date.getMonth() === m &&
      date.getDate() === d
    ) {
      return date;
    }
    return null;
  }
  const parsed = new Date(val);
  return Number.isNaN(parsed.getTime()) ? null : normalizeDay(parsed);
}

function toIsoString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function shiftMonthClamped(date: Date, monthDelta: number): Date {
  const targetYear = date.getFullYear();
  const targetMonth = date.getMonth() + monthDelta;
  const firstOfTarget = new Date(targetYear, targetMonth, 1);
  const lastDayOfTarget = new Date(
    firstOfTarget.getFullYear(),
    firstOfTarget.getMonth() + 1,
    0,
  ).getDate();
  return new Date(
    firstOfTarget.getFullYear(),
    firstOfTarget.getMonth(),
    Math.min(date.getDate(), lastDayOfTarget),
  );
}

function clampToBounds(date: Date, minDate: Date | null, maxDate: Date | null): Date {
  let clamped = normalizeDay(date);
  if (minDate && clamped < minDate) clamped = minDate;
  if (maxDate && clamped > maxDate) clamped = maxDate;
  return clamped;
}

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(function DatePicker(
  {
    value: controlledValue,
    defaultValue,
    onChange,
    minDate: minDateProp,
    maxDate: maxDateProp,
    size,
    touchTarget = 'auto',
    placeholder,
    disabled = false,
    invalid = false,
    clearable = true,
    clearLabel,
    previousMonthLabel,
    nextMonthLabel,
    previousYearLabel,
    nextYearLabel,
    previousYearsLabel,
    nextYearsLabel,
    selectMonthLabel,
    selectYearLabel,
    weekdays: weekdaysProp,
    locale = 'en-US',
    formatDate,
    className,
    'data-testid': testId,
    id: idProp,
    name,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalidProp,
  },
  ref,
) {
  const generatedId = useId();
  const id = idProp || generatedId;
  const dialogId = `${id}-dialog`;

  const [uncontrolledValue, setUncontrolledValue] = useState<Date | null>(() =>
    parseDate(defaultValue),
  );
  const isControlled = controlledValue !== undefined;
  const controlledIso = useMemo(() => {
    const parsed = parseDate(controlledValue);
    return parsed ? toIsoString(parsed) : null;
  }, [controlledValue]);
  const controlledDate = useMemo(
    () => (controlledIso ? parseDate(controlledIso) : null),
    [controlledIso],
  );
  const selectedDate = isControlled ? controlledDate : uncontrolledValue;

  const minDate = useMemo(() => parseDate(minDateProp), [minDateProp]);
  const maxDate = useMemo(() => parseDate(maxDateProp), [maxDateProp]);
  const isInvalid = Boolean(invalid || ariaInvalidProp === true || ariaInvalidProp === 'true');

  const [isOpen, setIsOpen] = useState(false);
  const [calendarView, setCalendarView] = useState<CalendarView>('days');
  const [viewDate, setViewDate] = useState<Date>(() => {
    const initial = selectedDate ?? clampToBounds(new Date(), minDate, maxDate);
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });
  const [yearBlockStart, setYearBlockStart] = useState<number>(
    () => Math.floor(viewDate.getFullYear() / 12) * 12,
  );
  const [focusedDate, setFocusedDate] = useState<Date>(
    () => selectedDate ?? clampToBounds(new Date(), minDate, maxDate),
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const periodGridRef = useRef<HTMLDivElement>(null);
  const pendingGridFocusRef = useRef(false);
  const pendingSubViewFocusRef = useRef<'months' | 'years' | null>(null);

  const today = useMemo(() => normalizeDay(new Date()), []);

  // Keep view and roving cursor aligned only when the committed ISO date changes
  const selectedIso = selectedDate ? toIsoString(selectedDate) : null;
  const prevSelectedIsoRef = useRef<string | null>(selectedIso);
  useEffect(() => {
    if (prevSelectedIsoRef.current !== selectedIso) {
      prevSelectedIsoRef.current = selectedIso;
      if (selectedDate) {
        setViewDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
        setYearBlockStart(Math.floor(selectedDate.getFullYear() / 12) * 12);
        setFocusedDate(selectedDate);
      }
    }
  }, [selectedIso, selectedDate]);

  // Move DOM focus to the active cell on open and during roving grid navigation
  useEffect(() => {
    if (!isOpen || calendarView !== 'days' || !pendingGridFocusRef.current) return;
    const targetIso = toIsoString(focusedDate);
    const cellButton = gridRef.current?.querySelector<HTMLButtonElement>(
      `button[data-date="${targetIso}"]`,
    );
    if (cellButton) {
      cellButton.focus({ preventScroll: true });
    }
    pendingGridFocusRef.current = false;
  }, [isOpen, calendarView, focusedDate, viewDate]);

  // Move DOM focus to active month/year button when entering month or year selection views
  useEffect(() => {
    if (!isOpen || !pendingSubViewFocusRef.current) return;
    const targetView = pendingSubViewFocusRef.current;
    if (targetView === 'months' && calendarView === 'months') {
      const currentMonthBtn = periodGridRef.current?.querySelector<HTMLButtonElement>(
        `button[data-month="${viewDate.getMonth()}"]:not(:disabled)`,
      );
      const fallbackBtn =
        periodGridRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)');
      (currentMonthBtn ?? fallbackBtn)?.focus({ preventScroll: true });
      pendingSubViewFocusRef.current = null;
    } else if (targetView === 'years' && calendarView === 'years') {
      const currentYearBtn = periodGridRef.current?.querySelector<HTMLButtonElement>(
        `button[data-year="${viewDate.getFullYear()}"]:not(:disabled)`,
      );
      const fallbackBtn =
        periodGridRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)');
      (currentYearBtn ?? fallbackBtn)?.focus({ preventScroll: true });
      pendingSubViewFocusRef.current = null;
    }
  }, [isOpen, calendarView, viewDate, yearBlockStart]);

  // Dismiss popup when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen]);

  const formattedValue = useMemo(() => {
    if (!selectedDate) return '';
    if (formatDate) return formatDate(selectedDate);
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(selectedDate);
  }, [selectedDate, formatDate, locale]);

  const monthYearLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
      }).format(viewDate),
    [viewDate, locale],
  );

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'long' }).format(viewDate),
    [viewDate, locale],
  );

  const yearFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { year: 'numeric' }),
    [locale],
  );

  const yearLabel = useMemo(
    () => yearFormatter.format(new Date(viewDate.getFullYear(), 0, 15)),
    [yearFormatter, viewDate],
  );

  const yearRangeLabel = useMemo(
    () =>
      `${yearFormatter.format(new Date(yearBlockStart, 0, 15))} – ${yearFormatter.format(
        new Date(yearBlockStart + 11, 0, 15),
      )}`,
    [yearFormatter, yearBlockStart],
  );

  const weekdayLabels = useMemo<readonly string[]>(() => {
    if (weekdaysProp && weekdaysProp.length === 7) {
      return weekdaysProp;
    }
    const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    // Reference week starting Sunday (2026-11-01 is a Sunday)
    return Array.from({ length: 7 }, (_, idx) => formatter.format(new Date(2026, 10, 1 + idx)));
  }, [weekdaysProp, locale]);

  const dayAriaFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: 'full' }),
    [locale],
  );

  const isDateDisabled = useCallback(
    (d: Date): boolean => {
      if (minDate && d < minDate) return true;
      if (maxDate && d > maxDate) return true;
      return false;
    },
    [minDate, maxDate],
  );

  const isMonthDisabled = useCallback(
    (year: number, month: number): boolean => {
      if (minDate && new Date(year, month + 1, 0) < minDate) return true;
      if (maxDate && new Date(year, month, 1) > maxDate) return true;
      return false;
    },
    [minDate, maxDate],
  );

  const isYearDisabled = useCallback(
    (year: number): boolean => {
      if (minDate && new Date(year, 11, 31) < minDate) return true;
      if (maxDate && new Date(year, 0, 1) > maxDate) return true;
      return false;
    },
    [minDate, maxDate],
  );

  const monthItems = useMemo(() => {
    const shortFormatter = new Intl.DateTimeFormat(locale, { month: 'short' });
    const longFormatter = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
    const year = viewDate.getFullYear();

    return Array.from({ length: 12 }, (_, monthIndex) => {
      const refDate = new Date(year, monthIndex, 15);
      return {
        month: monthIndex,
        shortLabel: shortFormatter.format(refDate),
        ariaLabel: longFormatter.format(refDate),
        disabled: isMonthDisabled(year, monthIndex),
      };
    });
  }, [locale, viewDate, isMonthDisabled]);

  const yearItems = useMemo(() => {
    return Array.from({ length: 12 }, (_, idx) => {
      const year = yearBlockStart + idx;
      return {
        year,
        label: yearFormatter.format(new Date(year, 0, 15)),
        disabled: isYearDisabled(year),
      };
    });
  }, [yearBlockStart, yearFormatter, isYearDisabled]);

  const isPrevMonthDisabled = Boolean(
    minDate && new Date(viewDate.getFullYear(), viewDate.getMonth(), 0) < minDate,
  );

  const isNextMonthDisabled = Boolean(
    maxDate && new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1) > maxDate,
  );

  const isPrevYearDisabled = Boolean(minDate && viewDate.getFullYear() - 1 < minDate.getFullYear());
  const isNextYearDisabled = Boolean(maxDate && viewDate.getFullYear() + 1 > maxDate.getFullYear());
  const isPrevYearsDisabled = Boolean(minDate && yearBlockStart - 1 < minDate.getFullYear());
  const isNextYearsDisabled = Boolean(maxDate && yearBlockStart + 12 > maxDate.getFullYear());

  const handleToggleOpen = () => {
    if (disabled) return;
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    const target = selectedDate ?? clampToBounds(today, minDate, maxDate);
    setViewDate(new Date(target.getFullYear(), target.getMonth(), 1));
    setYearBlockStart(Math.floor(target.getFullYear() / 12) * 12);
    setFocusedDate(target);
    setCalendarView('days');
    pendingGridFocusRef.current = true;
    setIsOpen(true);
  };

  const handleSelectDate = useCallback(
    (date: Date) => {
      if (isDateDisabled(date)) return;
      const normalized = normalizeDay(date);
      if (!isControlled) {
        setUncontrolledValue(normalized);
      }
      onChange?.(normalized, toIsoString(normalized));
      setIsOpen(false);
      triggerRef.current?.focus();
    },
    [isControlled, isDateDisabled, onChange],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isControlled) {
        setUncontrolledValue(null);
      }
      onChange?.(null, '');
      triggerRef.current?.focus();
    },
    [isControlled, onChange],
  );

  const handlePrevMonth = () => {
    if (isPrevMonthDisabled) return;
    const nextView = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    setViewDate(nextView);
    setYearBlockStart(Math.floor(nextView.getFullYear() / 12) * 12);
    setFocusedDate((prev) => clampToBounds(shiftMonthClamped(prev, -1), minDate, maxDate));
  };

  const handleNextMonth = () => {
    if (isNextMonthDisabled) return;
    const nextView = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    setViewDate(nextView);
    setYearBlockStart(Math.floor(nextView.getFullYear() / 12) * 12);
    setFocusedDate((prev) => clampToBounds(shiftMonthClamped(prev, 1), minDate, maxDate));
  };

  const handleOpenMonths = () => {
    if (calendarView === 'months') {
      pendingGridFocusRef.current = true;
      setCalendarView('days');
      return;
    }
    pendingSubViewFocusRef.current = 'months';
    setCalendarView('months');
  };

  const handleOpenYears = () => {
    if (calendarView === 'years') {
      pendingGridFocusRef.current = true;
      setCalendarView('days');
      return;
    }
    setYearBlockStart(Math.floor(viewDate.getFullYear() / 12) * 12);
    pendingSubViewFocusRef.current = 'years';
    setCalendarView('years');
  };

  const handlePrevYear = () => {
    if (isPrevYearDisabled) return;
    const targetYear = viewDate.getFullYear() - 1;
    const clamped = clampToBounds(
      new Date(targetYear, viewDate.getMonth(), Math.min(focusedDate.getDate(), 28)),
      minDate,
      maxDate,
    );
    setViewDate(new Date(clamped.getFullYear(), clamped.getMonth(), 1));
    setYearBlockStart(Math.floor(clamped.getFullYear() / 12) * 12);
    setFocusedDate(clamped);
  };

  const handleNextYear = () => {
    if (isNextYearDisabled) return;
    const targetYear = viewDate.getFullYear() + 1;
    const clamped = clampToBounds(
      new Date(targetYear, viewDate.getMonth(), Math.min(focusedDate.getDate(), 28)),
      minDate,
      maxDate,
    );
    setViewDate(new Date(clamped.getFullYear(), clamped.getMonth(), 1));
    setYearBlockStart(Math.floor(clamped.getFullYear() / 12) * 12);
    setFocusedDate(clamped);
  };

  const handlePrevYears = () => {
    if (isPrevYearsDisabled) return;
    setYearBlockStart((prev) => prev - 12);
  };

  const handleNextYears = () => {
    if (isNextYearsDisabled) return;
    setYearBlockStart((prev) => prev + 12);
  };

  const handleSelectMonth = (monthIndex: number) => {
    if (isMonthDisabled(viewDate.getFullYear(), monthIndex)) return;
    const year = viewDate.getFullYear();
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    const nextFocused = clampToBounds(
      new Date(year, monthIndex, Math.min(focusedDate.getDate(), lastDay)),
      minDate,
      maxDate,
    );
    setViewDate(new Date(year, monthIndex, 1));
    setFocusedDate(nextFocused);
    pendingGridFocusRef.current = true;
    setCalendarView('days');
  };

  const handleSelectYear = (year: number) => {
    if (isYearDisabled(year)) return;
    let targetMonth = viewDate.getMonth();
    if (isMonthDisabled(year, targetMonth)) {
      const firstValidMonth = Array.from({ length: 12 }, (_, idx) => idx).find(
        (idx) => !isMonthDisabled(year, idx),
      );
      if (firstValidMonth !== undefined) {
        targetMonth = firstValidMonth;
      }
    }
    const lastDay = new Date(year, targetMonth + 1, 0).getDate();
    const nextFocused = clampToBounds(
      new Date(year, targetMonth, Math.min(focusedDate.getDate(), lastDay)),
      minDate,
      maxDate,
    );
    setViewDate(new Date(year, targetMonth, 1));
    setFocusedDate(nextFocused);
    pendingSubViewFocusRef.current = 'months';
    setCalendarView('months');
  };

  // Build 42-day matrix (6 week rows x 7 day columns)
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const startDay = new Date(year, month, 1).getDay();
    const days: { date: Date; isOutside: boolean }[] = [];

    const prevMonthDaysCount = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDaysCount - i),
        isOutside: true,
      });
    }

    const currentMonthDaysCount = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= currentMonthDaysCount; i++) {
      days.push({
        date: new Date(year, month, i),
        isOutside: false,
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isOutside: true,
      });
    }

    return days;
  }, [viewDate]);

  const calendarWeeks = useMemo(
    () =>
      Array.from({ length: 6 }, (_, weekIdx) => calendarDays.slice(weekIdx * 7, weekIdx * 7 + 7)),
    [calendarDays],
  );

  const rovingIso = useMemo(() => {
    const focusedIso = toIsoString(focusedDate);
    if (calendarDays.some((day) => toIsoString(day.date) === focusedIso)) {
      return focusedIso;
    }
    const firstCurrentMonth = calendarDays.find((day) => !day.isOutside);
    return toIsoString((firstCurrentMonth ?? calendarDays[0]).date);
  }, [calendarDays, focusedDate]);

  const getIsRtl = () => {
    const dirHost = rootRef.current?.closest('[dir]');
    return (
      (dirHost ? dirHost.getAttribute('dir') : document.documentElement.dir || document.dir) ===
      'rtl'
    );
  };

  const handlePopoverKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      if (calendarView !== 'days') {
        pendingGridFocusRef.current = true;
        setCalendarView('days');
        return;
      }
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (e.key === 'Tab' && popoverRef.current) {
      const focusables = Array.from(
        popoverRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]):not([tabindex="-1"])',
        ),
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const handlePeriodGridKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!periodGridRef.current) return;
    const buttons = Array.from(periodGridRef.current.querySelectorAll<HTMLButtonElement>('button'));
    const activeIdx = buttons.findIndex((btn) => btn === document.activeElement);
    if (activeIdx === -1) return;

    const isRtl = getIsRtl();
    let delta = 0;
    let targetIdx: number | null = null;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        delta = isRtl ? 1 : -1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        delta = isRtl ? -1 : 1;
        break;
      case 'ArrowUp':
        e.preventDefault();
        delta = -3;
        break;
      case 'ArrowDown':
        e.preventDefault();
        delta = 3;
        break;
      case 'Home':
        e.preventDefault();
        targetIdx = 0;
        break;
      case 'End':
        e.preventDefault();
        targetIdx = buttons.length - 1;
        break;
    }

    if (delta !== 0) {
      targetIdx = activeIdx + delta;
    }

    if (targetIdx !== null && targetIdx >= 0 && targetIdx < buttons.length) {
      const candidate = buttons[targetIdx];
      if (!candidate.disabled) {
        candidate.focus({ preventScroll: true });
      }
    }
  };

  const handleGridKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const isRtl = getIsRtl();

    let nextDate: Date | null = null;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        nextDate = new Date(
          focusedDate.getFullYear(),
          focusedDate.getMonth(),
          focusedDate.getDate() + (isRtl ? 1 : -1),
        );
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextDate = new Date(
          focusedDate.getFullYear(),
          focusedDate.getMonth(),
          focusedDate.getDate() + (isRtl ? -1 : 1),
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        nextDate = new Date(
          focusedDate.getFullYear(),
          focusedDate.getMonth(),
          focusedDate.getDate() - 7,
        );
        break;
      case 'ArrowDown':
        e.preventDefault();
        nextDate = new Date(
          focusedDate.getFullYear(),
          focusedDate.getMonth(),
          focusedDate.getDate() + 7,
        );
        break;
      case 'PageUp':
        e.preventDefault();
        nextDate = shiftMonthClamped(focusedDate, -1);
        break;
      case 'PageDown':
        e.preventDefault();
        nextDate = shiftMonthClamped(focusedDate, 1);
        break;
      case 'Home':
        e.preventDefault();
        nextDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
        break;
      case 'End':
        e.preventDefault();
        nextDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isDateDisabled(focusedDate)) {
          handleSelectDate(focusedDate);
        }
        return;
    }

    if (nextDate) {
      pendingGridFocusRef.current = true;
      setFocusedDate(nextDate);
      if (
        nextDate.getMonth() !== viewDate.getMonth() ||
        nextDate.getFullYear() !== viewDate.getFullYear()
      ) {
        setViewDate(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
      }
    }
  };

  const showClear = Boolean(clearable && selectedDate && !disabled);

  return (
    <div
      ref={(node) => {
        rootRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn(styles.root, className)}
      data-size={size}
      data-touch-target={touchTarget}
      data-invalid={isInvalid ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      data-open={isOpen ? 'true' : 'false'}
      data-testid={testId}
    >
      {name && selectedDate ? (
        <input type="hidden" name={name} value={toIsoString(selectedDate)} />
      ) : null}

      <div className={styles.controlWrapper}>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={isOpen ? dialogId : undefined}
          aria-invalid={isInvalid || undefined}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          className={cn(styles.trigger, showClear && styles.triggerClearable)}
          onClick={handleToggleOpen}
        >
          <span className={styles.contentWrapper}>
            <span className={styles.calendarIcon} aria-hidden="true">
              <Icon name="calendar" />
            </span>
            {selectedDate ? (
              <span className={styles.valueText}>{formattedValue}</span>
            ) : (
              <span className={styles.placeholder}>{placeholder}</span>
            )}
          </span>
          <span className={styles.chevronIcon} aria-hidden="true">
            <Icon name="chevron-down" />
          </span>
        </button>

        {showClear ? (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            aria-label={clearLabel}
          >
            <Icon name="close" />
          </button>
        ) : null}
      </div>

      {isOpen ? (
        <div
          ref={popoverRef}
          id={dialogId}
          className={styles.popover}
          role="dialog"
          aria-modal="false"
          aria-label={monthYearLabel}
          tabIndex={-1}
          onKeyDown={handlePopoverKeyDown}
        >
          <div className={styles.header}>
            {calendarView === 'days' ? (
              <>
                <button
                  type="button"
                  className={styles.navButton}
                  disabled={isPrevMonthDisabled}
                  onClick={handlePrevMonth}
                  aria-label={previousMonthLabel}
                >
                  <Icon name="chevron-left" />
                </button>

                <div className={styles.captionGroup}>
                  <button
                    type="button"
                    data-view-trigger="months"
                    className={styles.captionButton}
                    aria-expanded={false}
                    aria-label={
                      selectMonthLabel ? `${selectMonthLabel}: ${monthLabel}` : monthLabel
                    }
                    onClick={handleOpenMonths}
                  >
                    <span>{monthLabel}</span>
                  </button>

                  <button
                    type="button"
                    data-view-trigger="years"
                    className={styles.captionButton}
                    aria-expanded={false}
                    aria-label={selectYearLabel ? `${selectYearLabel}: ${yearLabel}` : yearLabel}
                    onClick={handleOpenYears}
                  >
                    <span className={styles.yearDigits}>{yearLabel}</span>
                  </button>
                </div>

                <button
                  type="button"
                  className={styles.navButton}
                  disabled={isNextMonthDisabled}
                  onClick={handleNextMonth}
                  aria-label={nextMonthLabel}
                >
                  <Icon name="chevron-right" />
                </button>
              </>
            ) : calendarView === 'months' ? (
              <>
                <button
                  type="button"
                  className={styles.navButton}
                  disabled={isPrevYearDisabled}
                  onClick={handlePrevYear}
                  aria-label={previousYearLabel ?? previousMonthLabel}
                >
                  <Icon name="chevron-left" />
                </button>

                <div className={styles.captionGroup}>
                  <button
                    type="button"
                    data-view-trigger="months"
                    className={styles.captionButton}
                    aria-expanded={true}
                    aria-label={
                      selectMonthLabel ? `${selectMonthLabel}: ${monthLabel}` : monthLabel
                    }
                    onClick={handleOpenMonths}
                  >
                    <span>{monthLabel}</span>
                  </button>

                  <button
                    type="button"
                    data-view-trigger="years"
                    className={styles.captionButton}
                    aria-expanded={false}
                    aria-label={selectYearLabel ? `${selectYearLabel}: ${yearLabel}` : yearLabel}
                    onClick={handleOpenYears}
                  >
                    <span className={styles.yearDigits}>{yearLabel}</span>
                  </button>
                </div>

                <button
                  type="button"
                  className={styles.navButton}
                  disabled={isNextYearDisabled}
                  onClick={handleNextYear}
                  aria-label={nextYearLabel ?? nextMonthLabel}
                >
                  <Icon name="chevron-right" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={styles.navButton}
                  disabled={isPrevYearsDisabled}
                  onClick={handlePrevYears}
                  aria-label={previousYearsLabel ?? previousYearLabel ?? previousMonthLabel}
                >
                  <Icon name="chevron-left" />
                </button>

                <div className={styles.captionGroup}>
                  <button
                    type="button"
                    data-view-trigger="months"
                    className={styles.captionButton}
                    aria-expanded={false}
                    aria-label={
                      selectMonthLabel ? `${selectMonthLabel}: ${monthLabel}` : monthLabel
                    }
                    onClick={handleOpenMonths}
                  >
                    <span>{monthLabel}</span>
                  </button>

                  <button
                    type="button"
                    data-view-trigger="years"
                    className={styles.captionButton}
                    aria-expanded={true}
                    aria-label={
                      selectYearLabel ? `${selectYearLabel}: ${yearRangeLabel}` : yearRangeLabel
                    }
                    onClick={handleOpenYears}
                  >
                    <span dir="ltr" className={styles.yearDigits}>
                      {yearRangeLabel}
                    </span>
                  </button>
                </div>

                <button
                  type="button"
                  className={styles.navButton}
                  disabled={isNextYearsDisabled}
                  onClick={handleNextYears}
                  aria-label={nextYearsLabel ?? nextYearLabel ?? nextMonthLabel}
                >
                  <Icon name="chevron-right" />
                </button>
              </>
            )}
          </div>

          {calendarView === 'days' ? (
            <div
              ref={gridRef}
              role="grid"
              aria-label={monthYearLabel}
              className={styles.grid}
              onKeyDown={handleGridKeyDown}
            >
              <div role="row" className={styles.weekRow}>
                {weekdayLabels.map((day, idx) => (
                  <div key={`${idx}-${day}`} role="columnheader" className={styles.weekday}>
                    {day}
                  </div>
                ))}
              </div>

              {calendarWeeks.map((week, weekIdx) => (
                <div key={weekIdx} role="row" className={styles.weekRow}>
                  {week.map(({ date, isOutside }) => {
                    const iso = toIsoString(date);
                    const isSelected = isSameDay(date, selectedDate);
                    const isCurrentDay = isSameDay(date, today);
                    const isDisabled = isDateDisabled(date);
                    const isRovingFocus = iso === rovingIso;

                    return (
                      <div key={iso} role="gridcell" className={styles.dayCell}>
                        <button
                          type="button"
                          data-date={iso}
                          tabIndex={isRovingFocus ? 0 : -1}
                          aria-disabled={isDisabled || undefined}
                          aria-selected={isSelected}
                          aria-current={isCurrentDay ? 'date' : undefined}
                          aria-label={dayAriaFormatter.format(date)}
                          className={cn(
                            styles.dayButton,
                            isOutside && styles.outsideMonth,
                            isCurrentDay && styles.today,
                            isSelected && styles.selected,
                          )}
                          onClick={() => handleSelectDate(date)}
                        >
                          {date.getDate()}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : calendarView === 'months' ? (
            <div
              ref={periodGridRef}
              role="group"
              aria-label={selectMonthLabel ?? monthLabel}
              className={styles.periodGrid}
              onKeyDown={handlePeriodGridKeyDown}
            >
              {monthItems.map((item) => {
                const isActiveMonth = item.month === viewDate.getMonth();
                const isThisMonth =
                  item.month === today.getMonth() && viewDate.getFullYear() === today.getFullYear();

                return (
                  <button
                    key={item.month}
                    type="button"
                    data-month={item.month}
                    disabled={item.disabled}
                    aria-pressed={isActiveMonth}
                    aria-current={isThisMonth ? 'date' : undefined}
                    aria-label={item.ariaLabel}
                    className={cn(
                      styles.periodButton,
                      isThisMonth && styles.today,
                      isActiveMonth && styles.selected,
                    )}
                    onClick={() => handleSelectMonth(item.month)}
                  >
                    {item.shortLabel}
                  </button>
                );
              })}
            </div>
          ) : (
            <div
              ref={periodGridRef}
              role="group"
              aria-label={selectYearLabel ?? yearRangeLabel}
              className={styles.periodGrid}
              onKeyDown={handlePeriodGridKeyDown}
            >
              {yearItems.map((item) => {
                const isActiveYear = item.year === viewDate.getFullYear();
                const isThisYear = item.year === today.getFullYear();

                return (
                  <button
                    key={item.year}
                    type="button"
                    data-year={item.year}
                    disabled={item.disabled}
                    aria-pressed={isActiveYear}
                    aria-current={isThisYear ? 'date' : undefined}
                    className={cn(
                      styles.periodButton,
                      styles.yearDigits,
                      isThisYear && styles.today,
                      isActiveYear && styles.selected,
                    )}
                    onClick={() => handleSelectYear(item.year)}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
});
