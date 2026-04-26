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
  isPastDate,
  parseManualDateInput
} from "@/lib/date";
import { isTwentyFourHourTime } from "@/lib/form-validation";

export type DateTimePickerHandle = {
  validate: () => boolean;
  getValues: () => { date: string; time: string };
  focusDate: () => void;
};

type DateTimePickerState = {
  date: string;
  time: string;
  isValid: boolean;
  isPastDate: boolean;
};

type DateTimePickerFieldsProps = {
  dateName: string;
  timeName: string;
  allowPastDateOverrideName?: string;
  dateLabel: string;
  timeLabel: string;
  dateAriaLabel: string;
  timeAriaLabel: string;
  initialDate?: string;
  initialTime?: string;
  helperText?: string;
  timeStep?: number;
  onValueChange?: (values: DateTimePickerState) => void;
};

export const DateTimePickerFields = forwardRef<DateTimePickerHandle, DateTimePickerFieldsProps>(
  function DateTimePickerFields(
    {
      dateName,
      timeName,
      allowPastDateOverrideName = `${dateName}AllowPastOverride`,
      dateLabel,
      timeLabel,
      dateAriaLabel,
      timeAriaLabel,
      initialDate = "",
      initialTime = "",
      helperText = "Format: MM/DD/YYYY. Type directly or use the calendar.",
      timeStep = 300,
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
    const datePickerButtonRef = useRef<HTMLButtonElement>(null);
    const timePickerButtonRef = useRef<HTMLButtonElement>(null);
    const openedDatePickerRef = useRef(false);
    const openedTimePickerRef = useRef(false);
    const [dateText, setDateText] = useState(formatDateForManualEntry(initialDate));
    const [dateValue, setDateValue] = useState(initialDate);
    const [timeValue, setTimeValue] = useState(initialTime);
    const [dateError, setDateError] = useState("");
    const [timeError, setTimeError] = useState("");
    const [allowPastDateOverride, setAllowPastDateOverride] = useState(isPastDate(initialDate));

    const isDateInPast = Boolean(dateValue) && isPastDate(dateValue);
    const showPastDateWarning = isDateInPast && !allowPastDateOverride;
    const isSchedulePairValid =
      (!dateValue && !timeValue && !dateText.trim()) ||
      (Boolean(dateValue) && Boolean(timeValue) && !dateError && !timeError && !showPastDateWarning);
    const timePreview = formatTimeForManualEntry(timeValue);

    useEffect(() => {
      onValueChange?.({
        date: dateValue,
        time: timeValue,
        isValid: isSchedulePairValid,
        isPastDate: isDateInPast
      });
    }, [dateValue, isDateInPast, isSchedulePairValid, onValueChange, timeValue]);

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
      if (!isPastDate(parsed)) {
        setAllowPastDateOverride(false);
      }
      return true;
    }

    function commitTime(nextValue = timeValue) {
      if (!nextValue) {
        setTimeError("");
        return true;
      }

      if (!isTwentyFourHourTime(nextValue)) {
        setTimeError("Choose a valid time from the time picker.");
        return false;
      }

      setTimeError("");
      return true;
    }

    function validate() {
      const isDateValid = commitDate();
      const isTimeValid = commitTime();
      const nextDateValue = parseManualDateInput(dateText);
      const nextTimeValue = timeValue;
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

      if (hasDate && isPastDate(nextDateValue || "") && !allowPastDateOverride) {
        setDateError("Past showing dates need confirmation before saving.");
        isValid = false;
      }

      return isValid;
    }

    function openPicker(input: HTMLInputElement | null) {
      if (!input) {
        return false;
      }

      const pickerInput = input as HTMLInputElement & { showPicker?: () => void };

      if (typeof pickerInput.showPicker === "function") {
        pickerInput.showPicker();
        return true;
      }

      input.focus();
      return false;
    }

    function openDatePicker() {
      openedDatePickerRef.current = openPicker(nativeDateRef.current);
    }

    function openTimePicker() {
      openedTimePickerRef.current = openPicker(nativeTimeRef.current);
    }

    useImperativeHandle(
      ref,
      () => ({
        validate,
        getValues: () => ({ date: dateValue, time: timeValue }),
        focusDate: () => manualDateRef.current?.focus()
      }),
      [allowPastDateOverride, dateText, dateValue, timeValue]
    );

    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-end justify-between gap-3">
            <label htmlFor={dateInputId} className="text-sm font-medium text-slate-700">
              {dateLabel}
            </label>
          </div>
          <div className="relative">
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
                  setAllowPastDateOverride(false);
                }
              }}
              aria-label={dateAriaLabel}
              aria-invalid={Boolean(dateError)}
              aria-describedby={dateError ? `${dateHelperId} ${dateErrorId}` : dateHelperId}
              className={`app-input pr-14 ${dateError ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
            />
            <button
              ref={datePickerButtonRef}
              type="button"
              onClick={openDatePicker}
              className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line/80 bg-slate-50 text-slate-500 transition hover:border-accent hover:text-accent focus:border-accent focus:text-accent focus:ring-4 focus:ring-accent/15"
              aria-label={`Open ${dateAriaLabel} picker`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <path d="M7 2v3M17 2v3M3.5 9.5h17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <rect x="3.5" y="4.5" width="17" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </button>
          </div>
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
              if (openedDatePickerRef.current) {
                openedDatePickerRef.current = false;
                nativeDateRef.current?.blur();
                datePickerButtonRef.current?.focus({ preventScroll: true });
              }
            }}
            name={dateName}
            className="sr-only"
            aria-hidden="true"
          />
          <input
            type="hidden"
            name={allowPastDateOverrideName}
            value={allowPastDateOverride ? "true" : "false"}
          />
          <p id={dateHelperId} className="text-xs text-slate-500">
            {helperText}
          </p>
          {isDateInPast ? (
            <label className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/80 px-3 py-3 text-xs leading-5 text-amber-900">
              <input
                type="checkbox"
                checked={allowPastDateOverride}
                onChange={(event) => {
                  setAllowPastDateOverride(event.target.checked);
                  if (event.target.checked && dateError === "Past showing dates need confirmation before saving.") {
                    setDateError("");
                  }
                }}
                className="mt-0.5 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-200"
                aria-label="Allow past showing date"
              />
              <span>
                This showing date is in the past. Check this only if you want to save a historical
                showing.
              </span>
            </label>
          ) : null}
          <p id={dateErrorId} className="min-h-[1.25rem] text-xs font-medium text-rose-600" aria-live="polite">
            {dateError}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-end justify-between gap-3">
            <label htmlFor={timeInputId} className="text-sm font-medium text-slate-700">
              {timeLabel}
            </label>
          </div>
          <div className="relative">
            <input
              ref={nativeTimeRef}
              id={timeInputId}
              type="time"
              name={timeName}
              step={timeStep}
              value={timeValue}
              onChange={(event) => {
                setTimeValue(event.target.value);
                setTimeError("");
                if (openedTimePickerRef.current) {
                  openedTimePickerRef.current = false;
                  nativeTimeRef.current?.blur();
                  timePickerButtonRef.current?.focus({ preventScroll: true });
                }
              }}
              onBlur={(event) => {
                openedTimePickerRef.current = false;
                commitTime(event.target.value);
              }}
              aria-label={timeAriaLabel}
              aria-invalid={Boolean(timeError)}
              aria-describedby={timeError ? `${timeHelperId} ${timeErrorId}` : timeHelperId}
              className={`app-input pr-14 ${timeError ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
            />
            <button
              ref={timePickerButtonRef}
              type="button"
              onClick={openTimePicker}
              className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line/80 bg-slate-50 text-slate-500 transition hover:border-accent hover:text-accent focus:border-accent focus:text-accent focus:ring-4 focus:ring-accent/15"
              aria-label={`Open ${timeAriaLabel} picker`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <p id={timeHelperId} className="text-xs text-slate-500">
            Use the browser time picker or type directly. Invalid times like 25:61 are blocked.
          </p>
          {timePreview ? (
            <p className="text-xs font-medium text-slate-500">Selected time: {timePreview}</p>
          ) : null}
          <p id={timeErrorId} className="min-h-[1.25rem] text-xs font-medium text-rose-600" aria-live="polite">
            {timeError}
          </p>
        </div>
      </div>
    );
  }
);
