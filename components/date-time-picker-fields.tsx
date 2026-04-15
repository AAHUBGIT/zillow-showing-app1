"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState
} from "react";
import {
  formatDateForManualEntry,
  formatTimeForManualEntry,
  parseManualDateInput,
  parseManualTimeInput
} from "@/lib/date";

export type DateTimePickerHandle = {
  validate: () => boolean;
  getValues: () => { date: string; time: string };
  focusDate: () => void;
};

type DateTimePickerFieldsProps = {
  dateName: string;
  timeName: string;
  dateLabel: string;
  timeLabel: string;
  dateAriaLabel: string;
  timeAriaLabel: string;
  initialDate?: string;
  initialTime?: string;
  helperText?: string;
  onValueChange?: (values: { date: string; time: string }) => void;
};

export const DateTimePickerFields = forwardRef<DateTimePickerHandle, DateTimePickerFieldsProps>(
  function DateTimePickerFields(
    {
      dateName,
      timeName,
      dateLabel,
      timeLabel,
      dateAriaLabel,
      timeAriaLabel,
      initialDate = "",
      initialTime = "",
      helperText = "Type the value or use the browser picker.",
      onValueChange
    },
    ref
  ) {
    const dateInputId = useId();
    const timeInputId = useId();
    const dateErrorId = `${dateInputId}-error`;
    const timeErrorId = `${timeInputId}-error`;
    const dateHelperId = `${dateInputId}-help`;
    const timeHelperId = `${timeInputId}-help`;
    const nativeDateRef = useRef<HTMLInputElement>(null);
    const nativeTimeRef = useRef<HTMLInputElement>(null);
    const manualDateRef = useRef<HTMLInputElement>(null);
    const [dateText, setDateText] = useState(formatDateForManualEntry(initialDate));
    const [timeText, setTimeText] = useState(formatTimeForManualEntry(initialTime));
    const [dateValue, setDateValue] = useState(initialDate);
    const [timeValue, setTimeValue] = useState(initialTime);
    const [dateError, setDateError] = useState("");
    const [timeError, setTimeError] = useState("");

    useEffect(() => {
      onValueChange?.({ date: dateValue, time: timeValue });
    }, [dateValue, onValueChange, timeValue]);

    function commitDate(nextText = dateText) {
      const parsed = parseManualDateInput(nextText);

      if (parsed === null) {
        setDateValue("");
        setDateError("Use MM/DD/YYYY.");
        return false;
      }

      setDateValue(parsed);
      setDateError("");
      setDateText(formatDateForManualEntry(parsed));
      return true;
    }

    function commitTime(nextText = timeText) {
      const parsed = parseManualTimeInput(nextText);

      if (parsed === null) {
        setTimeValue("");
        setTimeError("Use h:mm AM/PM.");
        return false;
      }

      setTimeValue(parsed);
      setTimeError("");
      setTimeText(formatTimeForManualEntry(parsed));
      return true;
    }

    function validate() {
      const isDateValid = commitDate();
      const isTimeValid = commitTime();
      const nextDateValue = parseManualDateInput(dateText);
      const nextTimeValue = parseManualTimeInput(timeText);
      const hasDate = Boolean(nextDateValue);
      const hasTime = Boolean(nextTimeValue);
      let isValid = isDateValid && isTimeValid;

      if (hasDate && !hasTime) {
        setTimeError("Add a showing time to match the showing date.");
        isValid = false;
      }

      if (hasTime && !hasDate) {
        setDateError("Add a showing date to match the showing time.");
        isValid = false;
      }

      return isValid;
    }

    function openPicker(input: HTMLInputElement | null) {
      if (!input) {
        return;
      }

      const pickerInput = input as HTMLInputElement & { showPicker?: () => void };

      if (typeof pickerInput.showPicker === "function") {
        pickerInput.showPicker();
        return;
      }

      input.focus();
    }

    useImperativeHandle(
      ref,
      () => ({
        validate,
        getValues: () => ({ date: dateValue, time: timeValue }),
        focusDate: () => manualDateRef.current?.focus()
      }),
      [dateText, dateValue, timeText, timeValue]
    );

    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-end justify-between gap-3">
            <label htmlFor={dateInputId} className="text-sm font-medium text-slate-700">
              {dateLabel}
            </label>
            <button
              type="button"
              onClick={() => openPicker(nativeDateRef.current)}
              className="text-xs font-semibold uppercase tracking-[0.18em] text-accent transition hover:text-ink"
              aria-label={`Open ${dateAriaLabel} picker`}
            >
              Use picker
            </button>
          </div>
          <input
            ref={manualDateRef}
            id={dateInputId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="MM/DD/YYYY"
            value={dateText}
            onChange={(event) => {
              setDateText(event.target.value);
              if (dateError) {
                setDateError("");
              }
            }}
            onBlur={() => {
              if (dateText.trim()) {
                commitDate();
              } else {
                setDateValue("");
                setDateError("");
              }
            }}
            aria-label={dateAriaLabel}
            aria-invalid={Boolean(dateError)}
            aria-describedby={dateError ? `${dateHelperId} ${dateErrorId}` : dateHelperId}
            className={`app-input ${dateError ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
          />
          <input
            ref={nativeDateRef}
            type="date"
            tabIndex={-1}
            value={dateValue}
            onChange={(event) => {
              const nextValue = event.target.value;
              setDateValue(nextValue);
              setDateText(formatDateForManualEntry(nextValue));
              setDateError("");
            }}
            name={dateName}
            className="sr-only"
            aria-hidden="true"
          />
          <p id={dateHelperId} className="text-xs text-slate-500">
            {helperText}
          </p>
          <p id={dateErrorId} className="min-h-[1.25rem] text-xs font-medium text-rose-600" aria-live="polite">
            {dateError}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-end justify-between gap-3">
            <label htmlFor={timeInputId} className="text-sm font-medium text-slate-700">
              {timeLabel}
            </label>
            <button
              type="button"
              onClick={() => openPicker(nativeTimeRef.current)}
              className="text-xs font-semibold uppercase tracking-[0.18em] text-accent transition hover:text-ink"
              aria-label={`Open ${timeAriaLabel} picker`}
            >
              Use picker
            </button>
          </div>
          <input
            id={timeInputId}
            type="text"
            inputMode="text"
            autoComplete="off"
            placeholder="9:30 AM"
            value={timeText}
            onChange={(event) => {
              setTimeText(event.target.value);
              if (timeError) {
                setTimeError("");
              }
            }}
            onBlur={() => {
              if (timeText.trim()) {
                commitTime();
              } else {
                setTimeValue("");
                setTimeError("");
              }
            }}
            aria-label={timeAriaLabel}
            aria-invalid={Boolean(timeError)}
            aria-describedby={timeError ? `${timeHelperId} ${timeErrorId}` : timeHelperId}
            className={`app-input ${timeError ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
          />
          <input
            ref={nativeTimeRef}
            type="time"
            step={60}
            tabIndex={-1}
            value={timeValue}
            onChange={(event) => {
              const nextValue = event.target.value;
              setTimeValue(nextValue);
              setTimeText(formatTimeForManualEntry(nextValue));
              setTimeError("");
            }}
            name={timeName}
            className="sr-only"
            aria-hidden="true"
          />
          <p id={timeHelperId} className="text-xs text-slate-500">
            Type h:mm AM/PM or use the browser time picker.
          </p>
          <p id={timeErrorId} className="min-h-[1.25rem] text-xs font-medium text-rose-600" aria-live="polite">
            {timeError}
          </p>
        </div>
      </div>
    );
  }
);
