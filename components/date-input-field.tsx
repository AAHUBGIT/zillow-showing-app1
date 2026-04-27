"use client";

import { useEffect, useId, useRef, useState } from "react";
import { formatDateForManualEntry, parseManualDateInput } from "@/lib/date";

type DateInputFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  ariaLabel?: string;
  dataField?: string;
  labelClassName?: string;
};

export function DateInputField({
  label,
  value,
  onChange,
  name,
  required = false,
  error,
  helperText = "Use MM/DD/YYYY",
  ariaLabel,
  dataField,
  labelClassName = "text-sm font-medium text-slate-700"
}: DateInputFieldProps) {
  const inputId = useId();
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const inputRef = useRef<HTMLInputElement>(null);
  const nativeDateRef = useRef<HTMLInputElement>(null);
  const [dateText, setDateText] = useState(formatDateForManualEntry(value));
  const [localError, setLocalError] = useState("");
  const visibleError = localError || error;

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setDateText(formatDateForManualEntry(value));
      setLocalError("");
    }
  }, [value]);

  function openPicker() {
    const input = nativeDateRef.current;

    if (!input) {
      return;
    }

    const pickerInput = input as HTMLInputElement & { showPicker?: () => void };
    if (typeof pickerInput.showPicker === "function") {
      pickerInput.showPicker();
      return;
    }

    inputRef.current?.focus({ preventScroll: true });
  }

  function commitDate(nextText = dateText) {
    const trimmed = nextText.trim();

    if (!trimmed) {
      setDateText("");
      setLocalError("");
      onChange("");
      return true;
    }

    const parsed = parseManualDateInput(trimmed);

    if (parsed === null) {
      setLocalError("Use MM/DD/YYYY.");
      onChange("");
      return false;
    }

    setDateText(formatDateForManualEntry(parsed));
    setLocalError("");
    onChange(parsed);
    return true;
  }

  function handleTextChange(nextText: string) {
    setDateText(nextText);

    if (!nextText.trim()) {
      setLocalError("");
      onChange("");
      return;
    }

    const parsed = parseManualDateInput(nextText);
    if (parsed) {
      setLocalError("");
      onChange(parsed);
    } else if (localError) {
      setLocalError("");
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={inputId} className={labelClassName}>
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          required={required}
          placeholder="MM/DD/YYYY"
          value={dateText}
          data-field={dataField || name}
          aria-label={ariaLabel || label}
          aria-invalid={Boolean(visibleError)}
          aria-describedby={visibleError ? `${helpId} ${errorId}` : helpId}
          onChange={(event) => handleTextChange(event.target.value)}
          onBlur={() => commitDate()}
          className={`app-input app-date-input pr-14 ${
            visibleError ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""
          }`}
        />
        <button
          type="button"
          onClick={openPicker}
          className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line/80 bg-slate-50 text-slate-500 transition hover:border-accent hover:text-accent focus:border-accent focus:text-accent focus:ring-4 focus:ring-accent/15"
          aria-label={`Open ${ariaLabel || label} calendar`}
        >
          <CalendarIcon />
        </button>
      </div>
      <input
        ref={nativeDateRef}
        type="date"
        tabIndex={-1}
        name={name}
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;
          setDateText(formatDateForManualEntry(nextValue));
          setLocalError("");
          onChange(nextValue);
          inputRef.current?.focus({ preventScroll: true });
        }}
        className="sr-only"
        aria-hidden="true"
      />
      <p id={helpId} className="text-xs text-slate-500">
        {helperText}
      </p>
      <p id={errorId} className="min-h-[1.25rem] text-xs font-medium text-rose-600" aria-live="polite">
        {visibleError || ""}
      </p>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M7 2v3M17 2v3M3.5 9.5h17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="3.5" y="4.5" width="17" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
